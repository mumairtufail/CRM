<?php

namespace App\Jobs;

use App\Models\EmailAttachment;
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
use Illuminate\Support\Facades\Storage;
use Webklex\PHPIMAP\ClientManager;

class FetchEmailsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries   = 3;
    public int $timeout = 120;

    // Per-message caps so one oversized/abusive inbound email can't blow up
    // sync memory or storage — matches the 20 MB per-file limit used for
    // outgoing compose/reply attachments.
    private const MAX_ATTACHMENTS_PER_MESSAGE = 15;
    private const MAX_ATTACHMENT_BYTES        = 20 * 1024 * 1024;

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

        // Parse every message up front (pure in-memory work, no DB) so the dedup
        // lookups below can be done as two bulk queries instead of one query per
        // message inside the loop.
        $parsed = [];
        $errors = 0;
        foreach ($messages as $message) {
            try {
                $parsed[] = $this->parseMessage($message, $cred, $localFolder);
            } catch (\Throwable $e) {
                $errors++;
                $this->log('warning', 'Skipped one message', [
                    'folder' => $imapFolder,
                    'error'  => $e->getMessage(),
                ]);
            }
        }

        if (! $parsed) {
            return [0, $errors];
        }

        $messageIds = array_values(array_unique(array_column($parsed, 'message_id')));
        $uids       = array_values(array_unique(array_column($parsed, 'message_uid')));

        $existingByMessageId = FetchedEmail::where('smtp_credential_id', $cred->id)
            ->whereIn('message_id', $messageIds)
            ->get()
            ->keyBy('message_id');

        $existingByUid = FetchedEmail::where('smtp_credential_id', $cred->id)
            ->whereIn('message_uid', $uids)
            ->get()
            ->keyBy('message_uid');

        $saved      = 0;
        $toNotify   = [];

        foreach ($parsed as $item) {
            $attrs = $item['attrs'];

            // De-dup against locally-recorded sends: a composed email saved at send
            // time has no message_uid yet, but shares the Message-ID that now lands
            // in the Sent folder. Match on it and fill in the IMAP details instead of
            // creating a duplicate row.
            $existing = $existingByMessageId->get($item['message_id']) ?? $existingByUid->get($item['message_uid']);

            if ($existing) {
                $existing->update($attrs);
                $saved++;
                continue;
            }

            $fetched = FetchedEmail::create($attrs);
            $saved++;

            if (! empty($item['attachments'])) {
                $this->storeAttachments($fetched, $item['attachments']);
            }

            if ($notify && $item['from_email']) {
                $toNotify[] = [
                    'fetched'    => $fetched,
                    'from_name'  => $item['from_name'],
                    'from_email' => $item['from_email'],
                    'subject'    => $item['subject'],
                    'reply_ids'  => $item['reply_ids'],
                ];
            }
        }

        if ($toNotify) {
            $this->notifyInboundBatch($toNotify);
        }

        return [$saved, $errors];
    }

    /**
     * Extract everything needed from an IMAP message into a plain array,
     * without touching the database.
     */
    private function parseMessage($message, SmtpCredential $cred, string $localFolder): array
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

        $messageId = self::normalizeMessageId($message->getMessageId()) ?: $uid;

        return [
            'message_id'  => $messageId,
            'message_uid' => $uid,
            'from_name'   => $fromName,
            'from_email'  => $fromEmail,
            'subject'     => $subject,
            'reply_ids'   => $this->replyTargetIds($message),
            'attachments' => $this->extractAttachments($message),
            'attrs'       => [
                'organization_id'    => $this->organizationId,
                'smtp_credential_id' => $cred->id,
                'folder'             => $localFolder,
                'message_uid'        => $uid,
                'message_id'         => $messageId,
                'from_name'          => $fromName,
                'from_email'         => $fromEmail ?: 'unknown@unknown.com',
                'to_addresses'       => $toList,
                'cc_addresses'       => $ccList,
                'subject'            => mb_substr($subject, 0, 255),
                'body_html'          => $bodyHtml,
                'body_text'          => $bodyText,
                'sent_at'            => $date,
            ],
        ];
    }

    /**
     * Persist parsed attachment data (from extractAttachments) to the public
     * disk and create the corresponding EmailAttachment rows.
     *
     * @param array<int, array{name: string, mime: ?string, content: string}> $attachments
     */
    private function storeAttachments(FetchedEmail $fetched, array $attachments): void
    {
        foreach ($attachments as $att) {
            try {
                $path = "email-attachments/{$this->organizationId}/{$fetched->id}/" . uniqid() . '_' . $att['name'];
                Storage::disk('public')->put($path, $att['content']);

                EmailAttachment::create([
                    'organization_id'  => $this->organizationId,
                    'fetched_email_id' => $fetched->id,
                    'file_path'        => $path,
                    'original_name'    => $att['name'],
                    'mime_type'        => $att['mime'],
                    'size'             => strlen($att['content']),
                ]);
            } catch (\Throwable $e) {
                $this->log('warning', 'Failed to store one attachment', [
                    'email_id' => $fetched->id,
                    'name'     => $att['name'],
                    'error'    => $e->getMessage(),
                ]);
            }
        }
    }

    /**
     * Pull attachment name/mime/bytes out of an IMAP message, without touching
     * the database — capped in count and per-file size so one oversized or
     * abusive inbound email can't blow up sync memory/storage.
     *
     * @return array<int, array{name: string, mime: ?string, content: string}>
     */
    private function extractAttachments($message): array
    {
        if (! $message->hasAttachments()) {
            return [];
        }

        $out = [];

        foreach ($message->getAttachments() as $attachment) {
            if (count($out) >= self::MAX_ATTACHMENTS_PER_MESSAGE) {
                break;
            }

            try {
                $content = $attachment->getContent();
                if ($content === null || strlen($content) === 0 || strlen($content) > self::MAX_ATTACHMENT_BYTES) {
                    continue;
                }

                $out[] = [
                    'name'    => $attachment->getName() ?: 'attachment',
                    'mime'    => $attachment->getMimeType(),
                    'content' => $content,
                ];
            } catch (\Throwable $e) {
                // Skip a single unparseable attachment rather than failing the whole message.
            }
        }

        return $out;
    }

    /**
     * Raise notifications for a batch of newly-received emails in three bulk
     * queries total instead of up to three queries per message. If a message
     * is a reply to something we sent (matched via In-Reply-To / References
     * against stored Message-IDs), it's flagged as a reply; otherwise any mail
     * from a known lead is a plain "received" notification. Unknown senders
     * with no reply match are ignored.
     *
     * @param array<int, array{fetched: FetchedEmail, from_name: string, from_email: string, subject: string, reply_ids: array<int, string>}> $items
     */
    private function notifyInboundBatch(array $items): void
    {
        $allReplyIds   = array_values(array_unique(array_merge(...array_column($items, 'reply_ids'))));
        $allFromEmails = array_values(array_unique(array_column($items, 'from_email')));

        // Scoped to this org explicitly — the job runs without tenant context.
        $sendsByMessageId = $allReplyIds
            ? EmailSend::with('lead')
                ->where('organization_id', $this->organizationId)
                ->whereIn('message_id', $allReplyIds)
                ->get()
                ->keyBy('message_id')
            : collect();

        $sentMessageIds = $allReplyIds
            ? FetchedEmail::where('organization_id', $this->organizationId)
                ->where('folder', 'sent')
                ->whereIn('message_id', $allReplyIds)
                ->pluck('message_id')
                ->flip()
            : collect();

        $leadsByEmail = LeadEmail::with('lead')
            ->whereIn('email', $allFromEmails)
            ->get()
            ->keyBy(fn ($le) => strtolower($le->email));

        foreach ($items as $item) {
            $fetched   = $item['fetched'];
            $fromName  = $item['from_name'];
            $fromEmail = $item['from_email'];
            $subject   = $item['subject'];

            $isReply = false;
            $lead    = null;

            foreach ($item['reply_ids'] as $replyId) {
                if ($send = $sendsByMessageId->get($replyId)) {
                    $isReply = true;
                    $lead    = $send->lead;
                    break;
                }

                if ($sentMessageIds->has($replyId)) {
                    $isReply = true;
                }
            }

            if (! $lead) {
                $lead = $leadsByEmail->get(strtolower($fromEmail))?->lead;
            }

            // A reply from an unknown contact is still worth surfacing; a non-reply
            // from an unknown contact is not.
            if (! $isReply && ! $lead) {
                continue;
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
