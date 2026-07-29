<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Auth\Concerns\CreatesOrganizationWithOwner;
use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class OrganizationController extends Controller
{
    use CreatesOrganizationWithOwner;

    public function index(Request $request)
    {
        $query = Organization::withCount(['users', 'leads'])
            ->with(['owner:id,name,email', 'plan:id,name,slug']);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        $organizations = $query->latest()->paginate(20)->withQueryString()
            ->through(fn ($o) => [
                'id'          => $o->id,
                'name'        => $o->name,
                'slug'        => $o->slug,
                'users_count' => $o->users_count,
                'leads_count' => $o->leads_count,
                'owner'       => $o->owner ? [
                    'name'  => $o->owner->name,
                    'email' => $o->owner->email,
                ] : null,
                'plan'        => $o->plan ? ['id' => $o->plan->id, 'name' => $o->plan->name] : null,
                'plan_status' => $o->plan_status,
                'expires_at'  => $o->expires_at?->toISOString(),
                'is_internal' => $o->is_internal,
                'created_at'  => $o->created_at->format('M j, Y'),
            ]);

        return Inertia::render('Admin/Organizations', [
            'organizations' => $organizations,
            'filters'       => $request->only(['search']),
            'plans'         => Plan::where('is_active', true)->orderBy('sort_order')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'workspace'   => 'required|string|max:150',
            'name'        => 'required|string|max:255',
            'email'       => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password'    => ['required', 'confirmed', \Illuminate\Validation\Rules\Password::defaults()],
            'plan_id'     => ['nullable', Rule::exists('plans', 'id')],
            'is_internal' => ['boolean'],
            'expires_at'  => ['nullable', 'date'],
        ]);

        $user = $this->createOrganizationWithOwner($validated['workspace'], null, [
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
        ], [
            'plan_id'     => $validated['plan_id'] ?? null,
            'is_internal' => $validated['is_internal'] ?? false,
            'expires_at'  => $validated['expires_at'] ?? null,
        ]);

        // Admin is handing credentials over directly — skip the 6-digit
        // email verification flow registration normally requires.
        $user->forceFill(['email_verified_at' => now()])->save();

        return redirect()->route('admin.organizations.index')
            ->with('success', "Workspace {$validated['workspace']} has been created for {$user->email}.");
    }

    public function updatePlan(Request $request, Organization $organization): RedirectResponse
    {
        $validated = $request->validate([
            'plan_id'     => ['nullable', Rule::exists('plans', 'id')],
            'plan_status' => ['required', Rule::in(['active', 'inactive'])],
            'is_internal' => ['boolean'],
            'expires_at'  => ['nullable', 'date'],
        ]);

        $organization->update([
            'plan_id'          => $validated['plan_id'],
            'plan_status'      => $validated['plan_status'],
            'plan_assigned_at' => now(),
            'is_internal'      => $validated['is_internal'] ?? false,
            'expires_at'       => $validated['expires_at'] ?? null,
        ]);

        return back()->with('success', "Updated {$organization->name}'s plan.");
    }

    public function destroy(Organization $organization): RedirectResponse
    {
        $organization->delete();

        return back()->with('success', "Workspace {$organization->name} has been deleted successfully.");
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids'   => 'required|array',
            'ids.*' => 'exists:organizations,id',
        ]);

        Organization::whereIn('id', $validated['ids'])->delete();

        return back()->with('success', 'Selected workspaces have been deleted successfully.');
    }
}
