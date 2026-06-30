<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\WhatsappCredential;
use App\Services\WhatsappService;
use Illuminate\Http\Request;

class WhatsappCredentialController extends Controller
{
    public function show(Request $request)
    {
        $credential = WhatsappCredential::where('organization_id', $request->user()->organization_id)
            ->first();

        if (!$credential) {
            return response()->json(['credential' => null]);
        }

        return response()->json([
            'credential' => [
                'id'           => $credential->id,
                'account_sid'  => $credential->account_sid,
                'auth_token'   => substr($credential->auth_token, 0, 4) . '****' . substr($credential->auth_token, -4),
                'from_number'  => $credential->from_number,
                'display_name' => $credential->display_name,
                'is_active'    => $credential->is_active,
                'is_verified'  => $credential->isVerified(),
                'verified_at'  => $credential->verified_at,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $orgId      = $request->user()->organization_id;
        $isUpdate   = WhatsappCredential::where('organization_id', $orgId)->exists();

        $validated = $request->validate([
            'account_sid'  => ['required', 'string', 'regex:/^AC/'],
            'auth_token'   => $isUpdate ? 'nullable|string|min:20' : 'required|string|min:20',
            'from_number'  => ['required', 'string', 'regex:/^\+?[1-9]\d{7,14}$/'],
            'display_name' => 'nullable|string|max:100',
        ], [
            'account_sid.regex'  => 'Account SID must start with AC',
            'from_number.regex'  => 'Phone number must be in international format e.g. +14155238886',
        ]);

        $fields = [
            'account_sid'  => $validated['account_sid'],
            'from_number'  => $validated['from_number'],
            'display_name' => $validated['display_name'] ?? null,
            'is_active'    => true,
            'verified_at'  => null,
        ];

        if (!empty($validated['auth_token'])) {
            $fields['auth_token'] = $validated['auth_token'];
        }

        WhatsappCredential::updateOrCreate(
            ['organization_id' => $orgId],
            $fields
        );

        return back()->with('success', 'WhatsApp credentials saved.');
    }

    public function verify(Request $request)
    {
        // Strip spaces, dashes, and parentheses before validation
        $cleaned = preg_replace('/[\s\-\(\)]/', '', $request->input('test_number', ''));
        $request->merge(['test_number' => $cleaned]);

        $request->validate([
            'test_number' => ['required', 'string', 'regex:/^\+?[1-9]\d{7,14}$/'],
        ], [
            'test_number.regex' => 'Phone number must be in international format e.g. +923001234567',
        ]);

        try {
            $credential = WhatsappCredential::where('organization_id', $request->user()->organization_id)
                ->first();

            if (!$credential) {
                return response()->json(['success' => false, 'message' => 'No WhatsApp credentials configured.'], 404);
            }

            $service = new WhatsappService($credential);

            if (!$service->verify()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Twilio credentials rejected. Double-check your Account SID and Auth Token.',
                ], 422);
            }

            $testLead = new Lead(['first_name' => 'Test', 'last_name' => 'User', 'whatsapp_number' => $cleaned]);
            $result   = $service->send($testLead, 'This is a test message from your CRM WhatsApp integration. If you received this, your setup is working correctly.');

            if ($result['success']) {
                $credential->update(['verified_at' => now()]);
                return response()->json(['success' => true, 'message' => 'Test message sent! Check your WhatsApp.']);
            }

            return response()->json(['success' => false, 'message' => 'Twilio rejected the send: ' . ($result['error'] ?? 'unknown error')], 422);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('WhatsApp verify exception', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Server error: ' . $e->getMessage()], 500);
        }
    }

    public function toggle(Request $request)
    {
        $credential = WhatsappCredential::where('organization_id', $request->user()->organization_id)
            ->firstOrFail();

        $credential->update(['is_active' => !$credential->is_active]);

        return back()->with('success', $credential->is_active ? 'WhatsApp enabled.' : 'WhatsApp disabled.');
    }

    public function destroy(Request $request)
    {
        WhatsappCredential::where('organization_id', $request->user()->organization_id)->delete();
        return back()->with('success', 'WhatsApp credentials removed.');
    }
}
