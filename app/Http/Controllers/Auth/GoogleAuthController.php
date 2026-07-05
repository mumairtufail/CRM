<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Auth\Concerns\CreatesOrganizationWithOwner;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\TenantContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    use CreatesOrganizationWithOwner;

    /** How long a "please name your workspace" hand-off survives before it must be redone. */
    private const PENDING_SIGNUP_TTL_MINUTES = 15;

    public function redirect(): RedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Google redirects here after consent. Three cases: the Google identity is
     * already linked to a user, it matches an existing password account by email
     * (auto-link), or it's brand new (stash the profile, ask for a workspace name).
     */
    public function callback(Request $request): RedirectResponse
    {
        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (\Throwable $e) {
            Log::warning('Google OAuth callback failed', ['error' => $e->getMessage()]);

            return redirect()->route('login')->withErrors([
                'email' => 'Google sign-in failed. Please try again.',
            ]);
        }

        $user = User::where('google_id', $googleUser->getId())->first();

        if (! $user) {
            $user = User::where('email', $googleUser->getEmail())->first();

            if ($user) {
                $user->update([
                    'google_id' => $googleUser->getId(),
                    'avatar'    => $user->avatar ?? $googleUser->getAvatar(),
                ]);
            }
        }

        if ($user) {
            return $this->loginExistingUser($user);
        }

        $token = Str::random(40);
        Cache::put('google_pending_signup:'.$token, [
            'google_id' => $googleUser->getId(),
            'email'     => $googleUser->getEmail(),
            'name'      => $googleUser->getName() ?: $googleUser->getNickname(),
            'avatar'    => $googleUser->getAvatar(),
        ], now()->addMinutes(self::PENDING_SIGNUP_TTL_MINUTES));

        session(['google_pending_signup_token' => $token]);

        return redirect()->route('register.google.workspace');
    }

    /**
     * The "just name your workspace" screen for a brand-new Google signup.
     */
    public function showWorkspaceForm(): Response|RedirectResponse
    {
        $payload = $this->pendingSignup();

        if (! $payload) {
            return redirect()->route('register')->withErrors([
                'email' => 'Your Google sign-in has expired. Please try again.',
            ]);
        }

        return Inertia::render('Auth/GoogleWorkspace', [
            'name'      => $payload['name'],
            'email'     => $payload['email'],
            'avatar'    => $payload['avatar'],
            'appDomain' => config('app.domain'),
        ]);
    }

    public function storeWorkspace(Request $request): RedirectResponse
    {
        $payload = $this->pendingSignup();

        if (! $payload) {
            return redirect()->route('register')->withErrors([
                'email' => 'Your Google sign-in has expired. Please try again.',
            ]);
        }

        $validated = $request->validate([
            'workspace' => 'required|string|max:150',
            'slug'      => [
                'nullable', 'string', 'max:60',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('organizations', 'slug'),
            ],
        ], [
            'slug.regex' => 'The workspace URL may only contain lowercase letters, numbers, and hyphens.',
        ]);

        $user = $this->createOrganizationWithOwner($validated['workspace'], ($validated['slug'] ?? '') ?: null, [
            'name'      => $payload['name'],
            'email'     => $payload['email'],
            'password'  => null,
            'google_id' => $payload['google_id'],
            'avatar'    => $payload['avatar'],
        ]);

        // Not mass-assignable (not in the model's Fillable list) — set directly,
        // same as the manual 6-digit-code flow does in verifyCode().
        $user->email_verified_at = now();
        $user->save();

        Cache::forget('google_pending_signup:'.session('google_pending_signup_token'));
        session()->forget('google_pending_signup_token');

        app(TenantContext::class)->set($user->organization);
        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }

    /**
     * @return array{google_id: string, email: string, name: ?string, avatar: ?string}|null
     */
    private function pendingSignup(): ?array
    {
        $token = session('google_pending_signup_token');

        return $token ? Cache::get('google_pending_signup:'.$token) : null;
    }

    private function loginExistingUser(User $user): RedirectResponse
    {
        if (! $user->is_active) {
            return redirect()->route('login')->withErrors([
                'email' => 'This account has been deactivated.',
            ]);
        }

        app(TenantContext::class)->set($user->organization);
        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}
