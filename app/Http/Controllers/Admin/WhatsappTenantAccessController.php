<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\PlatformWhatsappCredential;
use App\Models\TenantWhatsappSettings;
use Illuminate\Http\Request;

class WhatsappTenantAccessController extends Controller
{
    public function update(Request $request, Organization $organization)
    {
        $validated = $request->validate([
            'is_enabled'            => 'required|boolean',
            'plan_type'             => 'required|in:trial,paid,suspended',
            'monthly_message_quota' => 'nullable|integer|min:0',
            'billing_note'          => 'nullable|string|max:2000',
        ]);

        if ($validated['is_enabled'] && !PlatformWhatsappCredential::active()) {
            return back()->withErrors(['is_enabled' => 'Configure pooled WhatsApp credentials before enabling any tenant.']);
        }

        $settings = TenantWhatsappSettings::forOrganization($organization->id);
        $wasEnabled = (bool) $settings?->is_enabled;

        $fields = [
            'plan_type'             => $validated['plan_type'],
            'monthly_message_quota' => $validated['monthly_message_quota'] ?? null,
            'billing_note'          => $validated['billing_note'] ?? null,
        ];

        if ($validated['is_enabled'] && !$wasEnabled) {
            $fields['is_enabled'] = true;
            $fields['enabled_by'] = $request->user('admin')->id;
            $fields['enabled_at'] = now();
        } elseif (!$validated['is_enabled'] && $wasEnabled) {
            $fields['is_enabled']  = false;
            $fields['disabled_at'] = now();
        } else {
            $fields['is_enabled'] = $validated['is_enabled'];
        }

        TenantWhatsappSettings::updateOrCreate(['organization_id' => $organization->id], $fields);

        return back()->with('success', 'WhatsApp access updated for ' . $organization->name . '.');
    }
}
