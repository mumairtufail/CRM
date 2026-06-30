<?php

namespace App\Services;

use App\Models\Lead;
use App\Models\WhatsappCredential;
use Illuminate\Support\Facades\Log;
use Twilio\Exceptions\TwilioException;
use Twilio\Rest\Client;

class WhatsappService
{
    private Client $client;

    public function __construct(private WhatsappCredential $credential)
    {
        $this->client = new Client(
            $credential->account_sid,
            $credential->auth_token
        );
    }

    public function send(Lead $lead, string $message): array
    {
        $toNumber = $this->formatNumber(
            $lead->whatsapp_number ?? $lead->primary_phone
        );

        if (!$toNumber) {
            return [
                'success'    => false,
                'error'      => 'Lead has no phone number configured',
                'error_code' => 'NO_PHONE',
            ];
        }

        try {
            $msg = $this->client->messages->create($toNumber, [
                'from' => $this->credential->getFormattedFromNumber(),
                'body' => $message,
            ]);

            Log::info('WhatsApp sent', [
                'lead_id' => $lead->id,
                'sid'     => $msg->sid,
                'status'  => $msg->status,
            ]);

            return [
                'success'     => true,
                'message_sid' => $msg->sid,
                'status'      => $msg->status,
            ];
        } catch (TwilioException $e) {
            Log::error('WhatsApp send failed', [
                'lead_id' => $lead->id,
                'error'   => $e->getMessage(),
                'code'    => $e->getCode(),
            ]);

            return [
                'success'    => false,
                'error'      => $e->getMessage(),
                'error_code' => (string) $e->getCode(),
            ];
        }
    }

    public function verify(): bool
    {
        try {
            $account = $this->client->api->v2010
                ->accounts($this->credential->account_sid)
                ->fetch();
            return $account->status === 'active';
        } catch (TwilioException) {
            return false;
        }
    }

    public function formatNumber(string $number): ?string
    {
        if (!$number) return null;

        $number = preg_replace('/[^0-9+]/', '', $number);

        if (!str_starts_with($number, '+')) {
            $number = '+' . $number;
        }

        if (!str_starts_with($number, 'whatsapp:')) {
            $number = 'whatsapp:' . $number;
        }

        return $number;
    }
}
