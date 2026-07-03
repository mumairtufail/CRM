<?php

use App\Models\Lead;
use App\Models\Organization;
use App\Models\PlatformWhatsappCredential;
use App\Models\TenantWhatsappSettings;
use App\Models\WhatsappTemplate;
use App\Services\WhatsappService;
use Illuminate\Support\Facades\Http;

function setupEnabledOrgForTemplateTest(): Organization
{
    $org = Organization::create(['name' => 'Acme', 'slug' => 'acme-' . uniqid()]);
    TenantWhatsappSettings::create(['organization_id' => $org->id, 'is_enabled' => true, 'plan_type' => 'paid']);
    PlatformWhatsappCredential::create([
        'phone_number_id' => 'PN123',
        'access_token'    => 'token-abc',
        'status'          => 'active',
    ]);

    return $org;
}

test('unknown template name is rejected before any HTTP call', function () {
    $org  = setupEnabledOrgForTemplateTest();
    $lead = Lead::factory()->create(['organization_id' => $org->id, 'whatsapp_number' => '+15551234567']);

    Http::fake();

    $result = (new WhatsappService())->send($lead, '', $org->id, 'template', 'does_not_exist');

    expect($result['success'])->toBeFalse();
    expect($result['error_code'])->toBe('INVALID_TEMPLATE');
    Http::assertNothingSent();
});

test('unapproved template is rejected before any HTTP call', function () {
    $org  = setupEnabledOrgForTemplateTest();
    $lead = Lead::factory()->create(['organization_id' => $org->id, 'whatsapp_number' => '+15551234567']);
    WhatsappTemplate::create(['name' => 'pending_template', 'status' => 'pending']);

    Http::fake();

    $result = (new WhatsappService())->send($lead, '', $org->id, 'template', 'pending_template');

    expect($result['success'])->toBeFalse();
    expect($result['error_code'])->toBe('INVALID_TEMPLATE');
    Http::assertNothingSent();
});

test('approved template passes through to Meta', function () {
    $org  = setupEnabledOrgForTemplateTest();
    $lead = Lead::factory()->create(['organization_id' => $org->id, 'whatsapp_number' => '+15551234567']);
    WhatsappTemplate::create(['name' => 'welcome_message', 'status' => 'approved']);

    Http::fake([
        'graph.facebook.com/*' => Http::response(['messages' => [['id' => 'wamid.tpl']]], 200),
    ]);

    $result = (new WhatsappService())->send($lead, '', $org->id, 'template', 'welcome_message');

    expect($result['success'])->toBeTrue();
    Http::assertSentCount(1);
});
