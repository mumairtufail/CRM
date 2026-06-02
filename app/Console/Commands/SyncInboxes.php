<?php

namespace App\Console\Commands;

use App\Jobs\FetchEmailsJob;
use App\Models\SmtpCredential;
use Illuminate\Console\Command;

class SyncInboxes extends Command
{
    protected $signature   = 'inboxes:sync';
    protected $description = 'Fetch new emails for all accounts that have IMAP configured';

    public function handle(): void
    {
        $credentials = SmtpCredential::whereNotNull('imap_host')
            ->where('imap_host', '!=', '')
            ->where('is_active', true)
            ->get();

        $this->info("Syncing {$credentials->count()} inbox(es)…");

        foreach ($credentials as $cred) {
            try {
                FetchEmailsJob::dispatchSync($cred->organization_id, $cred->id);
                $this->line("  ✓ org:{$cred->organization_id} cred:{$cred->id}");
            } catch (\Throwable $e) {
                $this->error("  ✗ org:{$cred->organization_id} cred:{$cred->id} — {$e->getMessage()}");
            }
        }

        $this->info('Done.');
    }
}
