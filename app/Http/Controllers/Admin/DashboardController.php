<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Lead;
use App\Models\Organization;
use App\Models\User;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // No tenant context is set for a super admin, so these counts span every
        // organization in the system.
        $stats = [
            'organizations' => Organization::count(),
            'users'         => User::where('is_superadmin', false)->count(),
            'leads'         => Lead::count(),
            'invoices'      => Invoice::count(),
        ];

        $recentOrganizations = Organization::withCount(['users', 'leads'])
            ->with('owner:id,name,email')
            ->latest()
            ->limit(6)
            ->get()
            ->map(fn ($o) => [
                'id'          => $o->id,
                'name'        => $o->name,
                'slug'        => $o->slug,
                'users_count' => $o->users_count,
                'leads_count' => $o->leads_count,
                'owner'       => $o->owner?->email,
                'created_at'  => $o->created_at->diffForHumans(),
            ]);

        $recentUsers = User::where('is_superadmin', false)
            ->with('organization:id,name')
            ->latest()
            ->limit(8)
            ->get()
            ->map(fn ($u) => [
                'id'           => $u->id,
                'name'         => $u->name,
                'email'        => $u->email,
                'role'         => $u->role,
                'organization' => $u->organization?->name,
                'created_at'   => $u->created_at->diffForHumans(),
            ]);

        return Inertia::render('Admin/Dashboard', [
            'stats'               => $stats,
            'recentOrganizations' => $recentOrganizations,
            'recentUsers'         => $recentUsers,
        ]);
    }
}
