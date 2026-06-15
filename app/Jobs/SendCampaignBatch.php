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
use Illuminate\Support\Str;

class SendCampaignBatch implements ShouldQueue
{
    use Queueable;

    public int $tries   = 3;
    public int $timeout = 300;

    public function __construct(
        public readonly int   $campaignId,
        public readonly array $leadIds,
        public readonly int   $userId,
        public readonly bool  $isLastBatch = false,
    ) {}

    public function handle(): void
    {
        $campaign = EmailCampaign::find($this->campaignId);
        $user     = User::find($this->userId);

        if (! $campaign || ! $user) return;
        if ($campaign->status === 'paused') return;

        $mailer = MailService::forUser($user);
        if (! $mailer) return;

        $mailer->configureMailer();

        $fromEmail = $mailer->credential()->from_email;
        $fromName  = $mailer->credential()->from_name;

        $template = $user->active_template_id
            ? EmailTemplate::find($user->active_template_id)
            : null;

        $templateVars = EmailTemplate::varsFor($user, $fromName);

        $leads = Lead::with('emails')->whereIn('id', $this->leadIds)->get();
        $sent  = 0;

        foreach ($leads as $lead) {
            $campaign->refresh();
            if ($campaign->status === 'paused') break;

            $email = $lead->primary_email;
            if (! $email) {
                \Illuminate\Support\Facades\Log::channel('campaigns')->warning('Campaign send skipped — lead has no email', [
                    'campaign_id' => $this->campaignId,
                    'lead_id'     => $lead->id,
                ]);
                continue;
            }

            $alreadySent = EmailSend::where('email_campaign_id', $campaign->id)
                ->where('lead_id', $lead->id)
                ->whereIn('status', ['sent', 'opened', 'clicked'])
                ->exists();
            if ($alreadySent) continue;

            // Generate a unique tracking token for this send
            $token = Str::random(64);

            // Explicit Message-ID — links replies (In-Reply-To) and the Sent copy
            // back to this send. Stored on the EmailSend so inbound replies resolve.
            $domain    = Str::after($fromEmail, '@') ?: 'localhost';
            $messageId = (string) Str::uuid() . '@' . $domain;

            // Pre-create the EmailSend record so the token is in DB
            // before the email could potentially trigger the pixel
            $emailSend = EmailSend::updateOrCreate(
                ['email_campaign_id' => $campaign->id, 'lead_id' => $lead->id],
                [
                    'email_used'      => $email,
                    'status'          => 'pending',
                    'tracking_token'  => $token,
                    'message_id'      => FetchEmailsJob::normalizeMessageId($messageId),
                ]
            );

            try {
                // Personalise the subject line tokens per-lead (e.g. {{company}}).
                $subject = $this->replaceTokens($campaign->subject, $lead);

                $html = $this->buildHtml(
                    $campaign->body_html,
                    $subject,
                    $lead,
                    $template,
                    $templateVars,
                    $token,
                );

                \Illuminate\Support\Facades\Mail::mailer('dynamic')
                    ->to($email, $lead->full_name)
                    ->send(new CampaignMail($campaign, $lead, $html, $fromEmail, $fromName, $subject, $messageId));

                $emailSend->update(['status' => 'sent', 'sent_at' => now(), 'error_message' => null]);

                // Record the send into the Sent folder immediately — works even
                // for SMTP-only accounts with no IMAP configured.
                $mailer->recordSent($email, $subject, $html, $messageId, $lead->full_name);

                \Illuminate\Support\Facades\Log::channel('campaigns')->info('Campaign email sent', [
                    'campaign_id' => $campaign->id,
                    'lead_id'     => $lead->id,
                    'email'       => $email,
                ]);

                // Auto-mark the lead as contacted via mail so the outreach
                // checkbox shows checked once a campaign reaches them.
                $channels = $lead->contact_channels ?? [];
                if (empty($channels['mail'])) {
                    $channels['mail'] = now()->toIso8601String();
                }
                $lead->update([
                    'contact_channels'  => $channels,
                    'last_contacted_at' => now(),
                ]);

                $sent++;
            } catch (\Throwable $e) {
                $emailSend->update([
                    'status'        => 'failed',
                    'sent_at'       => now(),
                    'error_message' => Str::limit($e->getMessage(), 480),
                ]);
                \Illuminate\Support\Facades\Log::error('Campaign send failed', [
                    'campaign_id' => $this->campaignId,
                    'lead_id'     => $lead->id,
                    'email'       => $email,
                    'error'       => $e->getMessage(),
                ]);
            }
        }

        // Update campaign sent_count
        $campaign->increment('sent_count', $sent);

        if ($this->isLastBatch) {
            $campaign->refresh();
            if ($campaign->status !== 'paused') {
                // If nothing was ever delivered, the campaign did not succeed —
                // mark it 'failed' (re-sendable) rather than falsely 'sent'.
                // This covers both real SMTP failures and recipients skipped
                // for having no email address.
                $finalStatus = $campaign->sent_count === 0 ? 'failed' : 'sent';
                $campaign->update(['status' => $finalStatus, 'sent_at' => now()]);
            }
        }
    }

    /**
     * Build the final HTML: replace lead tokens, inject tracking pixel,
     * wrap links with click-tracker, then optionally wrap in email template.
     */
    private function buildHtml(
        string $bodyHtml,
        string $subject,
        Lead $lead,
        ?EmailTemplate $template,
        array $vars,
        string $token,
    ): string {
        // 1. Replace lead tokens in body
        $html = $this->replaceTokens($bodyHtml, $lead, $subject);

        // 2. Inject tracking pixel just before closing </body> or at end
        $pixelUrl  = url("/t/{$token}/open.gif");
        $pixelTag  = '<img src="' . $pixelUrl . '" width="1" height="1" alt="" style="display:none;border:0;outline:none;text-decoration:none;" />';

        if (stripos($html, '</body>') !== false) {
            $html = str_ireplace('</body>', $pixelTag . '</body>', $html);
        } else {
            $html .= $pixelTag;
        }

        // 3. Wrap links with click tracker
        $html = $this->wrapLinksWithTracker($html, $token);

        // 4. Optionally wrap in email template
        if ($template) {
            // Run token replacement on the final vars for the template
            $html = $template->render([...$vars, 'content' => $html]);
        }

        return $html;
    }

    /**
     * Replace {{token}} placeholders with lead data.
     * Also replaces {{subject}} for use in subject (passed separately).
     */
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

    /**
     * Wrap all <a href="..."> links with the click-tracking redirect URL,
     * but skip mailto:, tel:, unsubscribe, and already-tracking links.
     */
    private function wrapLinksWithTracker(string $html, string $token): string
    {
        return preg_replace_callback(
            '/<a\s[^>]*href=["\']([^"\']+)["\'][^>]*>/i',
            function (array $matches) use ($token) {
                $original = $matches[1];

                // Skip non-http links and already-tracked links
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

                return str_replace(
                    $original,
                    $trackUrl,
                    $matches[0]
                );
            },
            $html
        );
    }
}
