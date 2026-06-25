<?php

namespace App\Jobs;

use App\Mail\CampaignMail;
use App\Models\EmailCampaign;
use App\Models\EmailSend;
use App\Models\EmailTemplate;
use App\Models\Lead;
use App\Models\User;
use App\Services\MailService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class SendFollowUpBatch implements ShouldQueue
{
    use Queueable;

    public int $tries   = 3;
    public int $timeout = 300;

    /**
     * @param int   $campaignId     The campaign whose follow-up template to use.
     * @param int[] $parentSendIds  IDs of original email_sends to follow up on.
     * @param int   $userId         Owner user (for SMTP credentials).
     */
    public function __construct(
        public readonly int   $campaignId,
        public readonly array $parentSendIds,
        public readonly int   $userId,
    ) {}

    public function handle(): void
    {
        $campaign = EmailCampaign::find($this->campaignId);
        $user     = User::find($this->userId);

        if (! $campaign || ! $user) return;

        // Stop if campaign is paused or follow-ups are disabled
        if (in_array($campaign->status, ['paused', 'draft', 'failed'])) return;
        if (! $campaign->followup_enabled) return;

        $mailer = MailService::forUser($user);
        if (! $mailer) return;

        $mailer->configureMailer();

        $fromEmail = $mailer->credential()->from_email;
        $fromName  = $mailer->credential()->from_name;

        $template     = $user->active_template_id
            ? EmailTemplate::find($user->active_template_id)
            : null;
        $templateVars = EmailTemplate::varsFor($user, $fromName);

        // Load the original sends with their leads
        $parentSends = EmailSend::with(['lead.emails'])
            ->whereIn('id', $this->parentSendIds)
            ->get()
            ->keyBy('id');

        foreach ($this->parentSendIds as $parentSendId) {
            $parentSend = $parentSends->get($parentSendId);
            if (! $parentSend) continue;

            $campaign->refresh();
            if (in_array($campaign->status, ['paused'])) break;
            if (! $campaign->followup_enabled) break;

            // Idempotency guard — skip if a follow-up was already sent for this parent
            // (handles job retry safety without double-sending)
            $alreadyFolledUp = EmailSend::where('parent_send_id', $parentSendId)->exists();
            if ($alreadyFolledUp) continue;

            $lead = $parentSend->lead;
            if (! $lead) continue;

            $email = $lead->primary_email;
            if (! $email) continue;

            $token     = Str::random(64);
            $domain    = Str::after($fromEmail, '@') ?: 'localhost';
            $messageId = (string) Str::uuid() . '@' . $domain;

            // Create the follow-up EmailSend record first so the token is in DB
            $emailSend = EmailSend::create([
                'organization_id'    => $parentSend->organization_id,
                'email_campaign_id'  => $this->campaignId,
                'lead_id'            => $lead->id,
                'email_used'         => $email,
                'status'             => 'pending',
                'tracking_token'     => $token,
                'message_id'         => FetchEmailsJob::normalizeMessageId($messageId),
                'is_followup'        => true,
                'parent_send_id'     => $parentSendId,
            ]);

            try {
                $subject = $this->replaceTokens($campaign->followup_subject, $lead);

                $html = $this->buildHtml(
                    $campaign->followup_body_html,
                    $subject,
                    $lead,
                    $template,
                    $templateVars,
                    $token,
                );

                Mail::mailer('dynamic')
                    ->to($email, $lead->full_name)
                    ->send(new CampaignMail($campaign, $lead, $html, $fromEmail, $fromName, $subject, $messageId));

                $emailSend->update(['status' => 'sent', 'sent_at' => now(), 'error_message' => null]);

                $mailer->recordSent($email, $subject, $html, $messageId, $lead->full_name);

                Log::channel('campaigns')->info('Follow-up email sent', [
                    'campaign_id'    => $this->campaignId,
                    'parent_send_id' => $parentSendId,
                    'lead_id'        => $lead->id,
                    'email'          => $email,
                ]);

                // Update lead's contact timestamp
                $channels = $lead->contact_channels ?? [];
                if (empty($channels['mail'])) {
                    $channels['mail'] = now()->toIso8601String();
                }
                $lead->update([
                    'contact_channels'  => $channels,
                    'last_contacted_at' => now(),
                ]);
            } catch (\Throwable $e) {
                $emailSend->update([
                    'status'        => 'failed',
                    'sent_at'       => now(),
                    'error_message' => Str::limit($e->getMessage(), 480),
                ]);
                Log::error('Follow-up send failed', [
                    'campaign_id'    => $this->campaignId,
                    'parent_send_id' => $parentSendId,
                    'lead_id'        => $lead->id,
                    'email'          => $email,
                    'error'          => $e->getMessage(),
                ]);
            }
        }
    }

    private function buildHtml(
        string $bodyHtml,
        string $subject,
        Lead $lead,
        ?EmailTemplate $template,
        array $vars,
        string $token,
    ): string {
        $html = $this->replaceTokens($bodyHtml, $lead, $subject);

        $pixelUrl = url("/t/{$token}/open.gif");
        $pixelTag = '<img src="' . $pixelUrl . '" width="1" height="1" alt="" style="display:none;border:0;outline:none;text-decoration:none;" />';

        if (stripos($html, '</body>') !== false) {
            $html = str_ireplace('</body>', $pixelTag . '</body>', $html);
        } else {
            $html .= $pixelTag;
        }

        $html = $this->wrapLinksWithTracker($html, $token);

        if ($template) {
            $html = $template->render([...$vars, 'content' => $html]);
        }

        return $html;
    }

    private function replaceTokens(string $html, Lead $lead, string $subject = ''): string
    {
        $tokens = [
            '{{first_name}}' => $lead->first_name ?? '',
            '{{last_name}}'  => $lead->last_name  ?? '',
            '{{name}}'       => $lead->full_name  ?? '',
            '{{email}}'      => $lead->primary_email ?? '',
            '{{company}}'    => $lead->company ?? '',
            '{{phone}}'      => $lead->primary_phone ?? '',
            '{{status}}'     => $lead->status ?? '',
            '{{subject}}'    => $subject,
        ];

        return str_replace(array_keys($tokens), array_values($tokens), $html);
    }

    private function wrapLinksWithTracker(string $html, string $token): string
    {
        return preg_replace_callback(
            '/<a\s[^>]*href=["\']([^"\']+)["\'][^>]*>/i',
            function (array $matches) use ($token) {
                $original = $matches[1];

                if (
                    str_starts_with($original, 'mailto:') ||
                    str_starts_with($original, 'tel:') ||
                    str_starts_with($original, '#') ||
                    str_contains($original, '/t/') ||
                    str_contains($original, 'unsubscribe')
                ) {
                    return $matches[0];
                }

                $trackUrl = url("/t/{$token}/click?url=" . urlencode($original));

                return str_replace($original, $trackUrl, $matches[0]);
            },
            $html
        );
    }
}
