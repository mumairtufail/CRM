<?php

namespace App\Http\Controllers;

use App\Jobs\SendCampaignBatch;
use App\Models\EmailCampaign;
use App\Models\EmailSend;
use App\Models\Lead;
use App\Models\LeadGroup;
use App\Models\Tag;
use App\Services\MailService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CampaignController extends Controller
{
    public function index()
    {
        $campaigns = EmailCampaign::latest()->get()->map(fn ($c) => [
            'id'               => $c->id,
            'name'             => $c->name,
            'subject'          => $c->subject,
            'status'           => $c->status,
            'from_name'        => $c->from_name,
            'from_email'       => $c->from_email,
            'recipient_mode'   => $c->recipient_mode ?? 'all',
            'total_recipients' => $c->total_recipients,
            'sent_count'       => $c->sent_count,
            'opened_count'     => $c->opened_count,
            'clicked_count'    => $c->clicked_count,
            'sent_at'          => $c->sent_at?->diffForHumans(),
            'created_at'       => $c->created_at->diffForHumans(),
        ]);

        return Inertia::render('Campaigns/Index', ['campaigns' => $campaigns]);
    }

    public function create(Request $request)
    {
        $statuses  = Lead::distinct()->pluck('status')->filter()->values();
        $leadCount = Lead::count();
        $groups    = LeadGroup::withCount('leads')->orderBy('name')->get()->map(fn ($g) => [
            'id'          => $g->id,
            'name'        => $g->name,
            'color'       => $g->color,
            'leads_count' => $g->leads_count,
        ]);
        $tags = Tag::withCount('leads')->orderBy('name')->get()->map(fn ($t) => [
            'id'    => $t->id,
            'name'  => $t->name,
            'color' => $t->color,
        ]);

        return Inertia::render('Campaigns/Create', [
            'statuses'      => $statuses,
            'leadCount'     => $leadCount,
            'groups'        => $groups,
            'tags'          => $tags,
            'sender'        => $this->resolveSender($request->user()),
            'activeTemplate' => $request->user()->activeEmailTemplate?->name,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'           => 'required|string|max:200',
            'subject'        => 'required|string|max:500',
            'body_html'      => 'required|string',
            'recipient_mode' => 'required|in:all,filter,group',
            'group_id'       => 'nullable|integer|exists:lead_groups,id',
            'filters'        => 'nullable|array',
        ]);

        $count = $this->countRecipients(
            $validated['filters'] ?? [],
            $validated['group_id'] ?? null,
            $validated['recipient_mode']
        );

        $campaign = EmailCampaign::create([
            ...$validated,
            ...$this->resolveSender($request->user()),
            'total_recipients' => $count,
            'status'           => 'draft',
        ]);

        return redirect()->route('campaigns.show', $campaign);
    }

    public function edit(Request $request, EmailCampaign $campaign)
    {
        if ($campaign->status === 'sent') {
            return redirect()->route('campaigns.show', $campaign)
                ->withErrors(['error' => 'Sent campaigns cannot be edited.']);
        }

        $statuses  = Lead::distinct()->pluck('status')->filter()->values();
        $leadCount = Lead::count();
        $groups    = LeadGroup::withCount('leads')->orderBy('name')->get()->map(fn ($g) => [
            'id'          => $g->id,
            'name'        => $g->name,
            'color'       => $g->color,
            'leads_count' => $g->leads_count,
        ]);
        $tags = Tag::withCount('leads')->orderBy('name')->get()->map(fn ($t) => [
            'id'    => $t->id,
            'name'  => $t->name,
            'color' => $t->color,
        ]);

        return Inertia::render('Campaigns/Create', [
            'statuses'      => $statuses,
            'leadCount'     => $leadCount,
            'groups'        => $groups,
            'tags'          => $tags,
            'sender'        => $this->resolveSender($request->user()),
            'activeTemplate' => $request->user()->activeEmailTemplate?->name,
            'campaign'  => [
                'id'               => $campaign->id,
                'name'             => $campaign->name,
                'subject'          => $campaign->subject,
                'from_name'        => $campaign->from_name,
                'from_email'       => $campaign->from_email,
                'body_html'        => $campaign->body_html,
                'recipient_mode'   => $campaign->recipient_mode ?? 'all',
                'group_id'         => $campaign->group_id,
                'filters'          => $campaign->filters ?? ['statuses' => [], 'tag_ids' => []],
                'total_recipients' => $campaign->total_recipients,
            ],
        ]);
    }

    public function update(Request $request, EmailCampaign $campaign)
    {
        if ($campaign->status === 'sent') {
            return back()->withErrors(['error' => 'Sent campaigns cannot be edited.']);
        }

        $validated = $request->validate([
            'name'           => 'required|string|max:200',
            'subject'        => 'required|string|max:500',
            'body_html'      => 'required|string',
            'recipient_mode' => 'required|in:all,filter,group',
            'group_id'       => 'nullable|integer|exists:lead_groups,id',
            'filters'        => 'nullable|array',
        ]);

        $count = $this->countRecipients(
            $validated['filters'] ?? [],
            $validated['group_id'] ?? null,
            $validated['recipient_mode']
        );

        $campaign->update([
            ...$validated,
            ...$this->resolveSender($request->user()),
            'total_recipients' => $count,
        ]);

        return redirect()->route('campaigns.show', $campaign)->with('success', 'Campaign updated');
    }

    public function destroy(EmailCampaign $campaign)
    {
        $campaign->delete();

        return redirect()->route('campaigns.index')->with('success', 'Campaign deleted');
    }

    public function bulkDestroy(Request $request)
    {
        $ids = $request->input('ids', []);

        EmailCampaign::whereIn('id', $ids)
            ->where('organization_id', auth()->user()->organization_id)
            ->delete();

        return back()->with('success', count($ids) . ' campaign' . (count($ids) !== 1 ? 's' : '') . ' deleted');
    }

    public function show(EmailCampaign $campaign)
    {
        $sends = $campaign->sends()
            ->with('lead')
            ->latest('sent_at')
            ->paginate(25)
            ->through(fn ($s) => [
                'id'            => $s->id,
                'lead_name'     => $s->lead?->full_name,
                'lead_id'       => $s->lead_id,
                'email_used'    => $s->email_used,
                'status'        => $s->status,
                'error_message' => $s->error_message,
                'sent_at'       => $s->sent_at?->diffForHumans(),
                'opened_at'     => $s->opened_at?->diffForHumans(),
                'clicked_at'    => $s->clicked_at?->diffForHumans(),
            ]);

        $failedCount = $campaign->sends()->where('status', 'failed')->count();

        return Inertia::render('Campaigns/Show', [
            'campaign' => [
                'id'               => $campaign->id,
                'name'             => $campaign->name,
                'subject'          => $campaign->subject,
                'from_name'        => $campaign->from_name,
                'from_email'       => $campaign->from_email,
                'body_html'        => $campaign->body_html,
                'status'           => $campaign->status,
                'recipient_mode'   => $campaign->recipient_mode ?? 'all',
                'filters'          => $campaign->filters,
                'group_name'       => $campaign->group?->name,
                'total_recipients' => $campaign->total_recipients,
                'sent_count'       => $campaign->sent_count,
                'opened_count'     => $campaign->opened_count,
                'clicked_count'    => $campaign->clicked_count,
                'failed_count'     => $failedCount,
                'sent_at'          => $campaign->sent_at?->format('M d, Y H:i'),
                'created_at'       => $campaign->created_at->format('M d, Y'),
            ],
            'sends' => $sends,
        ]);
    }

    public function log(EmailCampaign $campaign)
    {
        $rows = $campaign->sends()
            ->with('lead:id,first_name,last_name')
            ->oldest('created_at')
            ->get();

        $sends = $rows->map(fn ($s) => [
            'id'            => $s->id,
            'lead_id'       => $s->lead_id,
            'lead_name'     => $s->lead?->full_name ?? '—',
            'email_used'    => $s->email_used,
            'status'        => $s->status,
            'error_message' => $s->error_message,
            'sent_at'       => $s->sent_at?->diffForHumans(),
            'sent_at_time'  => $s->sent_at?->format('H:i:s'),
            'opened_at'     => $s->opened_at?->diffForHumans(),
            'clicked_at'    => $s->clicked_at?->diffForHumans(),
        ]);

        // Compute live from the actual rows so counts are always accurate,
        // even when the stored counter drifts after retries.
        $sentCount    = $rows->whereIn('status', ['sent', 'opened', 'clicked'])->count();
        $openedCount  = $rows->filter(fn ($s) => $s->opened_at !== null)->count();
        $clickedCount = $rows->where('status', 'clicked')->count();

        return response()->json([
            'status'           => $campaign->status,
            'sent_count'       => $sentCount,
            'total_recipients' => $campaign->total_recipients,
            'opened_count'     => $openedCount,
            'clicked_count'    => $clickedCount,
            'sends'            => $sends,
        ]);
    }

    public function stop(EmailCampaign $campaign)
    {
        if ($campaign->status !== 'sending') {
            return back()->withErrors(['error' => 'Campaign is not currently sending.']);
        }

        $campaign->update(['status' => 'paused']);

        return back()->with('success', 'Campaign paused.');
    }

    public function send(Request $request, EmailCampaign $campaign)
    {
        // Block if currently sending
        if ($campaign->status === 'sending') {
            return back()->withErrors(['error' => 'Campaign is currently sending. Please wait.']);
        }

        // Allow retry of a 'sent' campaign only if there are failed sends
        if ($campaign->status === 'sent') {
            $hasFailures = $campaign->sends()->where('status', 'failed')->exists();
            if (! $hasFailures) {
                return back()->withErrors(['error' => 'Campaign has already been fully sent.']);
            }
        }

        $user   = $request->user();
        $mailer = MailService::forUser($user);

        if (! $mailer) {
            return back()->withErrors([
                'error' => 'No active SMTP account. Go to Settings → SMTP and activate one first.',
            ]);
        }

        // Resolve recipient lead IDs
        $leadIds = $this->resolveRecipientIds($campaign);

        if (empty($leadIds)) {
            return back()->withErrors([
                'error' => 'No leads match the selected recipient criteria.',
            ]);
        }

        $campaign->update([
            'status'           => 'sending',
            'total_recipients' => count($leadIds),
        ]);

        // Pre-create EmailSend records as 'queued' for all recipients so the
        // terminal panel shows them immediately (before the job runs).
        $alreadySentIds = EmailSend::where('email_campaign_id', $campaign->id)
            ->whereIn('status', ['sent', 'opened', 'clicked'])
            ->pluck('lead_id')
            ->all();

        $unsentIds = array_diff($leadIds, $alreadySentIds);

        if (! empty($unsentIds)) {
            Lead::with('emails')
                ->whereIn('id', $unsentIds)
                ->get()
                ->each(function ($lead) use ($campaign) {
                    $email = $lead->primary_email;
                    if (! $email) return;
                    EmailSend::updateOrCreate(
                        ['email_campaign_id' => $campaign->id, 'lead_id' => $lead->id],
                        ['email_used' => $email, 'status' => 'queued']
                    );
                });
        }

        // Dispatch queued jobs — one job per batch with incremental delay
        $batchSize  = $user->mail_batch_size  ?? 10;
        $batchDelay = $user->mail_batch_delay ?? 5;
        $chunks     = array_chunk($leadIds, $batchSize);

        foreach ($chunks as $i => $chunk) {
            $isLast = ($i === count($chunks) - 1);
            SendCampaignBatch::dispatch($campaign->id, $chunk, $user->id, $isLast)
                ->delay(now()->addSeconds($i * $batchDelay));
        }

        return redirect()->route('campaigns.show', $campaign)
            ->with('success', 'Campaign queued! Sending ' . count($leadIds) . ' emails in ' . count($chunks) . ' batch' . (count($chunks) !== 1 ? 'es' : '') . '.');
    }

    public function recipientCount(Request $request)
    {
        $mode    = $request->input('recipient_mode', 'all');
        $groupId = $request->input('group_id');
        $filters = $request->input('filters', []);

        $count = $this->countRecipients($filters, $groupId, $mode);

        return response()->json(['count' => $count]);
    }

    /**
     * Open tracking pixel — public, no auth.
     * Returns a 1×1 transparent GIF and marks the email_send as opened.
     */
    public function trackOpen(string $token)
    {
        $send = EmailSend::where('tracking_token', $token)->first();

        if ($send && ! $send->opened_at) {
            $send->update(['status' => 'opened', 'opened_at' => now()]);
            EmailCampaign::where('id', $send->email_campaign_id)->increment('opened_count');
        }

        // 1×1 transparent GIF
        $gif = base64_decode('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');

        return response($gif, 200)
            ->header('Content-Type', 'image/gif')
            ->header('Content-Length', strlen($gif))
            ->header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
            ->header('Pragma', 'no-cache')
            ->header('Expires', '0');
    }

    /**
     * Click tracking redirect — public, no auth.
     * Marks the email_send as clicked then redirects to the real URL.
     */
    public function trackClick(string $token, Request $request)
    {
        $send = EmailSend::where('tracking_token', $token)->first();

        if ($send) {
            if (! $send->clicked_at) {
                $send->update(['status' => 'clicked', 'clicked_at' => now()]);
                EmailCampaign::where('id', $send->email_campaign_id)->increment('clicked_count');
            }
            // Also mark as opened if not already
            if (! $send->opened_at) {
                $send->update(['opened_at' => now()]);
                EmailCampaign::where('id', $send->email_campaign_id)->increment('opened_count');
            }
        }

        $url = $request->query('url', '/');

        // Validate the redirect URL is a real URL (basic safety)
        if (! filter_var($url, FILTER_VALIDATE_URL)) {
            $url = '/';
        }

        return redirect()->away($url);
    }

    // ──────────────────────────────────────────────────
    // Private helpers
    // ──────────────────────────────────────────────────

    /**
     * The sender identity always comes from the active SMTP account in
     * Settings → SMTP (falling back to the user's own name/email). Campaigns
     * never ask for it, so it can never drift from the account actually used
     * to deliver the mail.
     */
    private function resolveSender(\App\Models\User $user): array
    {
        $cred = $user->activeSmtpCredential;

        return [
            'from_name'  => $cred->from_name  ?? $user->name,
            'from_email' => $cred->from_email ?? $user->email,
        ];
    }

    private function countRecipients(array $filters, ?int $groupId, string $mode): int
    {
        if ($mode === 'all') {
            return Lead::count();
        }

        if ($mode === 'group' && $groupId) {
            return LeadGroup::find($groupId)?->leads()->count() ?? 0;
        }

        // 'filter' mode
        $query = Lead::query();

        if (! empty($filters['statuses'])) {
            $query->whereIn('status', (array) $filters['statuses']);
        }

        if (! empty($filters['tag_ids'])) {
            $query->whereHas('tags', fn ($q) => $q->whereIn('tags.id', (array) $filters['tag_ids']));
        }

        return $query->count();
    }

    private function resolveRecipientIds(EmailCampaign $campaign): array
    {
        $mode = $campaign->recipient_mode ?? 'all';

        if ($mode === 'group' && $campaign->group_id) {
            return LeadGroup::find($campaign->group_id)
                ?->leads()->pluck('leads.id')->toArray() ?? [];
        }

        $query = Lead::query();

        if ($mode === 'filter') {
            $filters = $campaign->filters ?? [];

            if (! empty($filters['statuses'])) {
                $query->whereIn('status', (array) $filters['statuses']);
            }

            if (! empty($filters['tag_ids'])) {
                $query->whereHas('tags', fn ($q) => $q->whereIn('tags.id', (array) $filters['tag_ids']));
            }
        }

        return $query->pluck('id')->toArray();
    }
}
