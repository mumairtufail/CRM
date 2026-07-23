<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\TwilioSetting;
use App\Models\TwilioCall;
use App\Models\TwilioMessage;
use App\Services\ActivityLogger;
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
            ->when(!$user->hasPermission('twilio.view_all'), fn ($q) => $q->where('user_id', $user->id))
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
                    'id'     => $lead->id,
                    'name'   => $lead->full_name,
                    'email'  => $lead->primary_email,
                    'phone'  => $lead->phones->first()?->phone,
                    'status' => $lead->status,
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
            'leadGroups'     => \App\Models\LeadGroup::orderBy('name')->get(['id', 'name', 'color']),
        ]);
    }

    /**
     * Get JSON list of logs for the softphone dialer widget.
     */
    public function logs(Request $request)
    {
        $user = $request->user();
        $orgId = $user->organization_id;

        $calls = TwilioCall::where('organization_id', $orgId)
            ->when(!$user->hasPermission('twilio.view_all'), fn ($q) => $q->where('user_id', $user->id))
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

        ActivityLogger::log('twilio.settings_updated', $setting, description: 'Twilio settings updated');

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

            ActivityLogger::log('dialer.call_placed', description: "Placed call to {$validated['to']}", properties: ['to' => $validated['to']]);

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

            ActivityLogger::log('dialer.sms_sent', description: "Sent SMS to {$validated['to']}", properties: ['to' => $validated['to']]);

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

        ActivityLogger::log('twilio.settings_removed', description: 'Twilio configuration removed');

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

        // Forward the browser's Range header to Twilio and relay its response as-is
        // (200 or 206) — without this, <audio> can't determine duration reliably or
        // seek to an arbitrary point, since it has no way to fetch a byte range.
        $httpClient = Http::withBasicAuth($setting->account_sid, $setting->auth_token);
        if ($range = $request->header('Range')) {
            $httpClient = $httpClient->withHeaders(['Range' => $range]);
        }

        $response = $httpClient->get($mediaUrl);

        if (!$response->successful() && $response->status() !== 206) {
            abort(502, 'Unable to fetch recording from Twilio.');
        }

        $headers = [
            'Content-Type'  => 'audio/mpeg',
            'Accept-Ranges' => 'bytes',
            'Cache-Control' => 'private, max-age=3600',
        ];
        if ($response->header('Content-Range')) {
            $headers['Content-Range'] = $response->header('Content-Range');
        }
        if ($response->header('Content-Length')) {
            $headers['Content-Length'] = $response->header('Content-Length');
        }

        return response($response->body(), $response->status(), $headers);
    }

    /**
     * Delete a single call log record.
     */
    public function destroyCall(Request $request, TwilioCall $call)
    {
        $user = $request->user();

        if ($call->organization_id !== $user->organization_id) {
            abort(404);
        }

        if (!$user->hasPermission('twilio.delete')) {
            abort(403, 'You do not have permission to delete call records.');
        }

        if (!$user->hasPermission('twilio.view_all') && $call->user_id !== $user->id) {
            abort(403, 'You can only delete your own call records.');
        }

        $call->delete();

        return back()->with('success', 'Call record deleted.');
    }

    /**
     * Delete multiple call log records at once.
     */
    public function bulkDestroyCalls(Request $request)
    {
        $user = $request->user();

        if (!$user->hasPermission('twilio.delete')) {
            abort(403, 'You do not have permission to delete call records.');
        }

        $validated = $request->validate([
            'ids'   => 'required|array|min:1',
            'ids.*' => 'integer',
        ]);

        $deleted = TwilioCall::where('organization_id', $user->organization_id)
            ->when(!$user->hasPermission('twilio.view_all'), fn ($q) => $q->where('user_id', $user->id))
            ->whereIn('id', $validated['ids'])
            ->delete();

        return response()->json(['success' => true, 'deleted' => $deleted]);
    }

    /**
     * Search all leads by name, email, or phone number — optionally narrowed to a
     * lead group and/or status, for both the Quick Dial dropdown and the Dialer
     * Hub's "Leads" tab.
     */
    public function searchLeads(Request $request)
    {
        $orgId    = $request->user()->organization_id;
        $q        = trim($request->input('q', ''));
        $groupId  = $request->input('group');
        $status   = $request->input('status');
        $filtered = $q !== '' || $groupId || $status;

        $leads = \App\Models\Lead::where('organization_id', $orgId)
            ->with(['phones', 'emails', 'groups'])
            ->when($q !== '', function ($query) use ($q) {
                $query->where(function ($sub) use ($q) {
                    $sub->where('first_name', 'like', "%{$q}%")
                        ->orWhere('last_name', 'like', "%{$q}%")
                        ->orWhere('company', 'like', "%{$q}%")
                        ->orWhereHas('emails', fn ($e) => $e->where('email', 'like', "%{$q}%"))
                        ->orWhereHas('phones', fn ($p) => $p->where('phone', 'like', "%{$q}%"));
                });
            })
            ->when($groupId, fn ($query) => $query->whereHas('groups', fn ($g) => $g->where('lead_groups.id', (int) $groupId)))
            ->when($status, fn ($query) => $query->where('status', $status))
            ->orderBy('first_name')
            // Default (no filters) is the "recent leads" quick-dial list, kept short;
            // once a group/status/search narrows things down, show more.
            ->limit($filtered ? 150 : 15)
            ->get();

        $results = $leads->map(fn ($lead) => [
            'id'               => $lead->id,
            'name'             => $lead->full_name,
            'email'            => $lead->primary_email,
            'phone'            => $lead->phones->first()?->phone,
            'company'          => $lead->company,
            'status'           => $lead->status,
            'contact_channels' => $lead->contact_channels,
            'groups'           => $lead->groups->map(fn ($g) => [
                'id' => $g->id, 'name' => $g->name, 'color' => $g->color,
            ])->all(),
        ])->filter(fn ($l) => !empty($l['phone']))->values();

        return response()->json($results);
    }
}
