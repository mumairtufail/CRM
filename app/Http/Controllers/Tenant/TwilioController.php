<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\TwilioSetting;
use App\Models\TwilioCall;
use App\Models\TwilioMessage;
use App\Services\TwilioService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TwilioController extends Controller
{
    /**
     * Display call history, SMS logs, and voicemail recordings dashboard.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $orgId = $user->organization_id;

        if (!$orgId) {
            abort(403, 'Workspace not resolved.');
        }

        $calls = TwilioCall::where('organization_id', $orgId)
            ->orderBy('created_at', 'desc')
            ->paginate(15, ['*'], 'calls_page');

        $messages = TwilioMessage::where('organization_id', $orgId)
            ->orderBy('created_at', 'desc')
            ->paginate(15, ['*'], 'messages_page');

        $setting = TwilioSetting::where('organization_id', $orgId)->first();

        // Get list of recent leads with phones for quick contact dropdown
        $leads = \App\Models\Lead::where('organization_id', $orgId)
            ->with('phones')
            ->orderBy('first_name')
            ->limit(100)
            ->get()
            ->map(function ($lead) {
                return [
                    'id'    => $lead->id,
                    'name'  => $lead->full_name,
                    'phone' => $lead->phones->first()?->phone,
                ];
            })->filter(fn($l) => !empty($l['phone']))->values();

        return Inertia::render('Twilio/Index', [
            'calls'          => $calls,
            'messages'       => $messages,
            'twilioSetting'  => $setting ? [
                'account_sid'   => $setting->account_sid,
                'phone_number'  => $setting->phone_number,
                'twiml_app_sid' => $setting->twiml_app_sid,
                'api_key'       => $setting->api_key,
                'is_active'     => $setting->is_active,
                'is_validated'  => $setting->isValidated(),
                'validated_at'  => $setting->validated_at?->toISOString(),
            ] : null,
            'quickLeads'     => $leads,
        ]);
    }

    /**
     * Get JSON list of logs for the softphone dialer widget.
     */
    public function logs(Request $request)
    {
        $orgId = $request->user()->organization_id;

        $calls = TwilioCall::where('organization_id', $orgId)
            ->orderBy('created_at', 'desc')
            ->limit(30)
            ->get();

        $messages = TwilioMessage::where('organization_id', $orgId)
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        return response()->json([
            'calls'    => $calls,
            'messages' => $messages,
        ]);
    }

    /**
     * Store the Twilio settings for the tenant organization.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'account_sid'   => 'required|string|max:100',
            'auth_token'    => 'required|string|max:200',
            'phone_number'  => 'required|string|max:30',
            'twiml_app_sid' => 'nullable|string|max:100',
            'api_key'       => 'nullable|string|max:100',
            'api_secret'    => 'nullable|string|max:200',
        ]);

        $orgId = $request->user()->organization_id;

        // Verify the connection works before saving
        $tempSetting = new TwilioSetting([
            'account_sid' => $validated['account_sid'],
            'auth_token'  => $validated['auth_token'],
        ]);
        $service = new TwilioService($tempSetting);
        [$ok, $message] = $service->testConnection();

        if (!$ok) {
            return back()->withErrors(['account_sid' => 'Twilio connection test failed: ' . $message]);
        }

        $setting = TwilioSetting::updateOrCreate(
            ['organization_id' => $orgId],
            [
                ...$validated,
                'is_active'    => true,
                'validated_at' => now(),
            ]
        );

        $service = new TwilioService($setting);
        $service->autoConfigureWebhooks();

        return back()->with('success', 'Twilio settings saved.');
    }

    /**
     * Validate credentials by running connection test, then save if success.
     */
    public function validateCredentials(Request $request)
    {
        $validated = $request->validate([
            'account_sid'   => 'required|string|max:100',
            'auth_token'    => 'required|string|max:200',
        ]);

        $tempSetting = new TwilioSetting([
            'account_sid'   => $request->account_sid,
            'auth_token'    => $request->auth_token,
        ]);

        $service = new TwilioService($tempSetting);
        [$ok, $message] = $service->testConnection();

        if ($ok) {
            $phoneNumbers = $service->fetchPhoneNumbers();
            return response()->json([
                'success' => true,
                'message' => 'Twilio connection verified successfully!',
                'phone_numbers' => $phoneNumbers,
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => $message,
        ], 422);
    }

    /**
     * Generate browser Voice SDK calling token.
     */
    public function generateToken(Request $request)
    {
        $setting = TwilioSetting::where('organization_id', $request->user()->organization_id)->first();
        if (!$setting || !$setting->isValidated()) {
            return response()->json(['error' => 'Twilio settings are not configured or validated.'], 400);
        }

        try {
            $service = new TwilioService($setting);
            $token = $service->generateVoiceToken($request->user()->email ?? 'agent');
            return response()->json([
                'token'        => $token,
                'phone_number' => $setting->phone_number,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Place outbound Call via Click-to-Call (bridges agent's phone with lead's phone).
     */
    public function placeCall(Request $request)
    {
        $validated = $request->validate([
            'to' => 'required|string',
        ]);

        $setting = TwilioSetting::where('organization_id', $request->user()->organization_id)->first();
        if (!$setting || !$setting->isValidated()) {
            return response()->json(['error' => 'Twilio settings are not configured or validated.'], 400);
        }

        // Get Agent's phone number
        $agentPhone = $request->user()->company_phone;
        if (empty($agentPhone)) {
            return response()->json(['error' => 'You must set your "Company phone" in Workspace settings to place click-to-call bridged connections.'], 400);
        }

        try {
            $service = new TwilioService($setting);
            $call = $service->placeCall($validated['to'], $agentPhone);
            return response()->json(['success' => true, 'call' => $call]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Send outbound SMS.
     */
    public function sendSms(Request $request)
    {
        $validated = $request->validate([
            'to'   => 'required|string',
            'body' => 'required|string|max:1600',
        ]);

        $setting = TwilioSetting::where('organization_id', $request->user()->organization_id)->first();
        if (!$setting || !$setting->isValidated()) {
            return response()->json(['error' => 'Twilio settings are not configured or validated.'], 400);
        }

        try {
            $service = new TwilioService($setting);
            $msg = $service->sendSms($validated['to'], $validated['body']);
            return response()->json(['success' => true, 'message' => $msg]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Manually sync Twilio logs for this organization.
     */
    public function syncLogs(Request $request)
    {
        $setting = TwilioSetting::where('organization_id', $request->user()->organization_id)->first();
        if (!$setting || !$setting->isValidated()) {
            return response()->json(['error' => 'Twilio settings are not configured or validated.'], 400);
        }

        $service = new TwilioService($setting);
        $res = $service->syncLogs();

        if ($res['success']) {
            return response()->json([
                'success'  => true,
                'message'  => "Logs synced successfully! Captured {$res['calls']} calls and {$res['messages']} messages.",
            ]);
        }

        return response()->json(['error' => $res['error'] ?? 'Sync failed'], 500);
    }

    /**
     * Remove Twilio configuration.
     */
    public function destroy(Request $request)
    {
        TwilioSetting::where('organization_id', $request->user()->organization_id)->delete();
        return back()->with('success', 'Twilio configuration removed.');
    }
}
