<?php

namespace App\Services;

use App\Jobs\FetchEmailsJob;
use App\Mail\CampaignMail;
use App\Models\EmailCampaign;
use App\Models\EmailSend;
use App\Models\EmailTemplate;
use App\Models\FetchedEmail;
use App\Models\Lead;
use App\Models\SmtpCredential;
use App\Models\User;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

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

        $templateVars = EmailTemplate::varsFor($user, $this->credential->from_name);

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
                    $renderedHtml    = $this->buildHtml($campaign->body_html, $lead, $template, $templateVars);
                    $renderedSubject = $this->replaceLeadTokens($campaign->subject, $lead);

                    Mail::mailer('dynamic')
                        ->to($email, $lead->full_name)
                        ->send(new CampaignMail($campaign, $lead, $renderedHtml, null, null, $renderedSubject));

                    EmailSend::updateOrCreate(
                        ['email_campaign_id' => $campaign->id, 'lead_id' => $lead->id],
                        ['email_used' => $email, 'status' => 'sent', 'sent_at' => now(), 'error_message' => null]
                    );
                    $sent++;
                } catch (\Throwable $e) {
                    EmailSend::updateOrCreate(
                        ['email_campaign_id' => $campaign->id, 'lead_id' => $lead->id],
                        ['email_used' => $email, 'status' => 'failed', 'sent_at' => now(), 'error_message' => Str::limit($e->getMessage(), 480)]
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
                ...EmailTemplate::varsFor($user, $this->credential->from_name),
                'content' => $bodyHtml,
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
     * Send a composed email from the Inbox compose dialog.
     */
    public function sendCompose(string $toEmail, string $subject, string $bodyHtml): void
    {
        $this->configureMailer();

        $user     = $this->credential->user;
        $template = $user?->active_template_id
            ? EmailTemplate::find($user->active_template_id)
            : null;

        $html = $template
            ? $template->render([
                ...EmailTemplate::varsFor($user, $this->credential->from_name),
                'content' => $bodyHtml,
            ])
            : $bodyHtml;

        // Pin an explicit Message-ID so the locally-recorded "sent" row can be
        // matched (and de-duped) against the same message once it shows up in the
        // provider's Sent folder during the next IMAP sync.
        $domain    = Str::after($this->credential->from_email, '@') ?: 'localhost';
        $messageId = (string) Str::uuid() . '@' . $domain;

        Mail::mailer('dynamic')->html($html, function ($message) use ($toEmail, $subject, $messageId) {
            $message
                ->to($toEmail)
                ->from($this->credential->from_email, $this->credential->from_name)
                ->subject($subject);

            $headers = $message->getSymfonyMessage()->getHeaders();
            $headers->remove('Message-ID');
            $headers->addIdHeader('Message-ID', $messageId);
        });

        $this->recordSent($toEmail, $subject, $html, $messageId);
    }

    /**
     * Reply to a fetched email, threading it via In-Reply-To/References so it
     * lands in the same conversation in the recipient's mail client.
     */
    public function sendReply(FetchedEmail $original, string $bodyHtml): void
    {
        $this->configureMailer();

        $user     = $this->credential->user;
        $template = $user?->active_template_id
            ? EmailTemplate::find($user->active_template_id)
            : null;

        $html = $template
            ? $template->render([
                ...EmailTemplate::varsFor($user, $this->credential->from_name),
                'content' => $bodyHtml,
            ])
            : $bodyHtml;

        // Replying to something we sent goes back to its recipient; replying to
        // something we received goes back to its sender.
        $isSent  = $original->folder === 'sent';
        $toEmail = $isSent ? ($original->to_addresses[0]['email'] ?? null) : $original->from_email;
        $toName  = $isSent ? ($original->to_addresses[0]['name'] ?? '') : ($original->from_name ?? '');

        if (!$toEmail) {
            throw new \RuntimeException('Original email has no recipient to reply to.');
        }

        $subject = Str::startsWith(Str::lower(trim($original->subject ?? '')), 're:')
            ? $original->subject
            : 'Re: ' . $original->subject;

        $domain    = Str::after($this->credential->from_email, '@') ?: 'localhost';
        $messageId = (string) Str::uuid() . '@' . $domain;
        $inReplyTo = $original->message_id ? '<' . $original->message_id . '>' : null;

        Mail::mailer('dynamic')->html($html, function ($message) use ($toEmail, $toName, $subject, $messageId, $inReplyTo) {
            $message
                ->to($toEmail, $toName ?: null)
                ->from($this->credential->from_email, $this->credential->from_name)
                ->subject($subject);

            $headers = $message->getSymfonyMessage()->getHeaders();
            $headers->remove('Message-ID');
            $headers->addIdHeader('Message-ID', $messageId);
            if ($inReplyTo) {
                $headers->addTextHeader('In-Reply-To', $inReplyTo);
                $headers->addTextHeader('References', $inReplyTo);
            }
        });

        $this->recordSent($toEmail, $subject, $html, $messageId, $toName ?: '');
    }

    /**
     * Persist a copy of an outgoing email into the Sent folder so it's visible in
     * the inbox immediately, without waiting for an IMAP sync — and regardless of
     * whether IMAP is even configured. Best-effort: a failure here must not
     * surface as a send failure. The shared Message-ID lets the next IMAP Sent
     * sync de-dupe against this row instead of creating a duplicate.
     */
    public function recordSent(string $toEmail, string $subject, string $html, string $messageId, string $toName = ''): void
    {
        try {
            FetchedEmail::create([
                'organization_id'    => $this->credential->organization_id,
                'smtp_credential_id' => $this->credential->id,
                'folder'             => 'sent',
                'message_uid'        => null,
                'message_id'         => FetchEmailsJob::normalizeMessageId($messageId),
                'from_name'          => $this->credential->from_name,
                'from_email'         => $this->credential->from_email,
                'to_addresses'       => [['name' => $toName, 'email' => $toEmail]],
                'cc_addresses'       => [],
                'subject'            => mb_substr($subject, 0, 255),
                'body_html'          => $html,
                'body_text'          => trim(strip_tags($html)),
                'is_read'            => true,
                'sent_at'            => now(),
            ]);

            \Log::channel('mail')->info('Recorded sent email', [
                'org'        => $this->credential->organization_id,
                'to'         => $toEmail,
                'subject'    => mb_substr($subject, 0, 80),
                'message_id' => $messageId,
            ]);
        } catch (\Throwable $e) {
            \Log::channel('mail')->warning('Failed to record sent email', [
                'to'    => $toEmail,
                'error' => $e->getMessage(),
            ]);
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

    /**
     * Send email using the Superadmin's default configured SMTP credentials.
     */
    public static function sendUsingSuperadminSmtp(string $toEmail, string $subject, string $bodyHtml): void
    {
        $smtp = \App\Models\SystemSetting::getSmtp();
        
        if (empty($smtp['host']) || empty($smtp['username'])) {
            // Fallback to default mailer configuration if superadmin SMTP is not configured
            Mail::html($bodyHtml, function ($message) use ($toEmail, $subject) {
                $message->to($toEmail)->subject($subject);
            });
            return;
        }

        Config::set('mail.mailers.superadmin_dynamic', [
            'transport'  => 'smtp',
            'host'       => $smtp['host'],
            'port'       => $smtp['port'] ?? 587,
            'encryption' => ($smtp['encryption'] === 'none' || empty($smtp['encryption'])) ? null : $smtp['encryption'],
            'username'   => $smtp['username'],
            'password'   => $smtp['password'],
            'timeout'    => 30,
        ]);

        Mail::mailer('superadmin_dynamic')->html($bodyHtml, function ($message) use ($toEmail, $subject, $smtp) {
            $message
                ->to($toEmail)
                ->from($smtp['from_email'] ?? $smtp['username'], $smtp['from_name'] ?? 'System')
                ->subject($subject);
        });
    }
}
