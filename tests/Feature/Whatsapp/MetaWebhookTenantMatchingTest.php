<?php

use App\Jobs\ProcessMetaWebhookPayload;
use App\Models\Lead;
use App\Models\Organization;
use App\Models\TenantWhatsappSettings;
use App\Models\WhatsappConversation;
use App\Models\WhatsappUnassignedInbound;
use Illuminate\Support\Facades\Http;

function inboundMessagePayload(string $waMessageId, string $from): array
{
    return [
        'entry' => [
            [
                'changes' => [
                    [
                        'value' => [
                            'messages' => [
                                ['id' => $waMessageId, 'from' => $from, 'type' => 'text', 'text' => ['body' => 'Hello there']],
                            ],
                        ],
                    ],
                ],
            ],
        ],
    ];
}

test('inbound message with a single enabled-tenant match is routed and no AI reply is sent without a configured provider', function () {
    $org = Organization::create(['name' => 'Acme', 'slug' => 'acme']);
    TenantWhatsappSettings::create(['organization_id' => $org->id, 'is_enabled' => true]);
    $lead = Lead::factory()->create(['organization_id' => $org->id, 'whatsapp_number' => '+15551234567']);

    Http::fake();

    (new ProcessMetaWebhookPayload(inboundMessagePayload('wamid.in1', '15551234567')))->handle(app(\App\Services\WhatsappBotService::class));

    $this->assertDatabaseHas('whatsapp_conversations', [
        'lead_id'      => $lead->id,
        'organization_id' => $org->id,
        'direction'    => 'inbound',
        'wa_message_id' => 'wamid.in1',
    ]);

    expect(WhatsappUnassignedInbound::count())->toBe(0);
});

test('inbound message matching two enabled tenants with the same number is routed to the unassigned queue', function () {
    $orgA = Organization::create(['name' => 'Acme', 'slug' => 'acme']);
    $orgB = Organization::create(['name' => 'Beta', 'slug' => 'beta']);
    TenantWhatsappSettings::create(['organization_id' => $orgA->id, 'is_enabled' => true]);
    TenantWhatsappSettings::create(['organization_id' => $orgB->id, 'is_enabled' => true]);
    Lead::factory()->create(['organization_id' => $orgA->id, 'whatsapp_number' => '+15559998888']);
    Lead::factory()->create(['organization_id' => $orgB->id, 'whatsapp_number' => '+15559998888']);

    (new ProcessMetaWebhookPayload(inboundMessagePayload('wamid.in2', '15559998888')))->handle(app(\App\Services\WhatsappBotService::class));

    $this->assertDatabaseMissing('whatsapp_conversations', ['wa_message_id' => 'wamid.in2']);

    $unassigned = WhatsappUnassignedInbound::where('wa_message_id', 'wamid.in2')->first();
    expect($unassigned)->not->toBeNull();
    expect($unassigned->matched_organization_ids)->toHaveCount(2);
});

test('inbound message from an unknown number is routed to the unassigned queue with no candidates', function () {
    (new ProcessMetaWebhookPayload(inboundMessagePayload('wamid.in3', '15550001111')))->handle(app(\App\Services\WhatsappBotService::class));

    $unassigned = WhatsappUnassignedInbound::where('wa_message_id', 'wamid.in3')->first();
    expect($unassigned)->not->toBeNull();
    expect($unassigned->matched_organization_ids)->toBeNull();
});

test('inbound message is ignored for a lead in a disabled tenant', function () {
    $org = Organization::create(['name' => 'Acme', 'slug' => 'acme']);
    TenantWhatsappSettings::create(['organization_id' => $org->id, 'is_enabled' => false]);
    Lead::factory()->create(['organization_id' => $org->id, 'whatsapp_number' => '+15552223333']);

    (new ProcessMetaWebhookPayload(inboundMessagePayload('wamid.in4', '15552223333')))->handle(app(\App\Services\WhatsappBotService::class));

    $this->assertDatabaseMissing('whatsapp_conversations', ['wa_message_id' => 'wamid.in4']);
    $unassigned = WhatsappUnassignedInbound::where('wa_message_id', 'wamid.in4')->first();
    expect($unassigned)->not->toBeNull();
    expect($unassigned->matched_organization_ids)->toBeNull();
});
