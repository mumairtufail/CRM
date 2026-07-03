<?php

use App\Models\Organization;
use App\Models\TenantWhatsappSettings;

test('trial tenants get a stricter send limit than paid tenants', function () {
    $trialOrg = Organization::create(['name' => 'Trial Co', 'slug' => 'trial-co']);
    TenantWhatsappSettings::create(['organization_id' => $trialOrg->id, 'is_enabled' => true, 'plan_type' => 'trial']);

    $paidOrg = Organization::create(['name' => 'Paid Co', 'slug' => 'paid-co']);
    TenantWhatsappSettings::create(['organization_id' => $paidOrg->id, 'is_enabled' => true, 'plan_type' => 'paid']);

    $trialLimit = TenantWhatsappSettings::sendLimitFor($trialOrg->id);
    $paidLimit  = TenantWhatsappSettings::sendLimitFor($paidOrg->id);

    expect($trialLimit->maxAttempts)->toBeLessThan($paidLimit->maxAttempts);
});

test('send limit falls back to the trial ceiling when no settings exist', function () {
    $limit = TenantWhatsappSettings::sendLimitFor(999999);

    expect($limit->maxAttempts)->toBe(5);
});
