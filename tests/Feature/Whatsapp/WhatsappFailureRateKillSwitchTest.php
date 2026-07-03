<?php

use App\Models\Organization;
use App\Models\TenantWhatsappSettings;
use App\Models\WhatsappMessage;

test('artisan whatsapp:check-failure-rates disables a tenant with a high failure rate', function () {
    $org = Organization::create(['name' => 'Acme', 'slug' => 'acme']);
    TenantWhatsappSettings::create(['organization_id' => $org->id, 'is_enabled' => true]);

    for ($i = 0; $i < 6; $i++) {
        WhatsappMessage::create([
            'organization_id' => $org->id,
            'direction'       => 'outbound',
            'status'          => 'failed',
        ]);
    }
    for ($i = 0; $i < 4; $i++) {
        WhatsappMessage::create([
            'organization_id' => $org->id,
            'direction'       => 'outbound',
            'status'          => 'sent',
        ]);
    }

    $this->artisan('whatsapp:check-failure-rates')->assertExitCode(0);

    $settings = TenantWhatsappSettings::forOrganization($org->id);
    expect($settings->is_enabled)->toBeFalse();
    expect($settings->disabled_at)->not->toBeNull();

    $this->assertDatabaseHas('whatsapp_credential_audit_log', [
        'action' => 'auto_disabled_tenant',
    ]);
});

test('a low failure rate does not disable the tenant', function () {
    $org = Organization::create(['name' => 'Acme', 'slug' => 'acme']);
    TenantWhatsappSettings::create(['organization_id' => $org->id, 'is_enabled' => true]);

    for ($i = 0; $i < 9; $i++) {
        WhatsappMessage::create([
            'organization_id' => $org->id,
            'direction'       => 'outbound',
            'status'          => 'sent',
        ]);
    }
    WhatsappMessage::create([
        'organization_id' => $org->id,
        'direction'       => 'outbound',
        'status'          => 'failed',
    ]);

    $this->artisan('whatsapp:check-failure-rates')->assertExitCode(0);

    expect(TenantWhatsappSettings::forOrganization($org->id)->is_enabled)->toBeTrue();
});

test('a small sample size does not disable the tenant even at 100% failure', function () {
    $org = Organization::create(['name' => 'Acme', 'slug' => 'acme']);
    TenantWhatsappSettings::create(['organization_id' => $org->id, 'is_enabled' => true]);

    for ($i = 0; $i < 3; $i++) {
        WhatsappMessage::create([
            'organization_id' => $org->id,
            'direction'       => 'outbound',
            'status'          => 'failed',
        ]);
    }

    $this->artisan('whatsapp:check-failure-rates')->assertExitCode(0);

    expect(TenantWhatsappSettings::forOrganization($org->id)->is_enabled)->toBeTrue();
});
