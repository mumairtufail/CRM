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
    protected $description = 'Dispatch follow-up emails for campaigns where the lead has not opened any email in the sequence';

    public function handle(): void
    {
        $dispatched = 0;

        EmailCampaign::where('followup_enabled', true)
            ->whereIn('status', ['sending', 'sent'])
            ->with(['organization'])
            ->chunkById(100, function ($campaigns) use (&$dispatched) {
                foreach ($campaigns as $campaign) {
                    $org = $campaign->organization ?? \App\Models\Organization::find($campaign->organization_id);
                    if (! $org || ! $org->isFollowupEnabled()) continue;

                    $user = User::where('organization_id', $campaign->organization_id)
                        ->where('role', 'owner')
                        ->first();
                    if (! $user) continue;

                    $steps    = $campaign->followup_steps ?? [];
                    $isLegacy = empty($steps);

                    // Backward compat: old campaigns stored a single followup in flat columns
                    if ($isLegacy) {
                        if (! $campaign->followup_subject || ! $campaign->followup_body_html) continue;
                        $steps = [[
                            'delay_hours' => $campaign->followup_delay_hours ?? 48,
                            'subject'     => $campaign->followup_subject,
                            'body_html'   => $campaign->followup_body_html,
                        ]];
                    }

                    $batchSize   = $user->mail_batch_size  ?? 10;
                    $batchDelay  = $user->mail_batch_delay ?? 5;
                    $globalDelay = 0;

                    foreach ($steps as $i => $stepData) {
                        $stepNumber = $i + 1;
                        $cutoff     = now()->subHours($stepData['delay_hours']);

                        $query = EmailSend::where('email_campaign_id', $campaign->id)
                            ->where('is_followup', false)
                            ->where('status', 'sent')
                            ->where('sent_at', '<=', $cutoff)
                            // Stop the sequence if the lead has opened or clicked ANY email in this campaign
                            ->whereNotExists(function ($q) use ($campaign) {
                                $q->select(DB::raw(1))
                                    ->from('email_sends as eng')
                                    ->whereColumn('eng.lead_id', 'email_sends.lead_id')
                                    ->where('eng.email_campaign_id', $campaign->id)
                                    ->where(function ($q2) {
                                        $q2->whereIn('eng.status', ['opened', 'clicked'])
                                            ->orWhereNotNull('eng.opened_at');
                                    });
                            });

                        if ($isLegacy) {
                            // Legacy path: use parent_send_id check to avoid NULL mismatch with followup_step
                            $query->whereNotExists(function ($q) {
                                $q->select(DB::raw(1))
                                    ->from('email_sends as fu')
                                    ->whereColumn('fu.parent_send_id', 'email_sends.id');
                            });
                        } else {
                            // Multi-step path: idempotency per step using lead_id + followup_step
                            $query->whereNotExists(function ($q) use ($campaign, $stepNumber) {
                                $q->select(DB::raw(1))
                                    ->from('email_sends as fu')
                                    ->whereColumn('fu.lead_id', 'email_sends.lead_id')
                                    ->where('fu.email_campaign_id', $campaign->id)
                                    ->where('fu.is_followup', true)
                                    ->where('fu.followup_step', $stepNumber);
                            });
                        }

                        $parentSendIds = $query->pluck('id')->all();

                        if (empty($parentSendIds)) continue;

                        $chunks = array_chunk($parentSendIds, $batchSize);

                        foreach ($chunks as $j => $chunk) {
                            SendFollowUpBatch::dispatch(
                                $campaign->id,
                                $chunk,
                                $user->id,
                                $stepNumber,
                                $stepData,
                            )->delay(now()->addSeconds($globalDelay + ($j * $batchDelay)));
                        }

                        $globalDelay += count($chunks) * $batchDelay + 5;

                        $count = count($parentSendIds);
                        $dispatched += $count;
                        $this->line("  Campaign #{$campaign->id} \"{$campaign->name}\" step {$stepNumber}: queued {$count} follow-up(s)");
                    }
                }
            });

        $this->info("Done — {$dispatched} follow-up(s) queued.");
    }
}
