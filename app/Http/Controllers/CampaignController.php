<?php

namespace App\Http\Controllers;

use App\Jobs\SendCampaignBatch;
use App\Models\EmailCampaign;
use App\Models\EmailSend;
use App\Models\FormSession;
use App\Models\Lead;
use App\Models\LeadForm;
use App\Models\LeadGroup;
use App\Models\Tag;
use App\Services\AiService;
use App\Services\MailService;
use App\Support\TenantContext;
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
            'followup_enabled' => (bool) $c->followup_enabled,
            'followup_subject' => $c->followup_subject,
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

        $org = app(TenantContext::class)->get() ?? $request->user()?->organization;

        return Inertia::render('Campaigns/Create', [
            'statuses'            => $statuses,
            'leadCount'           => $leadCount,
            'groups'              => $groups,
            'tags'                => $tags,
            'forms'               => $this->formsForSelect(),
            'sender'              => $this->resolveSender($request->user()),
            'activeTemplate'      => $request->user()->activeEmailTemplate?->name,
            'orgFollowupEnabled'  => $org?->isFollowupEnabled() ?? false,
            'aiConfigured'        => AiService::forCurrentTenant()?->isConfigured() ?? false,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'             => 'required|string|max:200',
            'subject'          => 'required|string|max:500',
            'body_html'        => 'required|string',
            'recipient_mode'   => 'required|in:all,filter,group',
            'group_id'         => 'nullable|integer|exists:lead_groups,id',
            'lead_form_id'     => 'nullable|integer|exists:lead_forms,id',
            'filters'          => 'nullable|array',
            'followup_enabled' => 'boolean',
            'followup_steps'   => [
                'nullable', 'array', 'max:10',
                function ($attribute, $value, $fail) use ($request) {
                    if ($request->boolean('followup_enabled') && empty($value)) {
                        $fail('At least one follow-up step is required when follow-up is enabled.');
                    }
                    if (is_array($value) && count($value) > 1) {
                        $prev = 0;
                        foreach ($value as $i => $step) {
                            if (($step['delay_hours'] ?? 0) <= $prev) {
                                $fail('Step ' . ($i + 1) . ' delay must be greater than the previous step.');
                                break;
                            }
                            $prev = $step['delay_hours'];
                        }
                    }
                },
            ],
            'followup_steps.*.delay_hours' => 'required_with:followup_steps|integer|in:24,48,72,120,168,216,336',
            'followup_steps.*.subject'     => 'required_with:followup_steps|string|max:500',
            'followup_steps.*.body_html'   => 'required_with:followup_steps|string',
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
            'followup_enabled' => $validated['followup_enabled'] ?? false,
            'followup_steps'   => $validated['followup_steps'] ?? null,
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

        $org = app(TenantContext::class)->get() ?? $request->user()?->organization;

        return Inertia::render('Campaigns/Create', [
            'statuses'           => $statuses,
            'leadCount'          => $leadCount,
            'groups'             => $groups,
            'tags'               => $tags,
            'forms'              => $this->formsForSelect(),
            'sender'             => $this->resolveSender($request->user()),
            'activeTemplate'     => $request->user()->activeEmailTemplate?->name,
            'orgFollowupEnabled' => $org?->isFollowupEnabled() ?? false,
            'aiConfigured'       => AiService::forCurrentTenant()?->isConfigured() ?? false,
            'campaign'           => [
                'id'               => $campaign->id,
                'name'             => $campaign->name,
                'subject'          => $campaign->subject,
                'from_name'        => $campaign->from_name,
                'from_email'       => $campaign->from_email,
                'body_html'        => $campaign->body_html,
                'recipient_mode'   => $campaign->recipient_mode ?? 'all',
                'group_id'         => $campaign->group_id,
                'lead_form_id'     => $campaign->lead_form_id,
                'filters'          => $campaign->filters ?? ['statuses' => [], 'tag_ids' => []],
                'total_recipients' => $campaign->total_recipients,
                'followup_enabled' => (bool) $campaign->followup_enabled,
                'followup_steps'   => $campaign->followup_steps ?? [],
            ],
        ]);
    }

    public function update(Request $request, EmailCampaign $campaign)
    {
        if ($campaign->status === 'sent') {
            return back()->withErrors(['error' => 'Sent campaigns cannot be edited.']);
        }

        $validated = $request->validate([
            'name'             => 'required|string|max:200',
            'subject'          => 'required|string|max:500',
            'body_html'        => 'required|string',
            'recipient_mode'   => 'required|in:all,filter,group',
            'group_id'         => 'nullable|integer|exists:lead_groups,id',
            'lead_form_id'     => 'nullable|integer|exists:lead_forms,id',
            'filters'          => 'nullable|array',
            'followup_enabled' => 'boolean',
            'followup_steps'   => [
                'nullable', 'array', 'max:10',
                function ($attribute, $value, $fail) use ($request) {
                    if ($request->boolean('followup_enabled') && empty($value)) {
                        $fail('At least one follow-up step is required when follow-up is enabled.');
                    }
                    if (is_array($value) && count($value) > 1) {
                        $prev = 0;
                        foreach ($value as $i => $step) {
                            if (($step['delay_hours'] ?? 0) <= $prev) {
                                $fail('Step ' . ($i + 1) . ' delay must be greater than the previous step.');
                                break;
                            }
                            $prev = $step['delay_hours'];
                        }
                    }
                },
            ],
            'followup_steps.*.delay_hours' => 'required_with:followup_steps|integer|in:24,48,72,120,168,216,336',
            'followup_steps.*.subject'     => 'required_with:followup_steps|string|max:500',
            'followup_steps.*.body_html'   => 'required_with:followup_steps|string',
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
            'followup_enabled' => $validated['followup_enabled'] ?? false,
            'followup_steps'   => $validated['followup_steps'] ?? null,
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
        // Submissions are attributed via the {{form_link}}'s utm_campaign param,
        // which carries the sending EmailSend's own tracking_token — so "did any
        // of THIS campaign's sends lead to a submission" is just a token lookup,
        // no new attribution column needed.
        $formSessionsByToken = collect();
        if ($campaign->lead_form_id) {
            $tokens = $campaign->sends()->pluck('tracking_token')->filter()->all();
            $formSessionsByToken = FormSession::whereIn('utm_campaign', $tokens)
                ->whereNotNull('submitted_at')
                ->get()
                ->keyBy('utm_campaign');
        }
        $formSubmissions = $formSessionsByToken->count();

        $sends = $campaign->sends()
            ->with('lead')
            ->latest('sent_at')
            ->paginate(25)
            ->through(fn ($s) => [
                'id'                   => $s->id,
                'lead_name'            => $s->lead?->full_name,
                'lead_id'              => $s->lead_id,
                'email_used'           => $s->email_used,
                'status'               => $s->status,
                'error_message'        => $s->error_message,
                'is_followup'          => (bool) $s->is_followup,
                'followup_step'        => $s->followup_step,
                'sent_at'              => $s->sent_at?->diffForHumans(),
                'opened_at'            => $s->opened_at?->diffForHumans(),
                'clicked_at'           => $s->clicked_at?->diffForHumans(),
                'form_link_clicked_at' => $s->form_link_clicked_at?->diffForHumans(),
                'form_submitted_at'    => $formSessionsByToken->get($s->tracking_token)?->submitted_at?->diffForHumans(),
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
                'followup_enabled'      => (bool) $campaign->followup_enabled,
                'followup_subject'      => $campaign->followup_subject,
                'followup_steps'        => $campaign->followup_steps ?? [],
                'followup_steps_count'  => count($campaign->followup_steps ?? []),
                'sent_at'               => $campaign->sent_at?->format('M d, Y H:i'),
                'created_at'       => $campaign->created_at->format('M d, Y'),
                'form'              => $campaign->leadForm ? [
                    'id'         => $campaign->leadForm->id,
                    'name'       => $campaign->leadForm->name,
                    'public_url' => $campaign->leadForm->publicUrl(),
                ] : null,
                'form_submissions'  => $formSubmissions,
                'form_clicks'       => $campaign->form_clicks_count,
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

        // Same attribution lookup as show() — the "Form" column in the live-polled
        // log must carry the same fields, or it goes blank once polling replaces
        // the SSR rows from show() with these.
        $formSessionsByToken = collect();
        if ($campaign->lead_form_id) {
            $tokens = $rows->pluck('tracking_token')->filter()->all();
            $formSessionsByToken = FormSession::whereIn('utm_campaign', $tokens)
                ->whereNotNull('submitted_at')
                ->get()
                ->keyBy('utm_campaign');
        }

        $sends = $rows->map(fn ($s) => [
            'id'                   => $s->id,
            'lead_id'              => $s->lead_id,
            'lead_name'            => $s->lead?->full_name ?? '—',
            'email_used'           => $s->email_used,
            'status'               => $s->status,
            'error_message'        => $s->error_message,
            'sent_at'              => $s->sent_at?->diffForHumans(),
            'sent_at_time'         => $s->sent_at?->format('H:i:s'),
            'opened_at'            => $s->opened_at?->diffForHumans(),
            'clicked_at'           => $s->clicked_at?->diffForHumans(),
            'form_link_clicked_at' => $s->form_link_clicked_at?->diffForHumans(),
            'form_submitted_at'    => $formSessionsByToken->get($s->tracking_token)?->submitted_at?->diffForHumans(),
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
        if ($campaign->status === 'sending') {
            $campaign->update(['status' => 'paused']);
            return back()->with('success', 'Campaign paused. Follow-ups are also paused.');
        }

        if ($campaign->status === 'sent' && $campaign->followup_enabled) {
            $campaign->update(['followup_enabled' => false]);
            return back()->with('success', 'Follow-ups stopped.');
        }

        return back()->withErrors(['error' => 'Nothing to stop on this campaign.']);
    }

    public function resumeFollowups(EmailCampaign $campaign)
    {
        if ($campaign->status !== 'sent') {
            return back()->withErrors(['error' => 'Follow-ups can only be resumed on sent campaigns.']);
        }

        if (empty($campaign->followup_steps) && ! $campaign->followup_subject) {
            return back()->withErrors(['error' => 'This campaign has no follow-up email configured.']);
        }

        $campaign->update(['followup_enabled' => true]);

        return back()->with('success', 'Follow-ups resumed. Eligible leads will receive a follow-up on the next scheduler run.');
    }

    public function clone(EmailCampaign $campaign)
    {
        $newCampaign                    = $campaign->replicate();
        $newCampaign->name              = $campaign->name . ' (Copy)';
        $newCampaign->status            = 'draft';
        $newCampaign->sent_count        = 0;
        $newCampaign->opened_count      = 0;
        $newCampaign->clicked_count     = 0;
        $newCampaign->bounced_count     = 0;
        $newCampaign->unsubscribed_count = 0;
        $newCampaign->total_recipients  = $campaign->total_recipients;
        $newCampaign->sent_at           = null;
        $newCampaign->scheduled_at      = null;
        $newCampaign->save();

        return redirect()->route('campaigns.edit', $newCampaign)
            ->with('success', 'Campaign duplicated. Review and send when ready.');
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
                'error' => 'No recipients with an email address. The selected leads have no email on file (leads added via AI Search may not include emails), so there is nothing to send.',
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
        $send = EmailSend::with('lead', 'campaign')->where('tracking_token', $token)->first();

        if ($send && ! $send->opened_at) {
            $send->update(['status' => 'opened', 'opened_at' => now()]);
            EmailCampaign::where('id', $send->email_campaign_id)->increment('opened_count');

            \Log::channel('tracking')->info('Email opened', [
                'token'   => $token,
                'lead_id' => $send->lead_id,
                'campaign_id' => $send->email_campaign_id,
            ]);

            $this->notifyEngagement($send, 'opened');
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
        $send = EmailSend::with('lead', 'campaign.leadForm')->where('tracking_token', $token)->first();
        $url  = $request->query('url', '/');

        if ($send) {
            if (! $send->clicked_at) {
                $send->update(['status' => 'clicked', 'clicked_at' => now()]);
                EmailCampaign::where('id', $send->email_campaign_id)->increment('clicked_count');

                \Log::channel('tracking')->info('Email link clicked', [
                    'token'       => $token,
                    'lead_id'     => $send->lead_id,
                    'campaign_id' => $send->email_campaign_id,
                    'url'         => $request->query('url'),
                ]);

                $this->notifyEngagement($send, 'clicked');
            }
            // Also mark as opened if not already
            if (! $send->opened_at) {
                $send->update(['opened_at' => now()]);
                EmailCampaign::where('id', $send->email_campaign_id)->increment('opened_count');
            }

            // Distinguish "clicked the attached form's link" from clicking any
            // other link in the email — form slugs are random 8-char tokens, so
            // a prefix match against the (query-string-free) public URL is safe.
            $publicUrl = $send->campaign?->leadForm?->publicUrl();
            if ($publicUrl && ! $send->form_link_clicked_at && str_starts_with($url, $publicUrl)) {
                $send->update(['form_link_clicked_at' => now()]);
                EmailCampaign::where('id', $send->email_campaign_id)->increment('form_clicks_count');
            }
        }

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
     * Raise a notification when a lead first engages with a campaign email.
     * $event is 'opened' or 'clicked'. Runs on the public tracking routes where
     * no tenant is bound, so organization_id is taken from the EmailSend.
     */
    private function notifyEngagement(EmailSend $send, string $event): void
    {
        $lead = $send->lead;
        if (! $lead) {
            return;
        }

        $campaignName = $send->campaign?->name;
        $who          = $lead->full_name ?: $send->email_used;

        $config = [
            'opened'  => [
                'type'  => 'lead.email_opened',
                'title' => "{$who} opened your email",
            ],
            'clicked' => [
                'type'  => 'lead.email_clicked',
                'title' => "{$who} clicked a link in your email",
            ],
        ][$event];

        \App\Models\Notification::record([
            'organization_id' => $send->organization_id,
            'type'            => $config['type'],
            'title'           => $config['title'],
            'body'            => $campaignName ? "Campaign: {$campaignName}" : null,
            'link'            => '/leads/' . $lead->id,
            'data'            => [
                'lead_id'     => $lead->id,
                'campaign_id' => $send->email_campaign_id,
                'send_id'     => $send->id,
            ],
        ]);
    }

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

    /**
     * Forms available to attach to a campaign via {{form_link}} — same
     * active/is_default ordering as FormController::listForSelect().
     */
    private function formsForSelect()
    {
        return LeadForm::where('is_active', true)
            ->orderByDesc('is_default')
            ->orderBy('name')
            ->get(['id', 'name']);
    }

    private function countRecipients(array $filters, ?int $groupId, string $mode): int
    {
        // Only leads with at least one email address are reachable, so the
        // recipient count must reflect sendable leads — not raw lead totals.
        if ($mode === 'all') {
            return Lead::has('emails')->count();
        }

        if ($mode === 'group' && $groupId) {
            return LeadGroup::find($groupId)?->leads()->has('emails')->count() ?? 0;
        }

        // 'filter' mode
        $query = Lead::query()->has('emails');

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
                ?->leads()->has('emails')->pluck('leads.id')->toArray() ?? [];
        }

        $query = Lead::query()->has('emails');

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
