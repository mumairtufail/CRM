<?php

namespace App\Http\Controllers;

use App\Models\EmailCampaign;
use App\Models\EmailSend;
use App\Models\Lead;
use App\Services\MailService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CampaignController extends Controller
{
    public function index()
    {
        $campaigns = EmailCampaign::latest()->get()->map(fn ($c) => [
            'id'                 => $c->id,
            'name'               => $c->name,
            'subject'            => $c->subject,
            'status'             => $c->status,
            'from_name'          => $c->from_name,
            'from_email'         => $c->from_email,
            'total_recipients'   => $c->total_recipients,
            'sent_count'         => $c->sent_count,
            'opened_count'       => $c->opened_count,
            'clicked_count'      => $c->clicked_count,
            'sent_at'            => $c->sent_at?->diffForHumans(),
            'created_at'         => $c->created_at->diffForHumans(),
        ]);

        return Inertia::render('Campaigns/Index', ['campaigns' => $campaigns]);
    }

    public function create()
    {
        $statuses  = Lead::distinct()->pluck('status')->filter()->values();
        $leadCount = Lead::count();

        return Inertia::render('Campaigns/Create', [
            'statuses'  => $statuses,
            'leadCount' => $leadCount,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:200',
            'subject'    => 'required|string|max:500',
            'from_name'  => 'required|string|max:100',
            'from_email' => 'required|email|max:200',
            'body_html'  => 'required|string',
            'filters'    => 'nullable|array',
        ]);

        $count = $this->countRecipients($validated['filters'] ?? []);

        $campaign = EmailCampaign::create([
            ...$validated,
            'total_recipients' => $count,
            'status'           => 'draft',
        ]);

        return redirect()->route('campaigns.show', $campaign);
    }

    public function show(EmailCampaign $campaign)
    {
        return Inertia::render('Campaigns/Show', [
            'campaign' => [
                'id'                 => $campaign->id,
                'name'               => $campaign->name,
                'subject'            => $campaign->subject,
                'from_name'          => $campaign->from_name,
                'from_email'         => $campaign->from_email,
                'body_html'          => $campaign->body_html,
                'status'             => $campaign->status,
                'filters'            => $campaign->filters,
                'total_recipients'   => $campaign->total_recipients,
                'sent_count'         => $campaign->sent_count,
                'opened_count'       => $campaign->opened_count,
                'clicked_count'      => $campaign->clicked_count,
                'sent_at'            => $campaign->sent_at?->format('M d, Y H:i'),
                'created_at'         => $campaign->created_at->format('M d, Y'),
            ],
        ]);
    }

    public function send(Request $request, EmailCampaign $campaign)
    {
        if ($campaign->status === 'sent') {
            return back()->withErrors(['error' => 'Campaign has already been sent.']);
        }

        $user    = $request->user();
        $mailer  = MailService::forUser($user);

        if (!$mailer) {
            return back()->withErrors([
                'error' => 'No active SMTP account. Go to Settings → SMTP and activate one first.',
            ]);
        }

        $batchSize  = $user->mail_batch_size  ?? 10;
        $batchDelay = $user->mail_batch_delay ?? 5;

        $campaign->update(['status' => 'sending']);

        $result = $mailer->sendCampaign($campaign, $batchSize, $batchDelay);

        $campaign->update([
            'status'     => 'sent',
            'sent_count' => $result['sent'],
            'sent_at'    => now(),
        ]);

        $msg = "Sent {$result['sent']} emails";
        if ($result['failed'])  $msg .= ", {$result['failed']} failed";
        if ($result['skipped']) $msg .= ", {$result['skipped']} skipped";

        return redirect()->route('campaigns.show', $campaign)->with('success', $msg);
    }

    public function recipientCount(Request $request)
    {
        $count = $this->countRecipients($request->input('filters', []));
        return response()->json(['count' => $count]);
    }

    private function countRecipients(array $filters): int
    {
        $query = Lead::query();
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (!empty($filters['tag_id'])) {
            $query->whereHas('tags', fn ($q) => $q->where('tags.id', $filters['tag_id']));
        }
        return $query->count();
    }
}
