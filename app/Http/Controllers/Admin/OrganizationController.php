<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\Plan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class OrganizationController extends Controller
{
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
                'created_at'  => $o->created_at->format('M j, Y'),
            ]);

        return Inertia::render('Admin/Organizations', [
            'organizations' => $organizations,
            'filters'       => $request->only(['search']),
            'plans'         => Plan::where('is_active', true)->orderBy('sort_order')->get(['id', 'name']),
        ]);
    }

    public function updatePlan(Request $request, Organization $organization): RedirectResponse
    {
        $validated = $request->validate([
            'plan_id'     => ['nullable', Rule::exists('plans', 'id')],
            'plan_status' => ['required', Rule::in(['active', 'inactive'])],
        ]);

        $organization->update([
            'plan_id'          => $validated['plan_id'],
            'plan_status'      => $validated['plan_status'],
            'plan_assigned_at' => now(),
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
