<?php

use App\Models\Lead;
use App\Models\Organization;
use App\Models\PlatformWhatsappCredential;
use App\Models\TenantWhatsappSettings;
use App\Models\WhatsappUsageMonthly;
use App\Services\WhatsappService;
use Illuminate\Support\Facades\Http;

test('send is blocked once the monthly quota is reached, before any HTTP call', function () {
    $org = Organization::create(['name' => 'Acme', 'slug' => 'acme']);
    TenantWhatsappSettings::create([
        'organization_id'       => $org->id,
        'is_enabled'            => true,
        'plan_type'             => 'trial',
        'monthly_message_quota' => 5,
    ]);
    PlatformWhatsappCredential::create([
        'phone_number_id' => 'PN123',
        'access_token'    => 'token-abc',
        'status'          => 'active',
    ]);
    WhatsappUsageMonthly::create([
        'organization_id' => $org->id,
        'year_month'      => now()->format('Y-m'),
        'sent_count'      => 5,
    ]);

    $lead = Lead::factory()->create(['organization_id' => $org->id, 'whatsapp_number' => '+15551234567']);

    Http::fake();

    $result = (new WhatsappService())->send($lead, 'hello', $org->id);

    expect($result['success'])->toBeFalse();
    expect($result['error_code'])->toBe('QUOTA_EXCEEDED');
    Http::assertNothingSent();
});

test('send succeeds while quota remains', function () {
    $org = Organization::create(['name' => 'Acme', 'slug' => 'acme']);
    TenantWhatsappSettings::create([
        'organization_id'       => $org->id,
        'is_enabled'            => true,
        'plan_type'             => 'trial',
        'monthly_message_quota' => 5,
    ]);
    PlatformWhatsappCredential::create([
        'phone_number_id' => 'PN123',
        'access_token'    => 'token-abc',
        'status'          => 'active',
    ]);
    WhatsappUsageMonthly::create([
        'organization_id' => $org->id,
        'year_month'      => now()->format('Y-m'),
        'sent_count'      => 2,
    ]);

    $lead = Lead::factory()->create(['organization_id' => $org->id, 'whatsapp_number' => '+15551234567']);

    Http::fake([
        'graph.facebook.com/*' => Http::response(['messages' => [['id' => 'wamid.999']]], 200),
    ]);

    $result = (new WhatsappService())->send($lead, 'hello', $org->id);

    expect($result['success'])->toBeTrue();
    Http::assertSentCount(1);
});
