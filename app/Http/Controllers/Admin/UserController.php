<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with('organization:id,name,slug');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->latest()->paginate(20)->withQueryString()
            ->through(fn ($u) => [
                'id'            => $u->id,
                'name'          => $u->name,
                'email'         => $u->email,
                'role'          => $u->role,
                'is_superadmin' => $u->is_superadmin,
                'organization'  => $u->organization ? [
                    'name' => $u->organization->name,
                    'slug' => $u->organization->slug,
                ] : null,
                'created_at'    => $u->created_at->format('M j, Y'),
            ]);

        return Inertia::render('Admin/Users', [
            'users'   => $users,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Begin impersonating a tenant user. The current super admin id is stashed in
     * the session so it can be restored later, then we log in as the target user.
     */
    public function impersonate(User $user): RedirectResponse
    {
        if ($user->isSuperadmin()) {
            abort(403, 'You cannot impersonate another super admin.');
        }

        if ($user->id === Auth::id()) {
            return back();
        }

        session(['impersonator_id' => Auth::id()]);

        Auth::login($user);

        return redirect('/')->with('success', "You are now viewing as {$user->name}.");
    }
}
