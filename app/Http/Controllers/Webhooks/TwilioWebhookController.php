<?php

namespace App\Http\Controllers\Webhooks;

use App\Http\Controllers\Controller;
use App\Models\TwilioSetting;
use App\Models\TwilioCall;
use App\Models\TwilioMessage;
use App\Models\Lead;
use App\Models\LeadPhone;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TwilioWebhookController extends Controller
{
    /** Dial recording mode: separate agent/customer audio channels for clean playback. */
    private const RECORDING_MODE = 'record-from-answer-dual';

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
     * Resolve the local agent User behind a browser softphone call from its
     * Twilio Client identity (e.g. "client:john_example_com"), since identities
     * are the agent's email with non-alphanumerics sanitized to underscores.
     */
    private function resolveUserByClientIdentity(int $organizationId, ?string $from): ?User
    {
        if (!$from || !str_starts_with($from, 'client:')) {
            return null;
        }

        $identity = substr($from, 7);

        return User::where('organization_id', $organizationId)
            ->get(['id', 'email'])
            ->first(fn ($user) => preg_replace('/[^A-Za-z0-9_]/', '_', $user->email) === $identity);
    }

    /**
     * Recording + status-callback attributes shared by every <Dial> we emit,
     * so every answered call is recorded and its final status/duration is captured.
     */
    private function dialAttributes(int $organizationId, bool $voicemailFallback = false): string
    {
        $recordingCallback = route('webhooks.twilio.recording-status');
        $dialStatusParams = ['org_id' => $organizationId];
        if ($voicemailFallback) {
            $dialStatusParams['fallback'] = 'voicemail';
        }
        $dialStatusCallback = route('webhooks.twilio.dial-status', $dialStatusParams);

        return 'record="' . self::RECORDING_MODE . '" '
            . 'recordingStatusCallback="' . htmlspecialchars($recordingCallback) . '" '
            . 'recordingStatusCallbackEvent="completed" '
            . 'action="' . htmlspecialchars($dialStatusCallback) . '"';
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

            $callingUser = $this->resolveUserByClientIdentity($setting->organization_id, $from);

            // Create local outbound call log
            TwilioCall::create([
                'organization_id' => $setting->organization_id,
                'user_id'         => $callingUser?->id,
                'sid'             => $callSid,
                'from_number'     => $setting->phone_number,
                'to_number'       => $to,
                'direction'       => 'outbound',
                'status'          => 'in-progress',
            ]);

            // Return TwiML to Dial the customer's phone number
            $twiml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
            $twiml .= '<Response>';
            $twiml .= '    <Dial callerId="' . htmlspecialchars($setting->phone_number) . '" ' . $this->dialAttributes($setting->organization_id) . '>';
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
        $resolvedUser = null;

        // Try to find if this phone belongs to a lead
        $leadPhone = LeadPhone::whereRaw("REPLACE(REPLACE(REPLACE(REPLACE(phone, '+', ''), ' ', ''), '-', ''), '(', '') LIKE ?", ["%{$cleanFrom}%"])
            ->first();

        if ($leadPhone && $leadPhone->lead && $leadPhone->lead->assigned_to) {
            $lead = $leadPhone->lead;
            $assignedUser = $lead->assignedUser;
            if ($assignedUser) {
                $targetClient = $assignedUser->email;
                $resolvedUser = $assignedUser;
            }
        } else {
            // Default to owner's email
            $owner = $setting->organization->owner;
            if ($owner) {
                $targetClient = $owner->email;
                $resolvedUser = $owner;
            }
        }

        // Create a local Call record as inbound ringing
        TwilioCall::create([
            'organization_id' => $setting->organization_id,
            'user_id'         => $resolvedUser?->id,
            'sid'             => $callSid,
            'from_number'     => $from,
            'to_number'       => $to,
            'direction'       => 'inbound',
            'status'          => 'ringing',
        ]);

        // Twilio Client identities may only contain alpha-numeric and underscore characters.
        $targetClient = preg_replace('/[^A-Za-z0-9_]/', '_', $targetClient);

        // Build TwiML Response. The voicemail fallback (Say/Record) now lives in the
        // dial-status action callback, since attaching `action` to <Dial> hands control
        // of "what happens next" entirely to that callback's response.
        $twiml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $twiml .= '<Response>';
        $twiml .= '    <Dial callerId="' . $to . '" timeout="20" ' . $this->dialAttributes($setting->organization_id, voicemailFallback: true) . '>';
        $twiml .= '        <Client>' . htmlspecialchars($targetClient) . '</Client>';
        $twiml .= '    </Dial>';
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
        $twiml .= '    <Dial callerId="' . htmlspecialchars($setting->phone_number) . '" ' . $this->dialAttributes($setting->organization_id) . '>';
        $twiml .= '        <Number>' . htmlspecialchars($to) . '</Number>';
        $twiml .= '    </Dial>';
        $twiml .= '</Response>';

        return response($twiml, 200)->header('Content-Type', 'text/xml');
    }

    /**
     * <Dial action> callback: fires once the dialed leg finishes (answered or not).
     * Persists the call's final status/duration, and — for inbound calls where the
     * agent didn't pick up — falls back to the voicemail Say/Record flow that used
     * to sit statically after the <Dial> in handleVoice().
     */
    public function handleDialStatus(Request $request)
    {
        $callSid = $request->input('CallSid');
        $dialStatus = $request->input('DialCallStatus'); // completed | busy | no-answer | failed | canceled
        $dialDuration = $request->input('DialCallDuration');

        Log::info("Twilio Dial Status Callback: call={$callSid} status={$dialStatus} duration={$dialDuration}");

        $call = TwilioCall::where('sid', $callSid)->first();
        if ($call) {
            $call->update([
                'status'   => $dialStatus ?: $call->status,
                'duration' => $dialDuration !== null ? (int) $dialDuration : $call->duration,
            ]);
        }

        if ($request->query('fallback') === 'voicemail' && $dialStatus !== 'completed') {
            $orgId = $request->query('org_id');
            $voicemailUrl = route('webhooks.twilio.voicemail', ['org_id' => $orgId]);

            $twiml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
            $twiml .= '<Response>';
            $twiml .= '    <Say>No agents are currently available. Please leave a message after the beep.</Say>';
            $twiml .= '    <Record action="' . htmlspecialchars($voicemailUrl) . '" maxLength="60" playBeep="true" />';
            $twiml .= '    <Say>Thank you for calling. Goodbye.</Say>';
            $twiml .= '</Response>';

            return response($twiml, 200)->header('Content-Type', 'text/xml');
        }

        $twiml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n" . '<Response><Hangup/></Response>';
        return response($twiml, 200)->header('Content-Type', 'text/xml');
    }

    /**
     * Recording status callback: fires once the dual-channel recording for an
     * answered call has finished processing and is ready to fetch.
     */
    public function handleRecordingStatus(Request $request)
    {
        $callSid = $request->input('CallSid');
        $recordingSid = $request->input('RecordingSid');
        $recordingUrl = $request->input('RecordingUrl');
        $recordingStatus = $request->input('RecordingStatus');
        $recordingDuration = $request->input('RecordingDuration');

        Log::info("Twilio Recording Status Callback: call={$callSid} recording={$recordingSid} status={$recordingStatus}");

        if ($recordingStatus === 'completed' && $callSid) {
            $call = TwilioCall::where('sid', $callSid)->first();
            if ($call) {
                $call->update([
                    'recording_url' => $recordingUrl,
                    'recording_sid' => $recordingSid,
                    'duration'      => $call->duration ?: $recordingDuration,
                ]);
            }
        }

        return response('', 200);
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
