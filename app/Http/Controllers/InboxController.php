<?php

namespace App\Http\Controllers;

use App\Jobs\FetchEmailsJob;
use App\Models\FetchedEmail;
use App\Services\MailService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InboxController extends Controller
{
    public function index(Request $request)
    {
        $user   = $request->user();
        $cred   = $user->smtpCredentials()->where('is_active', true)->first();
        $folder = $request->get('folder', 'inbox');

        $query = FetchedEmail::orderBy('sent_at', 'desc');

        match ($folder) {
            'sent'    => $query->sent(),
            'starred' => $query->starred(),
            'trash'   => $query->trashed(),
            default   => $query->inbox(),
        };

        $emails = $query->select([
            'id', 'folder', 'from_name', 'from_email', 'to_addresses', 'subject',
            'body_text', 'is_read', 'is_starred', 'is_trashed', 'sent_at',
        ])->paginate(30)->through(fn ($e) => [
            'id'         => $e->id,
            'folder'     => $e->folder,
            'from_name'  => $e->from_name,
            'from_email' => $e->from_email,
            'to'         => $e->to_addresses[0] ?? null,
            'subject'    => $e->subject,
            'snippet'    => $e->body_text ? mb_substr(strip_tags($e->body_text), 0, 120) : '',
            'is_read'    => $e->is_read,
            'is_starred' => $e->is_starred,
            'is_trashed' => $e->is_trashed,
            'sent_at'    => $e->sent_at?->toISOString(),
        ]);

        $counts = [
            'inbox'   => FetchedEmail::inbox()->count(),
            'unread'  => FetchedEmail::inbox()->unread()->count(),
            'sent'    => FetchedEmail::sent()->count(),
            'starred' => FetchedEmail::starred()->count(),
            'trash'   => FetchedEmail::trashed()->count(),
        ];

        $activeTemplate = null;
        if ($user->active_template_id) {
            $t = $user->activeEmailTemplate;
            if ($t) {
                $activeTemplate = ['id' => $t->id, 'name' => $t->name];
            }
        }

        return Inertia::render('Inbox/Index', [
            'emails'         => $emails,
            'folder'         => $folder,
            'counts'         => $counts,
            'hasSmtp'        => (bool) $cred,
            'hasImap'        => $cred ? $cred->hasImap() : false,
            'credential'     => $cred ? [
                'id'              => $cred->id,
                'name'            => $cred->name,
                'from_email'      => $cred->from_email,
                'last_fetched_at' => $cred->last_fetched_at?->toISOString(),
            ] : null,
            'activeTemplate' => $activeTemplate,
        ]);
    }

    public function show(FetchedEmail $fetchedEmail)
    {
        if (!$fetchedEmail->is_read) {
            $fetchedEmail->update(['is_read' => true]);
        }

        return response()->json([
            'id'           => $fetchedEmail->id,
            'from_name'    => $fetchedEmail->from_name,
            'from_email'   => $fetchedEmail->from_email,
            'to_addresses' => $fetchedEmail->to_addresses,
            'cc_addresses' => $fetchedEmail->cc_addresses,
            'subject'      => $fetchedEmail->subject,
            'body_html'    => $fetchedEmail->body_html,
            'body_text'    => $fetchedEmail->body_text,
            'is_read'      => true,
            'is_starred'   => $fetchedEmail->is_starred,
            'is_trashed'   => $fetchedEmail->is_trashed,
            'sent_at'      => $fetchedEmail->sent_at?->toISOString(),
        ]);
    }

    public function sync(Request $request)
    {
        $cred = $request->user()->smtpCredentials()->where('is_active', true)->first();

        if (!$cred) {
            return response()->json([
                'ok'    => false,
                'error' => 'No active SMTP account configured. Go to Settings → SMTP to add one.',
            ], 422);
        }

        if (!$cred->hasImap()) {
            return response()->json([
                'ok'    => false,
                'error' => 'IMAP not configured for this account. Edit your SMTP account in Settings → SMTP and fill in the IMAP fields.',
            ], 422);
        }

        $orgId = $request->user()->organization_id;

        FetchEmailsJob::dispatch($orgId, $cred->id);

        return response()->json([
            'ok'      => true,
            'message' => 'Sync started — your inbox will update shortly.',
        ]);
    }

    public function syncStatus(Request $request)
    {
        $cred = $request->user()->smtpCredentials()->where('is_active', true)->first();
        return response()->json([
            'last_fetched_at' => $cred?->last_fetched_at?->toISOString(),
        ]);
    }

    public function markRead(FetchedEmail $fetchedEmail)
    {
        $fetchedEmail->update(['is_read' => !$fetchedEmail->is_read]);
        return response()->json(['ok' => true, 'is_read' => $fetchedEmail->is_read]);
    }

    public function markStarred(FetchedEmail $fetchedEmail)
    {
        $fetchedEmail->update(['is_starred' => !$fetchedEmail->is_starred]);
        return response()->json(['ok' => true, 'is_starred' => $fetchedEmail->is_starred]);
    }

    public function trash(FetchedEmail $fetchedEmail)
    {
        $fetchedEmail->update(['is_trashed' => true]);
        return response()->json(['ok' => true]);
    }

    public function restore(FetchedEmail $fetchedEmail)
    {
        $fetchedEmail->update(['is_trashed' => false]);
        return response()->json(['ok' => true]);
    }

    public function destroy(FetchedEmail $fetchedEmail)
    {
        $fetchedEmail->delete();
        return response()->json(['ok' => true]);
    }

    public function send(Request $request)
    {
        $request->validate([
            'to_email'  => 'required|email|max:255',
            'subject'   => 'required|string|max:500',
            'body_html' => 'required|string',
        ]);

        $mailer = MailService::forUser($request->user());

        if (!$mailer) {
            return response()->json([
                'ok'    => false,
                'error' => 'No active SMTP account. Go to Settings → SMTP and activate one first.',
            ], 422);
        }

        try {
            $mailer->sendCompose(
                $request->to_email,
                $request->subject,
                $request->body_html,
            );
        } catch (\Throwable $e) {
            return response()->json([
                'ok'    => false,
                'error' => 'Send failed: ' . $e->getMessage(),
            ], 422);
        }

        return response()->json(['ok' => true]);
    }
}
