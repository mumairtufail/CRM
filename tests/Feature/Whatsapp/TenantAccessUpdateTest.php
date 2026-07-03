<?php

use App\Models\Admin;
use App\Models\Organization;
use App\Models\PlatformWhatsappCredential;
use App\Models\TenantWhatsappSettings;

test('admin can update a tenant whatsapp plan by numeric organization id', function () {
    $admin = Admin::factory()->create();
    $org = Organization::create(['name' => 'Acme', 'slug' => 'acme-' . uniqid()]);

    PlatformWhatsappCredential::create([
        'phone_number_id' => 'PN1',
        'access_token'    => str_repeat('a', 25),
        'status'          => 'active',
    ]);

    $response = $this->actingAs($admin, 'admin')->patch("/admin/whatsapp-tenants/{$org->id}", [
        'is_enabled'            => false,
        'plan_type'             => 'suspended',
        'monthly_message_quota' => null,
        'billing_note'          => null,
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $settings = TenantWhatsappSettings::where('organization_id', $org->id)->first();
    expect($settings->plan_type)->toBe('suspended');
});
