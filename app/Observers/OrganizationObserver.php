<?php

namespace App\Observers;

use App\Models\Organization;
use App\Models\Permission;
use App\Models\Role;
use Database\Seeders\PermissionSeeder;

class OrganizationObserver
{
    /**
     * Seed a default "Agent" role for every new organization. Runs inside the
     * same transaction the caller creates the organization in.
     *
     * organization_id is set explicitly rather than relying on BelongsToTenant's
     * auto-stamp, because TenantContext isn't active yet at this point during
     * registration (it's set after the transaction commits).
     */
    public function created(Organization $organization): void
    {
        $role = Role::create([
            'organization_id' => $organization->id,
            'name'            => 'Agent',
            'is_default'      => true,
        ]);

        $permissionIds = Permission::whereIn('key', PermissionSeeder::AGENT_DEFAULTS)->pluck('id');

        $role->permissions()->sync($permissionIds);
    }
}
