<?php

use App\Models\Organization;
use App\Models\Role;
use App\Models\User;
use App\Support\TenantContext;
use Database\Seeders\PermissionSeeder;

function makeOrgWithOwner(): array
{
    (new PermissionSeeder())->run();

    $org = Organization::create(['name' => 'Acme', 'slug' => 'acme-' . uniqid()]);
    $owner = User::create([
        'organization_id' => $org->id,
        'role'            => 'owner',
        'name'            => 'Owner',
        'email'           => 'owner-' . uniqid() . '@example.com',
        'password'        => bcrypt('password'),
    ]);
    $org->update(['owner_id' => $owner->id]);
    app(TenantContext::class)->set($org);

    return [$org, $owner];
}

test('a default Agent role is auto-seeded when an organization is created', function () {
    [$org] = makeOrgWithOwner();

    $role = $org->roles()->first();

    expect($role)->not->toBeNull();
    expect($role->name)->toBe('Agent');
    expect($role->is_default)->toBeTrue();
    expect($role->permissions()->count())->toBeGreaterThan(0);
});

test('the owner bypasses all permission checks regardless of role', function () {
    [, $owner] = makeOrgWithOwner();

    expect($owner->hasPermission('leads.delete'))->toBeTrue();
    expect($owner->hasPermission('team.manage_roles'))->toBeTrue();
});

test('a member without the matching permission is denied', function () {
    [$org] = makeOrgWithOwner();
    $role = $org->roles()->first();

    $agent = User::create([
        'organization_id' => $org->id,
        'role'            => 'member',
        'role_id'         => $role->id,
        'name'            => 'Agent',
        'email'           => 'agent-' . uniqid() . '@example.com',
        'password'        => bcrypt('password'),
    ]);

    expect($agent->hasPermission('leads.edit'))->toBeTrue();
    expect($agent->hasPermission('leads.delete'))->toBeFalse();
    expect($agent->hasPermission('team.manage'))->toBeFalse();
});

test('the team list excludes the organization owner', function () {
    [$org, $owner] = makeOrgWithOwner();
    $role = $org->roles()->first();

    $agent = User::create([
        'organization_id' => $org->id,
        'role'            => 'member',
        'role_id'         => $role->id,
        'name'            => 'Agent',
        'email'           => 'agent-' . uniqid() . '@example.com',
        'password'        => bcrypt('password'),
    ]);

    $response = $this->actingAs($owner)->get('/settings/team');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->has('members', 1)
        ->where('members.0.id', $agent->id)
    );
});

test('deactivated team members cannot log in', function () {
    [$org] = makeOrgWithOwner();
    $role = $org->roles()->first();

    $agent = User::create([
        'organization_id' => $org->id,
        'role'            => 'member',
        'role_id'         => $role->id,
        'is_active'       => false,
        'name'            => 'Agent',
        'email'           => 'agent-' . uniqid() . '@example.com',
        'password'        => bcrypt('password'),
    ]);

    $response = $this->post('/login', [
        'email'    => $agent->email,
        'password' => 'password',
    ]);

    $response->assertSessionHasErrors('email');
    $this->assertGuest();
});

test('deleting a role with assigned members is blocked', function () {
    [$org, $owner] = makeOrgWithOwner();
    $role = $org->roles()->first();

    User::create([
        'organization_id' => $org->id,
        'role'            => 'member',
        'role_id'         => $role->id,
        'name'            => 'Agent',
        'email'           => 'agent-' . uniqid() . '@example.com',
        'password'        => bcrypt('password'),
    ]);

    $response = $this->actingAs($owner)->delete("/settings/roles/{$role->id}");

    $response->assertSessionHasErrors('role');
    expect(Role::find($role->id))->not->toBeNull();
});
