<?php

namespace App\Jobs;

use App\Models\FetchedEmail;
use App\Models\LeadEmail;
use App\Models\Notification;
use App\Models\SmtpCredential;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Webklex\PHPIMAP\ClientManager;

class FetchEmailsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries   = 3;
    public int $timeout = 120;

    public function __construct(
        public readonly int $organizationId,
        public readonly int $credentialId,
    ) {}

    private function log(string $level, string $message, array $context = []): void
    {
        Log::channel('inbox')->{$level}("[org:{$this->organizationId} cred:{$this->credentialId}] {$message}", $context);
    }

    public function handle(): void
    {
        $this->log('info', 'Job started');

        $cred = SmtpCredential::find($this->credentialId);

        if (!$cred) {
            $this->log('error', 'SmtpCredential not found — aborting');
            return;
        }

        if (!$cred->imap_host) {
            $this->log('warning', 'IMAP host not set on credential — aborting');
            return;
        }

        $this->log('info', 'Connecting to IMAP', [
            'host'       => $cred->imap_host,
            'port'       => $cred->imap_port,
            'encryption' => $cred->imap_encryption,
            'username'   => $cred->username,
        ]);

        $cm = new ClientManager([]);

        $client = $cm->make([
            'host'          => $cred->imap_host,
            'port'          => $cred->imap_port    ?? 993,
            'encryption'    => $cred->imap_encryption ?? 'ssl',
            'validate_cert' => false,
            'username'      => $cred->username,
            'password'      => $cred->password,
            'protocol'      => 'imap',
        ]);

        try {
            $client->connect();
            $this->log('info', 'IMAP connection established');
        } catch (\Throwable $e) {
            $this->log('error', 'IMAP connect failed', ['error' => $e->getMessage()]);
            throw $e;
        }

        try {
            $folder = $client->getFolder('INBOX');
            $this->log('info', 'Opened INBOX folder');
        } catch (\Throwable $e) {
            $this->log('error', 'Could not open INBOX folder', ['error' => $e->getMessage()]);
            $client->disconnect();
            throw $e;
        }

        try {
            $query = $folder->messages()->setFetchOrder('desc');

            if ($cred->last_fetched_at) {
                // Incremental: only messages since the last sync (5-min buffer for boundary safety)
                $since = $cred->last_fetched_at->subMinutes(5);
                $this->log('info', 'Incremental sync since', ['since' => $since->toDateTimeString()]);
                $messages = $query->whereSince($since)->get();
            } else {
                // First sync: grab the 50 most recent messages
                $messages = $query->whereAll()->limit(50)->get();
            }

            $total = $messages->count();
            $this->log('info', "Fetched {$total} messages from IMAP");
        } catch (\Throwable $e) {
            $this->log('error', 'Failed to fetch messages', ['error' => $e->getMessage()]);
            $client->disconnect();
            throw $e;
        }

        $saved  = 0;
        $errors = 0;

        foreach ($messages as $message) {
            try {
                $uid = (string) $message->getUid();

                $from      = $message->getFrom();
                $fromFirst = $from?->first();
                $fromName  = $fromFirst?->personal ?? '';
                $fromEmail = $fromFirst?->mail ?? '';

                $toList = collect($message->getTo() ?? [])->map(fn ($a) => [
                    'name'  => $a->personal ?? '',
                    'email' => $a->mail ?? '',
                ])->values()->toArray();

                $ccList = collect($message->getCc() ?? [])->map(fn ($a) => [
                    'name'  => $a->personal ?? '',
                    'email' => $a->mail ?? '',
                ])->values()->toArray();

                $subject  = (string) ($message->getSubject() ?? '(No subject)');
                $bodyHtml = (string) ($message->getHTMLBody() ?? '');
                $bodyText = (string) ($message->getTextBody() ?? '');

                $dateAttr = $message->getDate();
                $date     = $dateAttr?->first()?->toDateTime() ?? null;

                $fetched = FetchedEmail::updateOrCreate(
                    [
                        'smtp_credential_id' => $cred->id,
                        'message_uid'        => $uid,
                    ],
                    [
                        'organization_id' => $this->organizationId,
                        'message_id'      => (string) ($message->getMessageId() ?? $uid),
                        'from_name'       => $fromName,
                        'from_email'      => $fromEmail ?: 'unknown@unknown.com',
                        'to_addresses'    => $toList,
                        'cc_addresses'    => $ccList,
                        'subject'         => mb_substr($subject, 0, 255),
                        'body_html'       => $bodyHtml,
                        'body_text'       => $bodyText,
                        'sent_at'         => $date,
                    ]
                );

                // Only notify on genuinely new emails, not updates
                if ($fetched->wasRecentlyCreated && $fromEmail) {
                    $leadEmail = LeadEmail::with('lead')
                        ->whereRaw('LOWER(email) = ?', [strtolower($fromEmail)])
                        ->first();

                    if ($leadEmail?->lead) {
                        $lead = $leadEmail->lead;
                        Notification::create([
                            'organization_id' => $this->organizationId,
                            'type'            => 'lead.email_received',
                            'title'           => ($fromName ?: $lead->name) . ' sent you an email',
                            'body'            => mb_substr($subject, 0, 150),
                            'link'            => '/leads/' . $lead->id,
                            'data'            => [
                                'lead_id'  => $lead->id,
                                'email_id' => $fetched->id,
                            ],
                        ]);
                        $this->log('info', "Lead email notification created for lead:{$lead->id}");
                    }
                }

                $saved++;
            } catch (\Throwable $e) {
                $errors++;
                $this->log('warning', 'Skipped one message', [
                    'uid'   => $uid ?? 'unknown',
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $client->disconnect();
        $this->log('info', 'IMAP disconnected');

        $cred->update(['last_fetched_at' => now()]);

        $this->log('info', "Done — saved: {$saved}, errors: {$errors}");
    }

    public function failed(\Throwable $e): void
    {
        $this->log('error', 'Job permanently failed', ['error' => $e->getMessage()]);
    }
}
