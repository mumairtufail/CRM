<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrganizationController extends Controller
{
    public function index(Request $request)
    {
        $query = Organization::withCount(['users', 'leads'])
            ->with('owner:id,name,email');

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
                'created_at'  => $o->created_at->format('M j, Y'),
            ]);

        return Inertia::render('Admin/Organizations', [
            'organizations' => $organizations,
            'filters'       => $request->only(['search']),
        ]);
    }
}
