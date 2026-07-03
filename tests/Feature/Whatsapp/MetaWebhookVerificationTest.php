<?php

use App\Models\PlatformWhatsappCredential;

test('correct verify token returns the hub challenge', function () {
    PlatformWhatsappCredential::create([
        'phone_number_id'      => 'PN123',
        'access_token'         => 'token-abc',
        'webhook_verify_token' => 'my-verify-token',
        'status'               => 'active',
    ]);

    $response = $this->get('/webhook/meta/whatsapp?' . http_build_query([
        'hub.mode'         => 'subscribe',
        'hub.verify_token' => 'my-verify-token',
        'hub.challenge'    => 'challenge-123',
    ]));

    $response->assertStatus(200);
    $response->assertSee('challenge-123');
});

test('incorrect verify token is rejected', function () {
    PlatformWhatsappCredential::create([
        'phone_number_id'      => 'PN123',
        'access_token'         => 'token-abc',
        'webhook_verify_token' => 'my-verify-token',
        'status'               => 'active',
    ]);

    $response = $this->get('/webhook/meta/whatsapp?' . http_build_query([
        'hub.mode'         => 'subscribe',
        'hub.verify_token' => 'wrong-token',
        'hub.challenge'    => 'challenge-123',
    ]));

    $response->assertStatus(403);
});
