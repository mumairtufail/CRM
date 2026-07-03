<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TeamMemberController extends Controller
{
    public function index(Request $request): Response
    {
        $orgId = $request->user()->organization_id;

        $members = User::where('organization_id', $orgId)
            ->where('role', 'member')
            ->with('assignedRole:id,name')
            ->orderBy('name')
            ->get()
            ->map(fn (User $u) => [
                'id'           => $u->id,
                'name'         => $u->name,
                'email'        => $u->email,
                'is_active'    => $u->is_active,
                'role'         => $u->assignedRole ? ['id' => $u->assignedRole->id, 'name' => $u->assignedRole->name] : null,
                'created_at'   => $u->created_at->format('M j, Y'),
            ]);

        return Inertia::render('Settings/Team/Index', [
            'members' => $members,
            'roles'   => Role::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $orgId = $request->user()->organization_id;

        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => ['required', 'email', 'max:255', Rule::unique('users', 'email')],
            'password' => ['required', 'string', 'min:8'],
            'role_id'  => ['required', Rule::exists('roles', 'id')->where('organization_id', $orgId)],
        ]);

        User::create([
            'organization_id' => $orgId,
            'name'            => $validated['name'],
            'email'           => $validated['email'],
            'password'        => Hash::make($validated['password']),
            'role'            => 'member',
            'role_id'         => $validated['role_id'],
        ]);

        return back()->with('success', 'Team member added.');
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $orgId = $request->user()->organization_id;

        abort_if($user->organization_id !== $orgId || $user->isOwner(), 404);

        $validated = $request->validate([
            'name'    => 'required|string|max:255',
            'email'   => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'role_id' => ['required', Rule::exists('roles', 'id')->where('organization_id', $orgId)],
        ]);

        $user->update($validated);

        return back()->with('success', 'Team member updated.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        abort_if($user->organization_id !== $request->user()->organization_id || $user->isOwner(), 404);

        $user->update(['is_active' => false]);

        return back()->with('success', 'Team member deactivated.');
    }
}
