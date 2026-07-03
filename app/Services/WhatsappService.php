<?php

namespace App\Services;

use App\Models\Lead;
use App\Models\PlatformWhatsappCredential;
use App\Models\TenantWhatsappSettings;
use App\Models\WhatsappMessage;
use App\Models\WhatsappTemplate;
use App\Models\WhatsappUsageMonthly;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class WhatsappService
{
    private const GRAPH_API_VERSION = 'v19.0';

    public function __construct(private ?PlatformWhatsappCredential $credential = null)
    {
        $this->credential ??= PlatformWhatsappCredential::active();
    }

    /**
     * Send a WhatsApp message through the pooled Meta credential. This is the single
     * choke point for tenant-enabled, quota, credential, and template checks, so every
     * caller (campaigns, 1:1 conversations, bot auto-replies) inherits the same gating.
     */
    public function send(
        Lead $lead,
        string $message,
        ?int $organizationId = null,
        string $messageType = 'text',
        ?string $templateName = null,
    ): array {
        $organizationId ??= $lead->organization_id;

        $settings = TenantWhatsappSettings::forOrganization($organizationId);
        if (!$settings || !$settings->isUsableForSend()) {
            return $this->fail($organizationId, $lead, $messageType, $templateName,
                'WhatsApp is not enabled for this workspace.', 'TENANT_DISABLED');
        }

        if ($settings->monthly_message_quota !== null) {
            $usage = WhatsappUsageMonthly::currentMonthFor($organizationId);
            $currentCount = $usage?->sent_count ?? 0;
            if (!$settings->hasQuotaRemaining($currentCount)) {
                return $this->fail($organizationId, $lead, $messageType, $templateName,
                    'Monthly WhatsApp message quota reached.', 'QUOTA_EXCEEDED');
            }
        }

        if (!$this->credential || $this->credential->status !== 'active') {
            return $this->fail($organizationId, $lead, $messageType, $templateName,
                'WhatsApp is not configured. Please contact support.', 'NO_POOLED_CREDENTIAL');
        }

        $toNumber = $this->formatNumber($lead->whatsapp_number ?? $lead->primary_phone);
        if (!$toNumber) {
            return $this->fail($organizationId, $lead, $messageType, $templateName,
                'Lead has no phone number configured', 'NO_PHONE');
        }

        if ($messageType === 'template') {
            if (!$templateName || !WhatsappTemplate::approved()->where('name', $templateName)->exists()) {
                return $this->fail($organizationId, $lead, $messageType, $templateName,
                    'Unknown or unapproved template.', 'INVALID_TEMPLATE', $toNumber);
            }
        }

        $payload = $messageType === 'template'
            ? [
                'messaging_product' => 'whatsapp',
                'to'                => $toNumber,
                'type'              => 'template',
                'template'          => [
                    'name'     => $templateName,
                    'language' => ['code' => 'en_US'],
                ],
            ]
            : [
                'messaging_product' => 'whatsapp',
                'to'                => $toNumber,
                'type'              => 'text',
                'text'              => ['body' => $message],
            ];

        try {
            $response = Http::withToken($this->credential->access_token)
                ->timeout(15)
                ->post($this->apiUrl('messages'), $payload);
        } catch (ConnectionException|Throwable $e) {
            Log::error('WhatsApp Meta send connection failed', [
                'organization_id' => $organizationId,
                'lead_id'         => $lead->id,
                'error'           => $e->getMessage(),
            ]);

            return $this->fail($organizationId, $lead, $messageType, $templateName,
                'Could not reach WhatsApp at this time.', 'CONNECTION_ERROR', $toNumber);
        }

        $body = $response->json();

        if ($response->successful() && !empty($body['messages'][0]['id'])) {
            $waMessageId = $body['messages'][0]['id'];

            $logRow = WhatsappMessage::create([
                'organization_id' => $organizationId,
                'lead_id'         => $lead->id,
                'direction'       => 'outbound',
                'wa_message_id'   => $waMessageId,
                'to_number'       => $toNumber,
                'message_type'    => $messageType,
                'template_name'   => $templateName,
                'body'            => $message,
                'status'          => 'sent',
                'sent_by_user_id' => auth()->id(),
            ]);

            WhatsappUsageMonthly::incrementFor($organizationId, 'sent_count');

            Log::info('WhatsApp sent', [
                'lead_id'       => $lead->id,
                'wa_message_id' => $waMessageId,
            ]);

            return [
                'success'             => true,
                'wa_message_id'       => $waMessageId,
                'whatsapp_message_id' => $logRow->id,
                'status'              => 'sent',
            ];
        }

        $errorCode = (string) ($body['error']['code'] ?? $response->status());
        $errorMessage = $body['error']['message'] ?? 'Unknown error from WhatsApp.';

        Log::error('WhatsApp Meta send failed', [
            'organization_id' => $organizationId,
            'lead_id'         => $lead->id,
            'error_code'      => $errorCode,
            'error'           => $errorMessage,
        ]);

        return $this->fail($organizationId, $lead, $messageType, $templateName,
            $errorMessage, $errorCode, $toNumber);
    }

    /**
     * Lightweight Meta Graph API call to confirm the given (or currently saved) credential is valid.
     */
    public function verify(): array
    {
        if (!$this->credential) {
            return ['success' => false, 'message' => 'No pooled WhatsApp credential configured.'];
        }

        try {
            $response = Http::withToken($this->credential->access_token)
                ->timeout(15)
                ->get($this->apiUrl(null, ['fields' => 'verified_name,display_phone_number']));
        } catch (ConnectionException|Throwable $e) {
            return ['success' => false, 'message' => 'Could not reach Meta: ' . $e->getMessage()];
        }

        if ($response->successful()) {
            return [
                'success' => true,
                'message' => 'Connected to ' . ($response->json('display_phone_number') ?? 'WhatsApp number'),
                'data'    => $response->json(),
            ];
        }

        return [
            'success' => false,
            'message' => $response->json('error.message') ?? 'Meta rejected the credentials.',
        ];
    }

    public function formatNumber(?string $number): ?string
    {
        if (!$number) {
            return null;
        }

        $number = preg_replace('/[^0-9+]/', '', $number);

        if (!str_starts_with($number, '+')) {
            $number = '+' . $number;
        }

        return $number;
    }

    private function apiUrl(?string $path, array $query = []): string
    {
        $url = 'https://graph.facebook.com/' . self::GRAPH_API_VERSION . '/' . $this->credential->phone_number_id;

        if ($path) {
            $url .= '/' . $path;
        }

        if (!empty($query)) {
            $url .= '?' . http_build_query($query);
        }

        return $url;
    }

    private function fail(
        int $organizationId,
        Lead $lead,
        string $messageType,
        ?string $templateName,
        string $error,
        string $errorCode,
        ?string $toNumber = null,
    ): array {
        // Only log to whatsapp_messages once we know which organization this belongs to —
        // still true here since $organizationId is always resolved before this is called.
        WhatsappMessage::create([
            'organization_id' => $organizationId,
            'lead_id'         => $lead->id,
            'direction'       => 'outbound',
            'to_number'       => $toNumber,
            'message_type'    => $messageType,
            'template_name'   => $templateName,
            'status'          => 'failed',
            'error_code'      => $errorCode,
            'error_message'   => $error,
            'sent_by_user_id' => auth()->id(),
        ]);

        WhatsappUsageMonthly::incrementFor($organizationId, 'failed_count');

        return [
            'success'    => false,
            'error'      => $error,
            'error_code' => $errorCode,
        ];
    }
}
