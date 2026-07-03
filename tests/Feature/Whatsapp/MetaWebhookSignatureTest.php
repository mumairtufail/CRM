<?php

use App\Models\PlatformWhatsappCredential;

function metaWebhookSignaturePayload(): array
{
    return [
        'entry' => [
            [
                'changes' => [
                    ['value' => ['messages' => []]],
                ],
            ],
        ],
    ];
}

test('valid signature is accepted and no side effects on an empty payload', function () {
    PlatformWhatsappCredential::create([
        'phone_number_id' => 'PN123',
        'access_token'    => 'token-abc',
        'meta_app_secret' => 'my-app-secret',
        'status'          => 'active',
    ]);

    $body      = json_encode(metaWebhookSignaturePayload());
    $signature = 'sha256=' . hash_hmac('sha256', $body, 'my-app-secret');

    $response = $this->call('POST', '/webhook/meta/whatsapp', [], [], [], [
        'HTTP_X-Hub-Signature-256' => $signature,
        'CONTENT_TYPE'             => 'application/json',
    ], $body);

    $response->assertStatus(200);
});

test('invalid signature is rejected with no side effects', function () {
    PlatformWhatsappCredential::create([
        'phone_number_id' => 'PN123',
        'access_token'    => 'token-abc',
        'meta_app_secret' => 'my-app-secret',
        'status'          => 'active',
    ]);

    $body = json_encode(metaWebhookSignaturePayload());

    $response = $this->call('POST', '/webhook/meta/whatsapp', [], [], [], [
        'HTTP_X-Hub-Signature-256' => 'sha256=' . str_repeat('0', 64),
        'CONTENT_TYPE'             => 'application/json',
    ], $body);

    $response->assertStatus(403);
});
