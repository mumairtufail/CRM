<?php

use App\Models\Lead;
use App\Models\Organization;
use App\Models\PlatformWhatsappCredential;
use App\Models\TenantWhatsappSettings;
use App\Services\WhatsappService;
use Illuminate\Support\Facades\Http;

test('disabled tenant is blocked at the service layer directly', function () {
    $org = Organization::create(['name' => 'Acme', 'slug' => 'acme']);
    TenantWhatsappSettings::create(['organization_id' => $org->id, 'is_enabled' => false]);
    PlatformWhatsappCredential::create([
        'phone_number_id' => 'PN123',
        'access_token'    => 'token-abc',
        'meta_app_secret' => 'secret-abc',
        'status'          => 'active',
    ]);

    $lead = Lead::factory()->create(['organization_id' => $org->id, 'whatsapp_number' => '+15551234567']);

    Http::fake();

    $service = new WhatsappService();
    $result  = $service->send($lead, 'hello', $org->id);

    expect($result['success'])->toBeFalse();
    expect($result['error_code'])->toBe('TENANT_DISABLED');
    Http::assertNothingSent();
});

test('enabled tenant with an active credential can send', function () {
    $org = Organization::create(['name' => 'Acme', 'slug' => 'acme']);
    TenantWhatsappSettings::create(['organization_id' => $org->id, 'is_enabled' => true, 'plan_type' => 'paid']);
    PlatformWhatsappCredential::create([
        'phone_number_id' => 'PN123',
        'access_token'    => 'token-abc',
        'meta_app_secret' => 'secret-abc',
        'status'          => 'active',
    ]);

    $lead = Lead::factory()->create(['organization_id' => $org->id, 'whatsapp_number' => '+15551234567']);

    Http::fake([
        'graph.facebook.com/*' => Http::response(['messages' => [['id' => 'wamid.123']]], 200),
    ]);

    $service = new WhatsappService();
    $result  = $service->send($lead, 'hello', $org->id);

    expect($result['success'])->toBeTrue();
    expect($result['wa_message_id'])->toBe('wamid.123');

    $this->assertDatabaseHas('whatsapp_messages', [
        'organization_id' => $org->id,
        'wa_message_id'   => 'wamid.123',
        'status'          => 'sent',
    ]);
});
