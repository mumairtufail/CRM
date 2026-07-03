<?php

namespace App\Http\Controllers;

use App\Models\PlatformWhatsappCredential;
use App\Models\TenantWhatsappSettings;
use App\Models\WhatsappUsageMonthly;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WhatsappStatusController extends Controller
{
    public function show(Request $request)
    {
        $orgId    = $request->user()->organization_id;
        $settings = TenantWhatsappSettings::forOrganization($orgId);
        $usage    = WhatsappUsageMonthly::currentMonthFor($orgId);
        $platform = PlatformWhatsappCredential::active();

        return Inertia::render('WhatsApp/Status', [
            'enabled'        => (bool) $settings?->isUsableForSend(),
            'planType'       => $settings?->plan_type,
            'quota'          => $settings?->monthly_message_quota,
            'usedThisMonth'  => $usage?->sent_count ?? 0,
            'lastVerifiedAt' => $platform?->last_verified_at?->toISOString(),
        ]);
    }
}
