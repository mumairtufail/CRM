<?php

namespace App\Services;

use App\Mail\CampaignMail;
use App\Models\EmailCampaign;
use App\Models\EmailSend;
use App\Models\EmailTemplate;
use App\Models\Lead;
use App\Models\SmtpCredential;
use App\Models\User;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;

class MailService
{
    public function __construct(protected SmtpCredential $credential) {}

    public static function forUser(User $user): ?static
    {
        $cred = $user->activeSmtpCredential;
        return $cred ? new static($cred) : null;
    }

    public function configureMailer(): void
    {
        Config::set('mail.mailers.dynamic', [
            'transport'  => 'smtp',
            'host'       => $this->credential->host,
            'port'       => $this->credential->port,
            'encryption' => $this->credential->encryption === 'none' ? null : $this->credential->encryption,
            'username'   => $this->credential->username,
            'password'   => $this->credential->password,
            'timeout'    => 30,
        ]);
        Config::set('mail.default', 'dynamic');
        Config::set('mail.from.address', $this->credential->from_email);
        Config::set('mail.from.name', $this->credential->from_name);
    }

    public function credential(): SmtpCredential
    {
        return $this->credential;
    }

    /**
     * Send campaign to all matching leads in batches.
     * Returns ['sent' => int, 'failed' => int, 'skipped' => int].
     */
    public function sendCampaign(EmailCampaign $campaign, int $batchSize = 10, int $batchDelay = 5): array
    {
        $this->configureMailer();

        $user     = $this->credential->user;
        $template = $user?->active_template_id
            ? EmailTemplate::find($user->active_template_id)
            : null;

        $templateVars = [
            'company_name' => $user?->company_name ?: $campaign->from_name,
            'from_name'    => $campaign->from_name,
            'year'         => date('Y'),
        ];

        $query = Lead::with('emails');
        foreach ($campaign->filters ?? [] as $key => $value) {
            if ($key === 'status' && $value) {
                $query->where('status', $value);
            }
            if ($key === 'tag_id' && $value) {
                $query->whereHas('tags', fn ($q) => $q->where('tags.id', $value));
            }
        }

        $leads    = $query->get();
        $sent     = 0;
        $failed   = 0;
        $skipped  = 0;
        $batchNum = 0;

        foreach ($leads->chunk($batchSize) as $batch) {
            if ($batchNum > 0 && $batchDelay > 0) {
                sleep($batchDelay);
            }

            foreach ($batch as $lead) {
                $email = $lead->primary_email;
                if (!$email) { $skipped++; continue; }

                $alreadySent = EmailSend::where('email_campaign_id', $campaign->id)
                    ->where('lead_id', $lead->id)
                    ->where('status', 'sent')
                    ->exists();
                if ($alreadySent) { $skipped++; continue; }

                try {
                    $renderedHtml = $this->buildHtml($campaign->body_html, $lead, $template, $templateVars);

                    Mail::mailer('dynamic')
                        ->to($email, $lead->full_name)
                        ->send(new CampaignMail($campaign, $lead, $renderedHtml));

                    EmailSend::updateOrCreate(
                        ['email_campaign_id' => $campaign->id, 'lead_id' => $lead->id],
                        ['email_used' => $email, 'status' => 'sent', 'sent_at' => now()]
                    );
                    $sent++;
                } catch (\Throwable $e) {
                    EmailSend::updateOrCreate(
                        ['email_campaign_id' => $campaign->id, 'lead_id' => $lead->id],
                        ['email_used' => $email, 'status' => 'failed', 'sent_at' => now()]
                    );
                    $failed++;
                }
            }

            $batchNum++;
        }

        return compact('sent', 'failed', 'skipped');
    }

    /**
     * Send a single test email to verify SMTP connectivity.
     */
    public function sendTest(string $toEmail): void
    {
        $this->configureMailer();

        $user     = $this->credential->user;
        $template = $user?->active_template_id
            ? EmailTemplate::find($user->active_template_id)
            : null;

        $bodyHtml = '<h2 style="font-size:18px;font-weight:700;margin-bottom:12px;color:#1e1b4b">SMTP Connection Verified</h2>'
            . '<p style="color:#4b5563;line-height:1.75">Your SMTP account is correctly configured and ready to send campaigns.</p>';

        if ($template) {
            $html = $template->render([
                'content'      => $bodyHtml,
                'company_name' => $user?->company_name ?: $this->credential->from_name,
                'from_name'    => $this->credential->from_name,
                'year'         => date('Y'),
            ]);

            Mail::mailer('dynamic')->html($html, function ($message) use ($toEmail) {
                $message
                    ->to($toEmail)
                    ->from($this->credential->from_email, $this->credential->from_name)
                    ->subject('SMTP Test — Connection Verified');
            });
        } else {
            Mail::mailer('dynamic')->raw(
                "SMTP connection verified.\n\nYour account is correctly configured and ready to send campaigns.\n\nSent from your CRM.",
                function ($message) use ($toEmail) {
                    $message
                        ->to($toEmail)
                        ->from($this->credential->from_email, $this->credential->from_name)
                        ->subject('SMTP Test — Connection Verified');
                }
            );
        }
    }

    /**
     * Replace lead tokens and wrap body in the active template.
     */
    private function buildHtml(string $bodyHtml, Lead $lead, ?EmailTemplate $template, array $templateVars): string
    {
        $html = $this->replaceLeadTokens($bodyHtml, $lead);

        if ($template) {
            $html = $template->render([...$templateVars, 'content' => $html]);
        }

        return $html;
    }

    /**
     * Replace {{first_name}}, {{last_name}}, {{name}}, {{email}}, {{company}}, {{phone}}, {{status}} tokens.
     */
    private function replaceLeadTokens(string $html, Lead $lead): string
    {
        $tokens = [
            '{{first_name}}' => $lead->first_name ?? '',
            '{{last_name}}'  => $lead->last_name ?? '',
            '{{name}}'       => $lead->full_name ?? '',
            '{{email}}'      => $lead->primary_email ?? '',
            '{{company}}'    => $lead->company ?? '',
            '{{phone}}'      => $lead->primary_phone ?? '',
            '{{status}}'     => $lead->status ?? '',
        ];

        return str_replace(array_keys($tokens), array_values($tokens), $html);
    }
}
