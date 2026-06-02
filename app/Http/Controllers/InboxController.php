<?php

namespace App\Http\Controllers;

use App\Jobs\FetchEmailsJob;
use App\Models\FetchedEmail;
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
            'starred' => $query->starred(),
            'trash'   => $query->trashed(),
            default   => $query->inbox(),
        };

        $emails = $query->select([
            'id', 'from_name', 'from_email', 'subject',
            'body_text', 'is_read', 'is_starred', 'is_trashed', 'sent_at',
        ])->paginate(30)->through(fn ($e) => [
            'id'         => $e->id,
            'from_name'  => $e->from_name,
            'from_email' => $e->from_email,
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
            'starred' => FetchedEmail::starred()->count(),
            'trash'   => FetchedEmail::trashed()->count(),
        ];

        return Inertia::render('Inbox/Index', [
            'emails'     => $emails,
            'folder'     => $folder,
            'counts'     => $counts,
            'hasSmtp'    => (bool) $cred,
            'hasImap'    => $cred ? $cred->hasImap() : false,
            'credential' => $cred ? [
                'id'              => $cred->id,
                'name'            => $cred->name,
                'from_email'      => $cred->from_email,
                'last_fetched_at' => $cred->last_fetched_at?->toISOString(),
            ] : null,
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

        try {
            FetchEmailsJob::dispatchSync($orgId, $cred->id);
        } catch (\Throwable $e) {
            \Log::channel('inbox')->error("[org:{$orgId}] Sync failed via HTTP", ['error' => $e->getMessage()]);
            return response()->json([
                'ok'    => false,
                'error' => 'IMAP error: ' . $e->getMessage(),
            ], 422);
        }

        $fetched = FetchedEmail::where('smtp_credential_id', $cred->id)->count();

        return response()->json([
            'ok'      => true,
            'message' => "Sync complete — {$fetched} emails in your inbox.",
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
}
