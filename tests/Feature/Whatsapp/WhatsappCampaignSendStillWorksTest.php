<?php

use App\Jobs\SendWhatsappBatch;
use App\Models\Lead;
use App\Models\Organization;
use App\Models\PlatformWhatsappCredential;
use App\Models\TenantWhatsappSettings;
use App\Models\WhatsappCampaign;
use App\Models\WhatsappSend;
use Illuminate\Support\Facades\Http;

test('campaign batch send still works end-to-end through the pooled Meta transport', function () {
    $org = Organization::create(['name' => 'Acme', 'slug' => 'acme']);
    TenantWhatsappSettings::create(['organization_id' => $org->id, 'is_enabled' => true, 'plan_type' => 'paid']);
    PlatformWhatsappCredential::create([
        'phone_number_id' => 'PN123',
        'access_token'    => 'token-abc',
        'status'          => 'active',
    ]);

    $lead = Lead::factory()->create([
        'organization_id'  => $org->id,
        'first_name'       => 'Jane',
        'whatsapp_number'  => '+15551234567',
    ]);

    $campaign = WhatsappCampaign::create([
        'organization_id'  => $org->id,
        'name'             => 'Test Campaign',
        'message_body'     => 'Hi {{first_name}}!',
        'status'           => 'sending',
        'recipient_mode'   => 'all',
        'total_recipients' => 1,
    ]);

    Http::fake([
        'graph.facebook.com/*' => Http::response(['messages' => [['id' => 'wamid.campaign1']]], 200),
    ]);

    (new SendWhatsappBatch($campaign->id, [$lead->id], true))->handle();

    $campaign->refresh();
    expect($campaign->sent_count)->toBe(1);
    expect($campaign->failed_count)->toBe(0);
    expect($campaign->status)->toBe('sent');

    $send = WhatsappSend::where('whatsapp_campaign_id', $campaign->id)->first();
    expect($send->status)->toBe('sent');
    expect($send->wa_message_id)->toBe('wamid.campaign1');
    expect($send->whatsapp_message_id)->not->toBeNull();
    expect($send->message_body)->toBe('Hi Jane!');

    $this->assertDatabaseHas('whatsapp_messages', [
        'organization_id' => $org->id,
        'wa_message_id'   => 'wamid.campaign1',
    ]);
});

test('campaign send is blocked when the tenant is disabled', function () {
    $org = Organization::create(['name' => 'Acme', 'slug' => 'acme']);
    TenantWhatsappSettings::create(['organization_id' => $org->id, 'is_enabled' => false]);
    PlatformWhatsappCredential::create([
        'phone_number_id' => 'PN123',
        'access_token'    => 'token-abc',
        'status'          => 'active',
    ]);

    $lead = Lead::factory()->create(['organization_id' => $org->id, 'whatsapp_number' => '+15551234567']);

    $campaign = WhatsappCampaign::create([
        'organization_id'  => $org->id,
        'name'             => 'Test Campaign',
        'message_body'     => 'Hi there!',
        'status'           => 'sending',
        'recipient_mode'   => 'all',
        'total_recipients' => 1,
    ]);

    Http::fake();

    (new SendWhatsappBatch($campaign->id, [$lead->id], true))->handle();

    $campaign->refresh();
    expect($campaign->status)->toBe('failed');
    Http::assertNothingSent();
});
