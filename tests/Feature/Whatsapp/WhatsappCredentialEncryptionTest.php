<?php

use App\Models\PlatformWhatsappCredential;
use Illuminate\Support\Facades\DB;

test('access token round-trips through the encrypted cast and is not stored in plaintext', function () {
    $credential = PlatformWhatsappCredential::create([
        'phone_number_id' => 'PN123',
        'access_token'    => 'super-secret-token',
        'meta_app_secret' => 'super-secret-app-secret',
        'status'          => 'active',
    ]);

    expect($credential->fresh()->access_token)->toBe('super-secret-token');

    $rawRow = DB::table('platform_whatsapp_credentials')->where('id', $credential->id)->first();
    expect($rawRow->access_token)->not->toBe('super-secret-token');
    expect($rawRow->meta_app_secret)->not->toBe('super-secret-app-secret');
});

test('access token and app secret are hidden from array/JSON serialization', function () {
    $credential = PlatformWhatsappCredential::create([
        'phone_number_id'      => 'PN123',
        'access_token'         => 'super-secret-token',
        'meta_app_secret'      => 'super-secret-app-secret',
        'webhook_verify_token' => 'verify-me',
        'status'               => 'active',
    ]);

    $serialized = $credential->fresh()->toArray();

    expect($serialized)->not->toHaveKey('access_token');
    expect($serialized)->not->toHaveKey('meta_app_secret');
    expect($serialized)->not->toHaveKey('webhook_verify_token');
});
