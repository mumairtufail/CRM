<?php

use App\Models\Organization;
use App\Models\User;
use App\Models\TwilioSetting;
use App\Models\TwilioCall;
use App\Models\TwilioMessage;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('twilio voice webhook returns twiml reject if not configured', function () {
    $response = $this->postJson(route('webhooks.twilio.voice'), [
        'To' => '+18573823163',
        'From' => '+15555555555',
        'CallSid' => 'CA1234567890abcdef',
    ]);

    $response->assertStatus(200);
    $this->assertStringContainsString('<Reject />', $response->getContent());
});

test('twilio voice webhook routes to owner and returns twiml dial if configured', function () {
    $org = Organization::create([
        'name' => 'Test Org',
        'slug' => 'test-org',
    ]);

    $owner = User::create([
        'organization_id' => $org->id,
        'name' => 'Owner User',
        'email' => 'owner@test.com',
        'password' => bcrypt('password'),
    ]);

    $org->update(['owner_id' => $owner->id]);

    TwilioSetting::create([
        'organization_id' => $org->id,
        'account_sid' => 'ACtestAccountSid',
        'auth_token' => 'testAuthToken',
        'phone_number' => '+18573823163',
        'is_active' => true,
        'validated_at' => now(),
    ]);

    $response = $this->postJson(route('webhooks.twilio.voice'), [
        'To' => '+18573823163',
        'From' => '+15555555555',
        'CallSid' => 'CA1234567890abcdef',
    ]);

    $response->assertStatus(200);
    $this->assertStringContainsString('<Client>' . $owner->email . '</Client>', $response->getContent());
    $this->assertStringContainsString('voicemail', $response->getContent());

    $this->assertDatabaseHas('twilio_calls', [
        'organization_id' => $org->id,
        'sid' => 'CA1234567890abcdef',
        'direction' => 'inbound',
        'status' => 'ringing',
    ]);
});

test('twilio sms webhook creates a lead and message log if configured', function () {
    $org = Organization::create([
        'name' => 'Test Org',
        'slug' => 'test-org',
    ]);

    $owner = User::create([
        'organization_id' => $org->id,
        'name' => 'Owner User',
        'email' => 'owner@test.com',
        'password' => bcrypt('password'),
    ]);

    $org->update(['owner_id' => $owner->id]);

    TwilioSetting::create([
        'organization_id' => $org->id,
        'account_sid' => 'ACtestAccountSid',
        'auth_token' => 'testAuthToken',
        'phone_number' => '+18573823163',
        'is_active' => true,
        'validated_at' => now(),
    ]);

    $response = $this->postJson(route('webhooks.twilio.sms'), [
        'To' => '+18573823163',
        'From' => '+15555555555',
        'Body' => 'Hello CRM!',
        'MessageSid' => 'SM1234567890abcdef',
    ]);

    $response->assertStatus(200);

    $this->assertDatabaseHas('twilio_messages', [
        'organization_id' => $org->id,
        'sid' => 'SM1234567890abcdef',
        'body' => 'Hello CRM!',
        'direction' => 'inbound',
        'status' => 'received',
    ]);

    $this->assertDatabaseHas('leads', [
        'organization_id' => $org->id,
        'first_name' => 'Twilio',
    ]);
});

test('twilio index page is rendered for authenticated user with config', function () {
    $org = Organization::create([
        'name' => 'Test Org',
        'slug' => 'test-org',
    ]);

    $user = User::create([
        'organization_id' => $org->id,
        'name' => 'Test User',
        'email' => 'test@test.com',
        'password' => bcrypt('password'),
        'role' => 'owner',
    ]);

    $this->actingAs($user);

    $response = $this->get(route('twilio.index'));

    $response->assertStatus(200);
});
