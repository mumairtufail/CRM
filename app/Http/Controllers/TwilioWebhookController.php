<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\WhatsappConversation;
use App\Models\WhatsappCredential;
use App\Models\WhatsappSend;
use App\Services\WhatsappBotService;
use App\Services\WhatsappService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Twilio\Security\RequestValidator;

class TwilioWebhookController extends Controller
{
    public function __construct(private WhatsappBotService $botService) {}

    /**
     * POST /webhook/twilio/whatsapp — incoming WhatsApp message from Twilio
     */
    public function handleIncoming(Request $request)
    {
        if (!$this->validateTwilioSignature($request)) {
            Log::warning('Invalid Twilio signature', ['ip' => $request->ip()]);
            return response('Forbidden', 403);
        }

        $from       = $request->input('From');   // whatsapp:+923001234567
        $body       = $request->input('Body');
        $messageSid = $request->input('MessageSid');
        $to         = $request->input('To');     // your Twilio WhatsApp number

        Log::info('WhatsApp incoming', compact('from', 'body', 'messageSid'));

        $credential = WhatsappCredential::withoutGlobalScopes()
            ->where('from_number', ltrim($to, 'whatsapp:'))
            ->orWhere('from_number', $to)
            ->first();

        if (!$credential) {
            Log::error('No WhatsApp credential for number', ['to' => $to]);
            return response('OK', 200);
        }

        $phoneClean = str_replace('whatsapp:', '', $from);
        $lead = Lead::withoutGlobalScopes()
            ->where('organization_id', $credential->organization_id)
            ->where(function ($q) use ($phoneClean, $from) {
                $q->where('whatsapp_number', $phoneClean)
                  ->orWhere('whatsapp_number', $from);
            })->first();

        if (!$lead) {
            Log::warning('No lead found for incoming WhatsApp', ['from' => $from]);
            return response('OK', 200);
        }

        // Store inbound message
        WhatsappConversation::withoutGlobalScopes()->create([
            'lead_id'            => $lead->id,
            'organization_id'    => $credential->organization_id,
            'lead_phone'         => $from,
            'direction'          => 'inbound',
            'message_body'       => $body,
            'twilio_message_sid' => $messageSid,
            'is_bot_reply'       => false,
            'received_at'        => now(),
        ]);

        // Generate bot reply
        $botResult = $this->botService->generateReply($lead, $body, $credential->organization_id);

        if (!$botResult['success']) {
            Log::error('Bot failed to generate reply', $botResult);
            return response('OK', 200);
        }

        if ($botResult['is_qualified']) {
            $lead->update(['status' => 'qualified']);
        }

        $service    = new WhatsappService($credential);
        $sendResult = $service->send($lead, $botResult['reply']);

        if ($sendResult['success']) {
            WhatsappConversation::withoutGlobalScopes()->create([
                'lead_id'            => $lead->id,
                'organization_id'    => $credential->organization_id,
                'lead_phone'         => $from,
                'direction'          => 'outbound',
                'message_body'       => $botResult['reply'],
                'twilio_message_sid' => $sendResult['message_sid'],
                'is_bot_reply'       => true,
                'is_qualified'       => $botResult['is_qualified'],
            ]);
        }

        return response('OK', 200);
    }

    /**
     * POST /webhook/twilio/status — delivery status callback
     */
    public function handleStatus(Request $request)
    {
        $messageSid = $request->input('MessageSid');
        $status     = $request->input('MessageStatus');

        WhatsappSend::withoutGlobalScopes()
            ->where('twilio_message_sid', $messageSid)
            ->update([
                'status'       => $status,
                'delivered_at' => in_array($status, ['delivered', 'read']) ? now() : null,
                'read_at'      => $status === 'read' ? now() : null,
                'failed_at'    => in_array($status, ['failed', 'undelivered']) ? now() : null,
            ]);

        return response('OK', 200);
    }

    private function validateTwilioSignature(Request $request): bool
    {
        if (app()->environment('local', 'testing')) {
            return true;
        }

        $credential = WhatsappCredential::withoutGlobalScopes()->first();
        if (!$credential) return false;

        $validator = new RequestValidator($credential->auth_token);
        $signature = $request->header('X-Twilio-Signature', '');

        return $validator->validate($signature, $request->fullUrl(), $request->post());
    }
}
