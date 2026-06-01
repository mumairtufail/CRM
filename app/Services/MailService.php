<?php

namespace App\Services;

use App\Mail\CampaignMail;
use App\Models\EmailCampaign;
use App\Models\EmailSend;
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

        $query = Lead::with('emails');
        foreach ($campaign->filters ?? [] as $key => $value) {
            if ($key === 'status' && $value) {
                $query->where('status', $value);
            }
            if ($key === 'tag_id' && $value) {
                $query->whereHas('tags', fn ($q) => $q->where('tags.id', $value));
            }
        }

        $leads     = $query->get();
        $sent      = 0;
        $failed    = 0;
        $skipped   = 0;
        $batchNum  = 0;

        foreach ($leads->chunk($batchSize) as $batch) {
            if ($batchNum > 0 && $batchDelay > 0) {
                sleep($batchDelay);
            }

            foreach ($batch as $lead) {
                $email = $lead->primary_email;
                if (!$email) { $skipped++; continue; }

                // Skip already sent
                $alreadySent = EmailSend::where('email_campaign_id', $campaign->id)
                    ->where('lead_id', $lead->id)
                    ->where('status', 'sent')
                    ->exists();
                if ($alreadySent) { $skipped++; continue; }

                try {
                    Mail::mailer('dynamic')
                        ->to($email, $lead->full_name)
                        ->send(new CampaignMail($campaign, $lead));

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

        Mail::mailer('dynamic')->raw(
            "This is a test email to verify your SMTP connection is working correctly.\n\nSent from your CRM.",
            function ($message) use ($toEmail) {
                $message
                    ->to($toEmail)
                    ->from($this->credential->from_email, $this->credential->from_name)
                    ->subject('SMTP Test — Connection Verified');
            }
        );
    }
}
