<?php

namespace App\Jobs;

use App\Models\Lead;
use App\Models\WhatsappCampaign;
use App\Models\WhatsappCredential;
use App\Models\WhatsappSend;
use App\Services\WhatsappService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendWhatsappBatch implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries   = 3;
    public int $backoff = 60;

    public function __construct(
        private int $campaignId,
        private array $leadIds,
        private bool $isFinalBatch = false
    ) {}

    public function handle(): void
    {
        $campaign = WhatsappCampaign::find($this->campaignId);

        if (!$campaign || $campaign->status === 'paused') {
            Log::info('WhatsApp campaign paused or missing, stopping batch', [
                'campaign_id' => $this->campaignId,
            ]);
            return;
        }

        $credential = WhatsappCredential::where('organization_id', $campaign->organization_id)
            ->where('is_active', true)
            ->first();

        if (!$credential) {
            Log::error('No active WhatsApp credential for org', [
                'org_id' => $campaign->organization_id,
            ]);
            $campaign->update(['status' => 'failed']);
            return;
        }

        $service = new WhatsappService($credential);

        foreach ($this->leadIds as $leadId) {
            $campaign->refresh();
            if ($campaign->status === 'paused') {
                Log::info('WhatsApp campaign paused mid-batch, stopping');
                return;
            }

            $lead = Lead::find($leadId);
            if (!$lead) continue;

            // Idempotency: skip if already sent and not failed
            $alreadySent = WhatsappSend::where('whatsapp_campaign_id', $this->campaignId)
                ->where('lead_id', $leadId)
                ->where('is_followup', false)
                ->whereNotIn('status', ['failed', 'undelivered'])
                ->exists();

            if ($alreadySent) continue;

            $message = $this->personalize($campaign->message_body, $lead);
            $result  = $service->send($lead, $message);

            WhatsappSend::create([
                'whatsapp_campaign_id' => $this->campaignId,
                'lead_id'              => $leadId,
                'organization_id'      => $campaign->organization_id,
                'to_number'            => $lead->whatsapp_number ?? $lead->primary_phone ?? '',
                'message_body'         => $message,
                'twilio_message_sid'   => $result['message_sid'] ?? null,
                'status'               => $result['success'] ? ($result['status'] ?? 'sent') : 'failed',
                'error_message'        => $result['error'] ?? null,
                'error_code'           => $result['error_code'] ?? null,
                'sent_at'              => $result['success'] ? now() : null,
                'failed_at'            => !$result['success'] ? now() : null,
            ]);

            if ($result['success']) {
                $campaign->increment('sent_count');
            } else {
                $campaign->increment('failed_count');
            }

            sleep(1); // respect Twilio rate limits
        }

        if ($this->isFinalBatch) {
            $campaign->refresh();
            $finalStatus = $campaign->failed_count > 0 && $campaign->sent_count === 0
                ? 'failed'
                : 'sent';
            $campaign->update([
                'status'  => $finalStatus,
                'sent_at' => now(),
            ]);
        }
    }

    private function personalize(string $template, Lead $lead): string
    {
        return str_replace(
            ['{{first_name}}', '{{last_name}}', '{{name}}', '{{company}}', '{{email}}', '{{phone}}'],
            [
                $lead->first_name,
                $lead->last_name,
                $lead->full_name,
                $lead->company ?? '',
                $lead->primary_email ?? '',
                $lead->primary_phone ?? '',
            ],
            $template
        );
    }
}
