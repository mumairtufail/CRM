<?php

namespace App\Observers;

use App\Models\Role;

class RoleObserver
{
    public function saved(Role $role): void
    {
        Role::forgetPermissionCache($role->id);
    }

    public function deleted(Role $role): void
    {
        Role::forgetPermissionCache($role->id);
    }
}
