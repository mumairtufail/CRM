<?php

namespace App\Console\Commands;

use App\Jobs\SendFollowUpBatch;
use App\Models\EmailCampaign;
use App\Models\EmailSend;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SendCampaignFollowUps extends Command
{
    protected $signature   = 'campaigns:send-followups';
    protected $description = 'Dispatch follow-up emails for campaigns where the lead has not opened the original email';

    public function handle(): void
    {
        $dispatched = 0;

        // Process in chunks to avoid loading everything into memory at once.
        // Only look at campaigns that have follow-ups enabled and are active.
        EmailCampaign::where('followup_enabled', true)
            ->whereIn('status', ['sending', 'sent'])
            ->with(['organization']) // pre-load to avoid N+1 across 10k+ workspaces
            ->chunkById(100, function ($campaigns) use (&$dispatched) {
                foreach ($campaigns as $campaign) {
                    // Check the org-level master toggle
                    $org = $campaign->organization ?? null;
                    if (! $org) {
                        $org = \App\Models\Organization::find($campaign->organization_id);
                    }
                    if (! $org || ! $org->isFollowupEnabled()) continue;

                    // Find the user who owns this campaign's SMTP credential.
                    // We use the org owner as the sender — same user who would
                    // have triggered the original send.
                    $user = User::where('organization_id', $campaign->organization_id)
                        ->where('role', 'owner')
                        ->first();
                    if (! $user) continue;

                    // Find original sends that:
                    // - belong to this campaign
                    // - are NOT follow-ups themselves (prevents chaining)
                    // - have status 'sent' (not opened, not clicked = no engagement yet)
                    // - were sent more than followup_delay_hours ago
                    // - don't already have a follow-up child send
                    $cutoff = now()->subHours($campaign->followup_delay_hours);

                    $parentSendIds = EmailSend::where('email_campaign_id', $campaign->id)
                        ->where('is_followup', false)
                        ->where('status', 'sent')
                        ->where('sent_at', '<=', $cutoff)
                        ->whereNotExists(function ($query) {
                            $query->select(DB::raw(1))
                                ->from('email_sends as fu')
                                ->whereColumn('fu.parent_send_id', 'email_sends.id');
                        })
                        ->pluck('id')
                        ->all();

                    if (empty($parentSendIds)) continue;

                    // Chunk and dispatch with same batch_size / batch_delay pattern
                    $batchSize  = $user->mail_batch_size  ?? 10;
                    $batchDelay = $user->mail_batch_delay ?? 5;
                    $chunks     = array_chunk($parentSendIds, $batchSize);

                    foreach ($chunks as $i => $chunk) {
                        SendFollowUpBatch::dispatch($campaign->id, $chunk, $user->id)
                            ->delay(now()->addSeconds($i * $batchDelay));
                    }

                    $count = count($parentSendIds);
                    $dispatched += $count;
                    $this->line("  Campaign #{$campaign->id} \"{$campaign->name}\": queued {$count} follow-up(s)");
                }
            });

        $this->info("Done — {$dispatched} follow-up(s) queued.");
    }
}
