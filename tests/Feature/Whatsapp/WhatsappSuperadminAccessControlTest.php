<?php

use App\Models\Admin;
use App\Models\Organization;
use App\Models\PlatformWhatsappCredential;
use App\Models\User;

test('unauthenticated admin-guard requests are redirected away from admin whatsapp routes', function () {
    $org  = Organization::create(['name' => 'Acme', 'slug' => 'acme']);
    $user = User::factory()->create(['organization_id' => $org->id]);

    // Authenticated as a tenant user (web guard), but not as an admin.
    $this->actingAs($user)->get('/admin/whatsapp-settings')->assertRedirect(route('admin.login'));
});

test('admins can access admin whatsapp routes', function () {
    $admin = Admin::factory()->create();

    // Tenants, pooled credential settings, and the unassigned-inbound queue are
    // all shown on this one combined admin page.
    $this->actingAs($admin, 'admin')->get('/admin/whatsapp-settings')->assertOk();
});

test('updating pooled credentials requires the current admin password', function () {
    $admin = Admin::factory()->create(['password' => bcrypt('correct-password')]);

    $response = $this->actingAs($admin, 'admin')->post('/admin/whatsapp-settings', [
        'current_password'         => 'wrong-password',
        'meta_business_account_id' => 'WABA123',
        'phone_number_id'          => 'PN123',
        'access_token'             => str_repeat('a', 25),
        'meta_app_secret'          => 'secretsecret',
        'webhook_verify_token'     => 'verifytoken',
    ]);

    $response->assertSessionHasErrors('current_password');
    expect(PlatformWhatsappCredential::count())->toBe(0);
});
