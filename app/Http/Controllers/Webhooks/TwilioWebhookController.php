<?php

namespace App\Http\Controllers\Webhooks;

use App\Http\Controllers\Controller;
use App\Models\TwilioSetting;
use App\Models\TwilioCall;
use App\Models\TwilioMessage;
use App\Models\Lead;
use App\Models\LeadPhone;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TwilioWebhookController extends Controller
{
    /**
     * Helper to lookup TwilioSetting by matching the twilio phone number.
     */
    private function getSettingForNumber(string $number): ?TwilioSetting
    {
        $cleanNumber = preg_replace('/[^0-9]/', '', $number);
        // Find setting where phone number matches (ignoring formatting like '+', ' ', '-')
        return TwilioSetting::all()->first(function ($setting) use ($cleanNumber) {
            $cleanSettingPhone = preg_replace('/[^0-9]/', '', $setting->phone_number);
            return $cleanSettingPhone === $cleanNumber;
        });
    }

    /**
     * Handle inbound voice calls. Returns TwiML.
     */
    public function handleVoice(Request $request)
    {
        $to = $request->input('To');
        $from = $request->input('From');
        $callSid = $request->input('CallSid');
        $applicationSid = $request->input('ApplicationSid');

        Log::info("Twilio Voice Webhook received call {$callSid} to {$to} from {$from} AppSid: {$applicationSid}");

        // 1. Check if this is an outbound call from the browser client
        if (!empty($applicationSid)) {
            $setting = TwilioSetting::where('twiml_app_sid', $applicationSid)->first();
            if (!$setting || !$setting->is_active) {
                Log::warning("Voice Webhook Outbound: No active setting found for ApplicationSid {$applicationSid}");
                return response("<Response><Reject /></Response>", 200)->header('Content-Type', 'text/xml');
            }

            // Create local outbound call log
            TwilioCall::create([
                'organization_id' => $setting->organization_id,
                'sid'             => $callSid,
                'from_number'     => $setting->phone_number,
                'to_number'       => $to,
                'direction'       => 'outbound',
                'status'          => 'in-progress',
            ]);

            // Return TwiML to Dial the customer's phone number
            $twiml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
            $twiml .= '<Response>';
            $twiml .= '    <Dial callerId="' . htmlspecialchars($setting->phone_number) . '">';
            $twiml .= '        <Number>' . htmlspecialchars($to) . '</Number>';
            $twiml .= '    </Dial>';
            $twiml .= '</Response>';

            return response($twiml, 200)->header('Content-Type', 'text/xml');
        }

        // 2. Otherwise, treat as inbound call to company number
        $setting = $this->getSettingForNumber($to);
        if (!$setting || !$setting->is_active) {
            Log::warning("Voice Webhook Inbound: No active setting or setting is not active for To number {$to}");
            return response("<Response><Reject /></Response>", 200)
                ->header('Content-Type', 'text/xml');
        }

        // Determine who to dial (client name)
        $cleanFrom = preg_replace('/[^0-9]/', '', $from);
        $targetClient = 'agent';

        // Try to find if this phone belongs to a lead
        $leadPhone = LeadPhone::whereRaw("REPLACE(REPLACE(REPLACE(REPLACE(phone, '+', ''), ' ', ''), '-', ''), '(', '') LIKE ?", ["%{$cleanFrom}%"])
            ->first();

        if ($leadPhone && $leadPhone->lead && $leadPhone->lead->assigned_to) {
            $lead = $leadPhone->lead;
            $assignedUser = $lead->assignedUser;
            if ($assignedUser) {
                $targetClient = $assignedUser->email;
            }
        } else {
            // Default to owner's email
            $owner = $setting->organization->owner;
            if ($owner) {
                $targetClient = $owner->email;
            }
        }

        // Create a local Call record as inbound ringing
        TwilioCall::create([
            'organization_id' => $setting->organization_id,
            'sid'             => $callSid,
            'from_number'     => $from,
            'to_number'       => $to,
            'direction'       => 'inbound',
            'status'          => 'ringing',
        ]);

        $voicemailUrl = route('webhooks.twilio.voicemail', ['org_id' => $setting->organization_id]);

        // Build TwiML Response
        $twiml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $twiml .= '<Response>';
        $twiml .= '    <Dial callerId="' . $to . '" timeout="20">';
        $twiml .= '        <Client>' . htmlspecialchars($targetClient) . '</Client>';
        $twiml .= '    </Dial>';
        $twiml .= '    <Say>No agents are currently available. Please leave a message after the beep.</Say>';
        $twiml .= '    <Record action="' . htmlspecialchars($voicemailUrl) . '" maxLength="60" playBeep="true" />';
        $twiml .= '    <Say>Thank you for calling. Goodbye.</Say>';
        $twiml .= '</Response>';

        return response($twiml, 200)->header('Content-Type', 'text/xml');
    }

    /**
     * Handle voicemail record callback.
     */
    public function handleVoicemail(Request $request)
    {
        $callSid = $request->input('CallSid');
        $recordingUrl = $request->input('RecordingUrl');
        $recordingDuration = $request->input('RecordingDuration');
        $orgId = $request->query('org_id');

        Log::info("Twilio Voicemail Callback received for call {$callSid}, recording: {$recordingUrl}");

        $call = TwilioCall::where('sid', $callSid)->first();
        if ($call) {
            $call->update([
                'status'        => 'voicemail',
                'recording_url' => $recordingUrl,
                'duration'      => $recordingDuration,
            ]);

            $lead = $call->lead();
            if ($lead) {
                $lead->activities()->create([
                    'organization_id' => $call->organization_id,
                    'type'            => 'call',
                    'description'     => "Inbound Call went to Voicemail. Recording: " . $recordingUrl,
                    'user_id'         => $lead->assigned_to ?? $lead->organization->owner_id,
                ]);
            }
        } else if ($orgId) {
            // Fallback: create a log if call record was somehow missed
            TwilioCall::create([
                'organization_id' => $orgId,
                'sid'             => $callSid,
                'from_number'     => $request->input('From', 'Unknown'),
                'to_number'       => $request->input('To', 'Unknown'),
                'direction'       => 'inbound',
                'status'          => 'voicemail',
                'recording_url'   => $recordingUrl,
                'duration'        => $recordingDuration,
            ]);
        }

        $twiml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $twiml .= '<Response>';
        $twiml .= '    <Say>Your voicemail has been saved. Goodbye.</Say>';
        $twiml .= '    <Hangup />';
        $twiml .= '</Response>';

        return response($twiml, 200)->header('Content-Type', 'text/xml');
    }

    /**
     * TwiML Outbound Voice bridging callback (for click-to-call).
     */
    public function handleVoiceBridge(Request $request)
    {
        $orgId = $request->query('org_id');
        $to = $request->query('to');

        Log::info("Twilio Voice Bridge Webhook: bridging call to {$to} for org {$orgId}");

        $setting = TwilioSetting::where('organization_id', $orgId)->first();
        if (!$setting) {
            return response("<Response><Reject /></Response>", 200)->header('Content-Type', 'text/xml');
        }

        // Bridge the call to the Lead's phone number
        $twiml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $twiml .= '<Response>';
        $twiml .= '    <Dial callerId="' . htmlspecialchars($setting->phone_number) . '">';
        $twiml .= '        <Number>' . htmlspecialchars($to) . '</Number>';
        $twiml .= '    </Dial>';
        $twiml .= '</Response>';

        return response($twiml, 200)->header('Content-Type', 'text/xml');
    }

    /**
     * Handle incoming SMS.
     */
    public function handleSms(Request $request)
    {
        $to = $request->input('To');
        $from = $request->input('From');
        $body = $request->input('Body');
        $msgSid = $request->input('MessageSid');

        Log::info("Twilio SMS Webhook received message {$msgSid} from {$from} to {$to}");

        $setting = $this->getSettingForNumber($to);
        if (!$setting || !$setting->is_active) {
            return response("<Response></Response>", 200)->header('Content-Type', 'text/xml');
        }

        $cleanFrom = preg_replace('/[^0-9]/', '', $from);

        // Find or create the Lead
        $leadPhone = LeadPhone::whereRaw("REPLACE(REPLACE(REPLACE(REPLACE(phone, '+', ''), ' ', ''), '-', ''), '(', '') LIKE ?", ["%{$cleanFrom}%"])
            ->first();

        if ($leadPhone) {
            $lead = $leadPhone->lead;
        } else {
            // Auto-create lead
            $lead = Lead::create([
                'organization_id' => $setting->organization_id,
                'first_name'      => 'Twilio',
                'last_name'       => 'Lead',
                'status'          => 'new',
                'created_by'      => $setting->organization->owner_id,
            ]);
            $lead->phones()->create([
                'phone' => $from,
                'type'  => 'mobile',
            ]);
        }

        // Write message log
        $message = TwilioMessage::create([
            'organization_id' => $setting->organization_id,
            'sid'             => $msgSid,
            'from_number'     => $from,
            'to_number'       => $to,
            'direction'       => 'inbound',
            'body'            => $body,
            'status'          => 'received',
        ]);

        // Write activity log on lead
        $lead->activities()->create([
            'organization_id' => $setting->organization_id,
            'type'            => 'note',
            'description'     => "Inbound SMS: " . substr($body, 0, 150),
            'user_id'         => $lead->assigned_to ?? $setting->organization->owner_id,
        ]);

        // Return empty Twilio response
        $twiml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $twiml .= '<Response></Response>';

        return response($twiml, 200)->header('Content-Type', 'text/xml');
    }
}
