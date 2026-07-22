<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\TwilioSetting;
use App\Models\TwilioCall;
use App\Models\TwilioMessage;
use App\Services\TwilioService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
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
            ->with('user:id,name')
            ->orderBy('created_at', 'desc')
            ->paginate(15, ['*'], 'calls_page');

        $messages = TwilioMessage::where('organization_id', $orgId)
            ->orderBy('created_at', 'desc')
            ->paginate(15, ['*'], 'messages_page');

        $setting = TwilioSetting::where('organization_id', $orgId)->first();

        // Get list of recent leads with phones for quick contact dropdown
        $leads = \App\Models\Lead::where('organization_id', $orgId)
            ->with(['phones', 'emails'])
            ->orderBy('first_name')
            ->limit(100)
            ->get()
            ->map(function ($lead) {
                return [
                    'id'    => $lead->id,
                    'name'  => $lead->full_name,
                    'email' => $lead->primary_email,
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
            ->with('user:id,name')
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
     * Fetch the live account balance from Twilio for the "remaining credits" display in settings.
     */
    public function balance(Request $request)
    {
        $setting = TwilioSetting::where('organization_id', $request->user()->organization_id)->first();
        if (!$setting || !$setting->isValidated()) {
            return response()->json(['error' => 'Twilio settings are not configured or validated.'], 400);
        }

        try {
            $service = new TwilioService($setting);
            return response()->json(['success' => true] + $service->fetchBalance());
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove Twilio configuration.
     */
    public function destroy(Request $request)
    {
        TwilioSetting::where('organization_id', $request->user()->organization_id)->delete();
        return back()->with('success', 'Twilio configuration removed.');
    }

    /**
     * Stream a call recording's audio through the server so the browser never needs
     * direct access to Twilio credentials (Twilio's recording media URLs require
     * HTTP Basic Auth and are not fetchable straight from the browser).
     */
    public function streamRecording(Request $request, TwilioCall $call)
    {
        if ($call->organization_id !== $request->user()->organization_id) {
            abort(404);
        }

        if (!$call->recording_url) {
            abort(404, 'No recording available for this call.');
        }

        $setting = TwilioSetting::where('organization_id', $call->organization_id)->first();
        if (!$setting) {
            abort(404);
        }

        $mediaUrl = rtrim($call->recording_url, '/') . '.mp3';

        $response = Http::withBasicAuth($setting->account_sid, $setting->auth_token)->get($mediaUrl);

        if (!$response->successful()) {
            abort(502, 'Unable to fetch recording from Twilio.');
        }

        return response($response->body(), 200)
            ->header('Content-Type', 'audio/mpeg')
            ->header('Cache-Control', 'private, max-age=3600');
    }

    /**
     * Search all leads by name, email, or phone number.
     */
    public function searchLeads(Request $request)
    {
        $orgId = $request->user()->organization_id;
        $q = trim($request->input('q', ''));

        if (empty($q)) {
            // Return top 15 leads by default
            $leads = \App\Models\Lead::where('organization_id', $orgId)
                ->with(['phones', 'emails'])
                ->orderBy('first_name')
                ->limit(15)
                ->get();
        } else {
            // Search all leads
            $leads = \App\Models\Lead::where('organization_id', $orgId)
                ->with(['phones', 'emails'])
                ->where(function ($query) use ($q) {
                    $query->where('first_name', 'like', "%{$q}%")
                        ->orWhere('last_name', 'like', "%{$q}%")
                        ->orWhereHas('emails', function ($eQuery) use ($q) {
                            $eQuery->where('email', 'like', "%{$q}%");
                        })
                        ->orWhereHas('phones', function ($pQuery) use ($q) {
                            $pQuery->where('phone', 'like', "%{$q}%");
                        });
                })
                ->orderBy('first_name')
                ->limit(30)
                ->get();
        }

        $results = $leads->map(function ($lead) {
            return [
                'id'    => $lead->id,
                'name'  => $lead->full_name,
                'email' => $lead->primary_email,
                'phone' => $lead->phones->first()?->phone,
            ];
        })->filter(fn($l) => !empty($l['phone']))->values();

        return response()->json($results);
    }
}
