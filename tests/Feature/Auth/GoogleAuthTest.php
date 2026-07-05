<?php

use App\Models\Organization;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;

function fakeGoogleUser(array $attributes = []): void
{
    Socialite::fake('google', SocialiteUser::fake(array_merge([
        'id'     => 'google-123',
        'name'   => 'Ali Raza',
        'email'  => 'ali@example.com',
        'avatar' => 'https://example.com/avatar.jpg',
    ], $attributes)));
}

test('brand new google signup is asked to name a workspace, then creates the organization', function () {
    fakeGoogleUser();

    $response = $this->get('/auth/google/callback');
    $response->assertRedirect(route('register.google.workspace'));
    $this->assertGuest();

    $workspaceResponse = $this->get(route('register.google.workspace'));
    $workspaceResponse->assertOk();

    $store = $this->post(route('register.google.workspace'), [
        'workspace' => 'Ali Corp',
    ]);

    $user = User::where('email', 'ali@example.com')->first();

    expect($user)->not->toBeNull();
    expect($user->google_id)->toBe('google-123');
    expect($user->avatar)->toBe('https://example.com/avatar.jpg');
    expect($user->password)->toBeNull();
    expect($user->email_verified_at)->not->toBeNull();
    expect($user->role)->toBe('owner');
    expect(Organization::where('id', $user->organization_id)->exists())->toBeTrue();

    $this->assertAuthenticatedAs($user);
    $store->assertRedirect(route('dashboard', absolute: false));
});

test('google sign-in auto-links an existing password account by email', function () {
    $organization = Organization::create(['name' => 'Existing Org', 'slug' => 'existing-org']);
    $user = User::factory()->create([
        'organization_id' => $organization->id,
        'email'           => 'ali@example.com',
        'google_id'       => null,
    ]);

    fakeGoogleUser(['email' => 'ali@example.com']);

    $response = $this->get('/auth/google/callback');

    $user->refresh();
    expect($user->google_id)->toBe('google-123');
    expect(User::count())->toBe(1);
    expect(Organization::count())->toBe(1);

    $this->assertAuthenticatedAs($user);
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('returning user with a linked google_id logs in directly without creating anything new', function () {
    $organization = Organization::create(['name' => 'Existing Org', 'slug' => 'existing-org']);
    $user = User::factory()->create([
        'organization_id' => $organization->id,
        'email'           => 'ali@example.com',
        'google_id'       => 'google-123',
    ]);

    fakeGoogleUser(['email' => 'ali@example.com']);

    $response = $this->get('/auth/google/callback');

    expect(User::count())->toBe(1);
    $this->assertAuthenticatedAs($user);
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('deactivated account cannot log in via google', function () {
    $organization = Organization::create(['name' => 'Existing Org', 'slug' => 'existing-org']);
    User::factory()->create([
        'organization_id' => $organization->id,
        'email'           => 'ali@example.com',
        'google_id'       => 'google-123',
        'is_active'       => false,
    ]);

    fakeGoogleUser(['email' => 'ali@example.com']);

    $response = $this->get('/auth/google/callback');

    $this->assertGuest();
    $response->assertRedirect(route('login'));
    $response->assertSessionHasErrors('email');
});

test('a google-only account cannot log in through the password form', function () {
    $organization = Organization::create(['name' => 'Existing Org', 'slug' => 'existing-org']);
    User::factory()->create([
        'organization_id' => $organization->id,
        'email'           => 'ali@example.com',
        'password'        => null,
        'google_id'       => 'google-123',
    ]);

    $response = $this->post('/login', [
        'email'    => 'ali@example.com',
        'password' => 'whatever',
    ]);

    $this->assertGuest();
    $response->assertSessionHasErrors('email');
});
