<?php

namespace App\Jobs;

use App\Models\Lead;
use App\Models\TenantWhatsappSettings;
use App\Models\WhatsappConversation;
use App\Models\WhatsappMessage;
use App\Models\WhatsappSend;
use App\Models\WhatsappUnassignedInbound;
use App\Models\WhatsappUsageMonthly;
use App\Services\WhatsappBotService;
use App\Services\WhatsappService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessMetaWebhookPayload implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(private array $payload) {}

    public function handle(WhatsappBotService $botService): void
    {
        foreach ($this->payload['entry'] ?? [] as $entry) {
            foreach ($entry['changes'] ?? [] as $change) {
                $value = $change['value'] ?? [];

                foreach ($value['statuses'] ?? [] as $status) {
                    $this->handleStatus($status);
                }

                foreach ($value['messages'] ?? [] as $message) {
                    $this->handleInboundMessage($message, $botService);
                }
            }
        }
    }

    private function handleStatus(array $status): void
    {
        $waMessageId = $status['id'] ?? null;
        $metaStatus  = $status['status'] ?? null; // sent, delivered, read, failed
        if (!$waMessageId || !$metaStatus) {
            return;
        }

        $message = WhatsappMessage::withoutGlobalScopes()->where('wa_message_id', $waMessageId)->first();
        if (!$message) {
            return;
        }

        $message->update(['status' => $metaStatus]);

        WhatsappSend::withoutGlobalScopes()->where('whatsapp_message_id', $message->id)->update([
            'status'       => $metaStatus,
            'delivered_at' => in_array($metaStatus, ['delivered', 'read']) ? now() : null,
            'read_at'      => $metaStatus === 'read' ? now() : null,
            'failed_at'    => $metaStatus === 'failed' ? now() : null,
        ]);

        if ($metaStatus === 'read') {
            WhatsappConversation::withoutGlobalScopes()->where('whatsapp_message_id', $message->id)
                ->update(['is_read' => true]);
        }

        if ($metaStatus === 'delivered') {
            WhatsappUsageMonthly::incrementFor($message->organization_id, 'delivered_count');
        } elseif ($metaStatus === 'failed') {
            WhatsappUsageMonthly::incrementFor($message->organization_id, 'failed_count');
        }
    }

    private function handleInboundMessage(array $message, WhatsappBotService $botService): void
    {
        $from        = $message['from'] ?? null;
        $waMessageId = $message['id'] ?? null;
        $body        = $message['text']['body'] ?? null;

        if (!$from || !$waMessageId) {
            return;
        }

        $normalized = '+' . preg_replace('/[^0-9]/', '', $from);

        $enabledOrgIds = TenantWhatsappSettings::where('is_enabled', true)->pluck('organization_id');

        $candidateLeads = Lead::withoutGlobalScopes()
            ->whereIn('organization_id', $enabledOrgIds)
            ->where(function ($q) use ($from, $normalized) {
                $q->where('whatsapp_number', $from)
                  ->orWhere('whatsapp_number', $normalized);
            })
            ->get();

        $matchedOrgIds = $candidateLeads->pluck('organization_id')->unique()->values();

        if ($matchedOrgIds->count() !== 1) {
            WhatsappUnassignedInbound::updateOrCreate(
                ['wa_message_id' => $waMessageId],
                [
                    'from_number'              => $from,
                    'body'                     => $body,
                    'message_type'             => $message['type'] ?? 'text',
                    'raw_payload'              => $message,
                    'matched_organization_ids' => $matchedOrgIds->isNotEmpty() ? $matchedOrgIds->all() : null,
                    'status'                   => 'pending',
                ]
            );

            Log::info('WhatsApp inbound message unassigned', [
                'from'        => $from,
                'match_count' => $matchedOrgIds->count(),
            ]);

            return;
        }

        $lead = $candidateLeads->first();
        $organizationId = $lead->organization_id;

        $logRow = WhatsappMessage::withoutGlobalScopes()->create([
            'organization_id' => $organizationId,
            'lead_id'         => $lead->id,
            'direction'       => 'inbound',
            'wa_message_id'   => $waMessageId,
            'from_number'     => $from,
            'message_type'    => $message['type'] ?? 'text',
            'body'            => $body,
            'status'          => 'delivered',
        ]);

        WhatsappConversation::withoutGlobalScopes()->create([
            'lead_id'             => $lead->id,
            'organization_id'     => $organizationId,
            'whatsapp_message_id' => $logRow->id,
            'lead_phone'          => $from,
            'direction'           => 'inbound',
            'message_body'        => $body ?? '',
            'wa_message_id'       => $waMessageId,
            'is_bot_reply'        => false,
            'received_at'         => now(),
        ]);

        if (!$body) {
            return;
        }

        $botResult = $botService->generateReply($lead, $body, $organizationId);
        if (!$botResult['success']) {
            Log::error('WhatsApp bot failed to generate reply', $botResult);
            return;
        }

        if ($botResult['is_qualified']) {
            $lead->update(['status' => 'qualified']);
        }

        $service    = new WhatsappService();
        $sendResult = $service->send($lead, $botResult['reply'], $organizationId);

        if ($sendResult['success']) {
            WhatsappConversation::withoutGlobalScopes()->create([
                'lead_id'             => $lead->id,
                'organization_id'     => $organizationId,
                'whatsapp_message_id' => $sendResult['whatsapp_message_id'] ?? null,
                'lead_phone'          => $from,
                'direction'           => 'outbound',
                'message_body'        => $botResult['reply'],
                'wa_message_id'       => $sendResult['wa_message_id'] ?? null,
                'is_bot_reply'        => true,
                'is_qualified'        => $botResult['is_qualified'],
            ]);
        }
    }
}
