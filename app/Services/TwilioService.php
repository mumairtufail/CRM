<?php

namespace App\Services;

use App\Models\TwilioSetting;
use App\Models\TwilioCall;
use App\Models\TwilioMessage;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Twilio\Rest\Client;
use Twilio\Jwt\AccessToken;
use Twilio\Jwt\Grants\VoiceGrant;

class TwilioService
{
    private ?Client $client = null;

    public function __construct(public TwilioSetting $setting)
    {
    }

    /**
     * Get or initialize Twilio Client.
     */
    public function getClient(): Client
    {
        if (!$this->client) {
            $this->client = new Client($this->setting->account_sid, $this->setting->auth_token);
        }
        return $this->client;
    }

    /**
     * Test the Twilio connection by fetching the account details.
     */
    public function testConnection(): array
    {
        try {
            $this->getClient()->api->v2010->accounts($this->setting->account_sid)->fetch();
            return [true, 'Connection successful.'];
        } catch (\Exception $e) {
            return [false, $e->getMessage()];
        }
    }

    /**
     * Send an SMS using the Twilio API and log it.
     */
    public function sendSms(string $to, string $body): TwilioMessage
    {
        $twilio = $this->getClient();
        $message = $twilio->messages->create($to, [
            'from' => $this->setting->phone_number,
            'body' => $body,
        ]);

        $localMsg = TwilioMessage::create([
            'organization_id' => $this->setting->organization_id,
            'sid'             => $message->sid,
            'from_number'     => $this->setting->phone_number,
            'to_number'       => $to,
            'direction'       => 'outbound',
            'body'            => $body,
            'status'          => $message->status,
        ]);

        // Log to Lead activities
        $lead = $localMsg->lead();
        if ($lead) {
            $lead->activities()->create([
                'organization_id' => $this->setting->organization_id,
                'type'            => 'note',
                'description'     => "Outbound SMS sent: " . substr($body, 0, 150),
                'user_id'         => \Illuminate\Support\Facades\Auth::id() ?? $this->setting->organization->owner_id,
            ]);
        }

        return $localMsg;
    }

    /**
     * Place an outbound call (Click-to-Call bridging).
     * Dials the agent's number first, and when they answer, bridges to the destination number.
     */
    public function placeCall(string $to, string $agentNumber): TwilioCall
    {
        $twilio = $this->getClient();

        // Create a TwiML URL that will bridge the call to the Lead when the agent answers
        $bridgeUrl = route('webhooks.twilio.voice-bridge', [
            'org_id' => $this->setting->organization_id,
            'to'     => $to,
        ]);

        $call = $twilio->calls->create(
            $agentNumber,
            $this->setting->phone_number, // Caller ID shown to the Agent
            [
                'url' => $bridgeUrl,
            ]
        );

        $localCall = TwilioCall::create([
            'organization_id' => $this->setting->organization_id,
            'sid'             => $call->sid,
            'from_number'     => $this->setting->phone_number,
            'to_number'       => $to,
            'direction'       => 'outbound',
            'status'          => 'queued',
        ]);

        // Log to Lead activities
        $lead = $localCall->lead();
        if ($lead) {
            $lead->activities()->create([
                'organization_id' => $this->setting->organization_id,
                'type'            => 'call',
                'description'     => "Outbound Click-to-Call placed to " . $to,
                'user_id'         => \Illuminate\Support\Facades\Auth::id() ?? $this->setting->organization->owner_id,
            ]);
        }

        return $localCall;
    }

    /**
     * Generate a Twilio JWT Access Token for browser softphone calling.
     */
    public function generateVoiceToken(string $clientName): string
    {
        $accountSid = $this->setting->account_sid;
        $apiKey = $this->setting->api_key;
        $apiSecret = $this->setting->api_secret;
        $twimlAppSid = $this->setting->twiml_app_sid;

        if (empty($apiKey) || empty($apiSecret) || empty($twimlAppSid)) {
            throw new \Exception("Twilio API Key, API Secret, and TwiML App SID must be configured in settings for browser softphone calling.");
        }

        $token = new AccessToken(
            $accountSid,
            $apiKey,
            $apiSecret,
            3600,
            $clientName
        );

        $voiceGrant = new VoiceGrant();
        $voiceGrant->setOutgoingApplicationSid($twimlAppSid);
        $voiceGrant->setIncomingAllow(true);

        $token->addGrant($voiceGrant);

        return $token->toJWT();
    }

    /**
     * Sync recent call logs and message logs from Twilio REST API.
     */
    public function syncLogs(int $limit = 50): array
    {
        $twilio = $this->getClient();
        $syncedCalls = 0;
        $syncedMessages = 0;

        try {
            // 1. Sync messages
            $messages = $twilio->messages->read(['limit' => $limit]);
            foreach ($messages as $msg) {
                // Ensure the message belongs to our twilio number
                if ($msg->to !== $this->setting->phone_number && $msg->from !== $this->setting->phone_number) {
                    continue;
                }

                $direction = ($msg->from === $this->setting->phone_number) ? 'outbound' : 'inbound';

                TwilioMessage::updateOrCreate(
                    ['sid' => $msg->sid],
                    [
                        'organization_id' => $this->setting->organization_id,
                        'from_number'     => $msg->from,
                        'to_number'       => $msg->to,
                        'direction'       => $direction,
                        'body'            => $msg->body,
                        'status'          => $msg->status,
                        'created_at'      => $msg->dateCreated,
                        'updated_at'      => $msg->dateUpdated,
                    ]
                );
                $syncedMessages++;
            }

            // 2. Sync calls
            $calls = $twilio->calls->read(['limit' => $limit]);
            foreach ($calls as $call) {
                if ($call->to !== $this->setting->phone_number && $call->from !== $this->setting->phone_number) {
                    continue;
                }

                $direction = ($call->from === $this->setting->phone_number) ? 'outbound' : 'inbound';
                
                // Determine voicemail status (if it was recorded)
                $status = $call->status;
                $recordingUrl = null;

                // Let's fetch recordings associated with this call
                $recordings = $twilio->recordings->read(['callSid' => $call->sid, 'limit' => 1]);
                if (!empty($recordings)) {
                    $recordingUrl = $recordings[0]->uri;
                    if ($direction === 'inbound' && in_array($status, ['completed', 'no-answer'])) {
                        $status = 'voicemail';
                    }
                }

                TwilioCall::updateOrCreate(
                    ['sid' => $call->sid],
                    [
                        'organization_id' => $this->setting->organization_id,
                        'from_number'     => $call->from,
                        'to_number'       => $call->to,
                        'direction'       => $direction,
                        'status'          => $status,
                        'duration'        => $call->duration,
                        'recording_url'   => $recordingUrl ? "https://api.twilio.com" . $recordingUrl : null,
                        'created_at'      => $call->dateCreated,
                        'updated_at'      => $call->dateUpdated,
                    ]
                );
                $syncedCalls++;
            }

            return ['success' => true, 'calls' => $syncedCalls, 'messages' => $syncedMessages];
        } catch (\Exception $e) {
            Log::error("Twilio sync error for org {$this->setting->organization_id}: " . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Auto-configure the webhook URLs on Twilio for the configured phone number.
     */
    public function autoConfigureWebhooks(): bool
    {
        try {
            $twilio = $this->getClient();
            $phoneNumber = $this->setting->phone_number;

            // List incoming numbers matching the phone number
            $numbers = $twilio->incomingPhoneNumbers->read([
                'phoneNumber' => $phoneNumber,
                'limit' => 1
            ]);

            if (!empty($numbers)) {
                $numberSid = $numbers[0]->sid;

                // Update Voice and SMS Webhooks
                $twilio->incomingPhoneNumbers($numberSid)->update([
                    'voiceUrl' => route('webhooks.twilio.voice'),
                    'smsUrl'   => route('webhooks.twilio.sms'),
                ]);

                Log::info("Twilio webhooks auto-configured for phone number: " . $phoneNumber);
                return true;
            }
        } catch (\Exception $e) {
            Log::warning("Twilio auto-webhook configuration failed: " . $e->getMessage());
        }

        return false;
    }

    /**
     * Fetch all active incoming phone numbers from Twilio account.
     */
    public function fetchPhoneNumbers(): array
    {
        try {
            $twilio = $this->getClient();
            $numbers = $twilio->incomingPhoneNumbers->read(['limit' => 50]);
            $list = [];
            foreach ($numbers as $num) {
                $list[] = [
                    'friendly_name' => $num->friendlyName,
                    'phone_number'  => $num->phoneNumber,
                ];
            }
            return $list;
        } catch (\Exception $e) {
            Log::error("Failed to fetch Twilio numbers: " . $e->getMessage());
            return [];
        }
    }
}
