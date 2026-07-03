<?php

namespace App\Jobs;

use App\Models\Lead;
use App\Models\TenantWhatsappSettings;
use App\Models\WhatsappCampaign;
use App\Models\WhatsappSend;
use App\Services\WhatsappService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;

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

        $settings = TenantWhatsappSettings::forOrganization($campaign->organization_id);

        if (!$settings || !$settings->isUsableForSend()) {
            Log::error('WhatsApp not enabled for org', [
                'org_id' => $campaign->organization_id,
            ]);
            $campaign->update(['status' => 'failed']);
            return;
        }

        $service     = new WhatsappService();
        $limiterKey  = "whatsapp-send:{$campaign->organization_id}";
        $limit       = TenantWhatsappSettings::sendLimitFor($campaign->organization_id);

        foreach ($this->leadIds as $leadId) {
            $campaign->refresh();
            if ($campaign->status === 'paused') {
                Log::info('WhatsApp campaign paused mid-batch, stopping');
                return;
            }

            if (!TenantWhatsappSettings::forOrganization($campaign->organization_id)?->isUsableForSend()) {
                Log::info('WhatsApp disabled for org mid-batch, stopping', [
                    'org_id' => $campaign->organization_id,
                ]);
                return;
            }

            $lead = Lead::find($leadId);
            if (!$lead) continue;

            if (RateLimiter::tooManyAttempts($limiterKey, $limit->maxAttempts)) {
                Log::info('WhatsApp rate limit hit, releasing batch to retry later', [
                    'org_id' => $campaign->organization_id,
                ]);
                $this->release(RateLimiter::availableIn($limiterKey));
                return;
            }
            RateLimiter::hit($limiterKey, $limit->decaySeconds);

            // Idempotency: skip if already sent and not failed
            $alreadySent = WhatsappSend::where('whatsapp_campaign_id', $this->campaignId)
                ->where('lead_id', $leadId)
                ->where('is_followup', false)
                ->whereNotIn('status', ['failed', 'undelivered'])
                ->exists();

            if ($alreadySent) continue;

            $message = $this->personalize($campaign->message_body, $lead);
            $result  = $service->send($lead, $message, $campaign->organization_id);

            WhatsappSend::create([
                'whatsapp_campaign_id' => $this->campaignId,
                'lead_id'              => $leadId,
                'organization_id'      => $campaign->organization_id,
                'whatsapp_message_id'  => $result['whatsapp_message_id'] ?? null,
                'to_number'            => $lead->whatsapp_number ?? $lead->primary_phone ?? '',
                'message_body'         => $message,
                'wa_message_id'        => $result['wa_message_id'] ?? null,
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
