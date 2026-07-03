<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use App\Models\Role;
use Database\Seeders\PermissionSeeder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RoleController extends Controller
{
    public function index(Request $request): Response
    {
        $roles = Role::withCount('users')
            ->with('permissions:id,key')
            ->orderBy('name')
            ->get()
            ->map(fn (Role $role) => [
                'id'               => $role->id,
                'name'             => $role->name,
                'is_default'       => $role->is_default,
                'users_count'      => $role->users_count,
                'permission_count' => $role->permissions->count(),
            ]);

        return Inertia::render('Settings/Roles/Index', [
            'roles'      => $roles,
            'permissionGroups' => $this->permissionGroups(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Settings/Roles/Form', [
            'role'             => null,
            'permissionGroups' => $this->permissionGroups(),
            'selectedIds'      => [],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validateRole($request);

        $role = Role::create(['name' => $validated['name']]);
        $role->permissions()->sync($validated['permission_ids']);

        return redirect()->route('settings.roles.index')->with('success', 'Role created.');
    }

    public function edit(Role $role): Response
    {
        return Inertia::render('Settings/Roles/Form', [
            'role'             => ['id' => $role->id, 'name' => $role->name, 'is_default' => $role->is_default],
            'permissionGroups' => $this->permissionGroups(),
            'selectedIds'      => $role->permissions()->pluck('permissions.id'),
        ]);
    }

    public function update(Request $request, Role $role): RedirectResponse
    {
        $validated = $this->validateRole($request, $role);

        $role->update(['name' => $validated['name']]);
        $role->permissions()->sync($validated['permission_ids']);
        Role::forgetPermissionCache($role->id);

        return redirect()->route('settings.roles.index')->with('success', 'Role updated.');
    }

    public function destroy(Role $role): RedirectResponse
    {
        if ($role->users()->exists()) {
            throw ValidationException::withMessages([
                'role' => 'Reassign or remove the team members using this role before deleting it.',
            ]);
        }

        $role->delete();

        return back()->with('success', 'Role deleted.');
    }

    private function validateRole(Request $request, ?Role $role = null): array
    {
        $validated = $request->validate([
            'name'             => [
                'required', 'string', 'max:255',
                Rule::unique('roles', 'name')->where('organization_id', $request->user()->organization_id)->ignore($role?->id),
            ],
            'permission_ids'   => 'array',
            'permission_ids.*' => 'integer|exists:permissions,id',
        ]);

        $validated['permission_ids'] = $validated['permission_ids'] ?? [];

        return $validated;
    }

    /**
     * @return array<int, array{group: string, permissions: array<int, array{id: int, key: string, label: string}>}>
     */
    private function permissionGroups(): array
    {
        $permissions = Permission::orderBy('id')->get()->groupBy('group');

        return collect(PermissionSeeder::CATALOG)->keys()
            ->map(fn ($group) => [
                'group'       => $group,
                'permissions' => ($permissions->get($group) ?? collect())
                    ->map(fn (Permission $p) => ['id' => $p->id, 'key' => $p->key, 'label' => $p->label])
                    ->values(),
            ])
            ->values()
            ->all();
    }
}
