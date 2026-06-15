<?php

namespace App\Jobs;

use App\Models\EmailSend;
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

        // Received mail — the INBOX folder. New messages here trigger lead notifications.
        [$savedIn, $errIn] = $this->processFolder($client, $cred, 'INBOX', 'inbox', notify: true);

        // Sent mail — the provider's Sent folder. Names vary across providers, so
        // try the common candidates and use the first that opens. Outgoing mail
        // never triggers notifications and is marked read.
        [$savedOut, $errOut] = [0, 0];
        $sentFolder = $this->openSentFolder($client);
        if ($sentFolder) {
            [$savedOut, $errOut] = $this->processFolder($client, $cred, $sentFolder, 'sent', notify: false);
        } else {
            $this->log('info', 'No Sent folder found — skipping sent sync');
        }

        $client->disconnect();
        $this->log('info', 'IMAP disconnected');

        $cred->update(['last_fetched_at' => now()]);

        $this->log('info', "Done — inbox(saved:{$savedIn}, err:{$errIn}), sent(saved:{$savedOut}, err:{$errOut})");
    }

    /**
     * Locate the provider's Sent folder by trying the common names. Returns the
     * folder name that opened, or null if none could be opened.
     */
    private function openSentFolder($client): ?string
    {
        $candidates = ['Sent', 'Sent Mail', 'Sent Items', 'INBOX.Sent', '[Gmail]/Sent Mail'];

        foreach ($candidates as $name) {
            try {
                $folder = $client->getFolder($name);
                if ($folder) {
                    $this->log('info', "Opened Sent folder: {$name}");
                    return $name;
                }
            } catch (\Throwable $e) {
                // try the next candidate
            }
        }

        return null;
    }

    /**
     * Fetch and persist messages from one IMAP folder.
     * Returns [saved, errors].
     */
    private function processFolder($client, SmtpCredential $cred, string $imapFolder, string $localFolder, bool $notify): array
    {
        try {
            $folder = $client->getFolder($imapFolder);
        } catch (\Throwable $e) {
            $this->log('warning', "Could not open folder {$imapFolder}", ['error' => $e->getMessage()]);
            return [0, 0];
        }

        try {
            $query = $folder->messages()->setFetchOrder('desc');

            if ($cred->last_fetched_at) {
                // Incremental: only messages since the last sync (5-min buffer for boundary safety)
                $since = $cred->last_fetched_at->subMinutes(5);
                $messages = $query->whereSince($since)->get();
            } else {
                // First sync: grab the 50 most recent messages
                $messages = $query->whereAll()->limit(50)->get();
            }

            $this->log('info', "Fetched {$messages->count()} messages from {$imapFolder}");
        } catch (\Throwable $e) {
            $this->log('warning', "Failed to fetch messages from {$imapFolder}", ['error' => $e->getMessage()]);
            return [0, 0];
        }

        $saved  = 0;
        $errors = 0;

        foreach ($messages as $message) {
            try {
                $this->saveMessage($message, $cred, $localFolder, $notify);
                $saved++;
            } catch (\Throwable $e) {
                $errors++;
                $this->log('warning', 'Skipped one message', [
                    'folder' => $imapFolder,
                    'error'  => $e->getMessage(),
                ]);
            }
        }

        return [$saved, $errors];
    }

    private function saveMessage($message, SmtpCredential $cred, string $localFolder, bool $notify): void
    {
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

        $messageId = self::normalizeMessageId($message->getMessageId());

        $attrs = [
            'organization_id' => $this->organizationId,
            'folder'          => $localFolder,
            'message_uid'     => $uid,
            'message_id'      => $messageId ?: $uid,
            'from_name'       => $fromName,
            'from_email'      => $fromEmail ?: 'unknown@unknown.com',
            'to_addresses'    => $toList,
            'cc_addresses'    => $ccList,
            'subject'         => mb_substr($subject, 0, 255),
            'body_html'       => $bodyHtml,
            'body_text'       => $bodyText,
            'sent_at'         => $date,
        ];

        // De-dup against locally-recorded sends: a composed email saved at send
        // time has no message_uid yet, but shares the Message-ID that now lands
        // in the Sent folder. Match on it and fill in the IMAP details instead of
        // creating a duplicate row.
        $existing = $messageId
            ? FetchedEmail::where('smtp_credential_id', $cred->id)
                ->where('message_id', $messageId)
                ->first()
            : null;

        if ($existing) {
            $existing->update($attrs);
            return;
        }

        $fetched = FetchedEmail::updateOrCreate(
            ['smtp_credential_id' => $cred->id, 'message_uid' => $uid],
            $attrs,
        );

        // Only notify on genuinely new received emails, not updates or sent mail
        if ($notify && $fetched->wasRecentlyCreated && $fromEmail) {
            $this->notifyInbound($message, $fetched, $fromName, $fromEmail, $subject);
        }
    }

    /**
     * Raise a notification for a newly-received email. If the message is a reply
     * to one of our sends (matched via In-Reply-To / References against stored
     * Message-IDs), it's flagged as a reply; otherwise any mail from a known lead
     * is a plain "received" notification. Unknown senders are ignored.
     */
    private function notifyInbound($message, FetchedEmail $fetched, string $fromName, string $fromEmail, string $subject): void
    {
        // 1. Is this a reply to something we sent? Match the referenced Message-IDs
        //    against campaign sends first, then composed/sent mail.
        $replyIds   = $this->replyTargetIds($message);
        $isReply    = false;
        $lead       = null;

        if ($replyIds) {
            // Scoped to this org explicitly — the job runs without tenant context.
            $send = EmailSend::with('lead')
                ->where('organization_id', $this->organizationId)
                ->whereIn('message_id', $replyIds)
                ->first();

            if ($send) {
                $isReply = true;
                $lead    = $send->lead;
            } elseif (
                FetchedEmail::where('organization_id', $this->organizationId)
                    ->where('folder', 'sent')
                    ->whereIn('message_id', $replyIds)
                    ->exists()
            ) {
                $isReply = true;
            }
        }

        // 2. Resolve the lead by sender address when the reply match didn't give one.
        if (! $lead) {
            $lead = LeadEmail::with('lead')
                ->whereRaw('LOWER(email) = ?', [strtolower($fromEmail)])
                ->first()?->lead;
        }

        // A reply from an unknown contact is still worth surfacing; a non-reply
        // from an unknown contact is not.
        if (! $isReply && ! $lead) {
            return;
        }

        $who = $fromName ?: ($lead?->name ?: $fromEmail);

        Notification::record([
            'organization_id' => $this->organizationId,
            'type'            => $isReply ? 'lead.email_replied' : 'lead.email_received',
            'title'           => $isReply ? "{$who} replied to your email" : "{$who} sent you an email",
            'body'            => mb_substr($subject, 0, 150),
            'link'            => $lead ? '/leads/' . $lead->id : '/inbox',
            'data'            => [
                'lead_id'  => $lead?->id,
                'email_id' => $fetched->id,
            ],
        ]);

        $this->log('info', ($isReply ? 'Reply' : 'Received') . " notification created", [
            'lead_id'  => $lead?->id,
            'email_id' => $fetched->id,
        ]);
    }

    /**
     * Collect normalized Message-IDs this message is replying to, from the
     * In-Reply-To and References headers. Best-effort and never throws.
     */
    private function replyTargetIds($message): array
    {
        $ids = [];

        foreach (['in_reply_to', 'references'] as $key) {
            try {
                $raw = (string) ($message->getHeader()?->get($key) ?? '');
            } catch (\Throwable $e) {
                $raw = '';
            }

            foreach (preg_split('/\s+/', trim($raw)) ?: [] as $part) {
                $norm = self::normalizeMessageId($part);
                if ($norm) {
                    $ids[] = $norm;
                }
            }
        }

        return array_values(array_unique($ids));
    }

    /**
     * Normalize a Message-ID for matching: strip angle brackets/whitespace and
     * lowercase. Returns null when empty. Locally-recorded sends store the same
     * normalized form so the two halves line up during dedup.
     */
    public static function normalizeMessageId(?string $raw): ?string
    {
        $id = trim(trim((string) $raw), '<>');
        return $id !== '' ? mb_strtolower($id) : null;
    }

    public function failed(\Throwable $e): void
    {
        $this->log('error', 'Job permanently failed', ['error' => $e->getMessage()]);
    }
}
