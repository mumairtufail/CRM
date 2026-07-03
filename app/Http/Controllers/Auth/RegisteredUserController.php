<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\Plan;
use App\Models\Tag;
use App\Models\User;
use App\Support\TenantContext;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register', [
            // Only set when subdomain tenancy is configured; drives the slug hint.
            'appDomain' => config('app.domain'),
        ]);
    }

    /**
     * Handle an incoming registration request: create a brand-new organization
     * and its owner user.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'workspace' => 'required|string|max:150',
            'slug'      => [
                'nullable', 'string', 'max:60',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('organizations', 'slug'),
            ],
            'name'      => 'required|string|max:255',
            'email'     => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password'  => ['required', 'confirmed', Rules\Password::defaults()],
        ], [
            'slug.regex' => 'The workspace URL may only contain lowercase letters, numbers, and hyphens.',
        ]);

        $slug = $validated['slug'] ?: $this->uniqueSlug($validated['workspace']);

        $user = DB::transaction(function () use ($validated, $slug) {
            $basicPlan = Plan::where('slug', 'basic')->first()
                ?? Plan::where('is_active', true)->orderBy('sort_order')->first()
                ?? Plan::first();

            $organization = Organization::create([
                'name'             => $validated['workspace'],
                'slug'             => $slug,
                'plan_id'          => $basicPlan?->id,
                'plan_status'      => 'active',
                'plan_assigned_at' => now(),
            ]);

            $user = User::create([
                'organization_id' => $organization->id,
                'role'            => 'owner',
                'name'            => $validated['name'],
                'email'           => $validated['email'],
                'password'        => Hash::make($validated['password']),
            ]);

            $organization->update(['owner_id' => $user->id]);

            Tag::seedDefaults($organization->id);

            return $user;
        });

        app(TenantContext::class)->set($user->organization);

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }

    /**
     * Build a unique slug from the workspace name.
     */
    protected function uniqueSlug(string $name): string
    {
        $base = Str::slug($name) ?: 'workspace';
        $slug = $base;
        $i = 1;

        while (Organization::where('slug', $slug)->exists()) {
            $slug = $base.'-'.(++$i);
        }

        return $slug;
    }
}
