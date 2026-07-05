<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Auth\Concerns\CreatesOrganizationWithOwner;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\TenantContext;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    use CreatesOrganizationWithOwner;

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

        $user = $this->createOrganizationWithOwner($validated['workspace'], ($validated['slug'] ?? '') ?: null, [
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        // Generate a 6-digit email verification code
        $code = rand(100000, 999999);
        \Illuminate\Support\Facades\Cache::put('email_verification_code:' . $user->id, $code, now()->addSeconds(90));

        // Send verification email using superadmin's default SMTP configuration
        try {
            \App\Services\MailService::sendUsingSuperadminSmtp(
                $user->email, 
                'Verify Your Email Address', 
                '<div style="font-family: sans-serif; max-width: 500px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">'
                . '<h2 style="font-size:18px;font-weight:700;margin-bottom:12px;color:#1e1b4b">Verify Your Email</h2>'
                . '<p style="color:#4b5563;line-height:1.75;font-size:14px;">Thank you for registering! Your 6-digit email verification code is:</p>'
                . '<div style="font-size:26px;font-weight:bold;color:#7c3aed;letter-spacing:4px;margin:24px 0;background:#f8fafc;padding:12px;text-align:center;border-radius:8px;">' . $code . '</div>'
                . '<p style="color:#94a3b8;font-size:12px;">This code is valid for 90 seconds. If you did not request this, you can safely ignore this email.</p>'
                . '</div>'
            );
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Email verification code failed to send on signup', ['error' => $e->getMessage()]);
        }

        // Store user ID in session to allow access to verify form
        session(['register_user_id' => $user->id]);

        return redirect()->route('register.verify');
    }

    /**
     * Show the 6-digit verification code form.
     */
    public function showVerifyForm(): Response|\Illuminate\Http\RedirectResponse
    {
        if (!session('register_user_id')) {
            return redirect()->route('register');
        }
        return Inertia::render('Auth/VerifyCode', [
            'status' => session('status')
        ]);
    }

    /**
     * Verify the user's submitted 6-digit code.
     */
    public function verifyCode(Request $request): RedirectResponse
    {
        $userId = session('register_user_id');
        if (!$userId) {
            return redirect()->route('register');
        }

        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $cachedCode = \Illuminate\Support\Facades\Cache::get('email_verification_code:' . $userId);

        if (!$cachedCode || $cachedCode != $request->code) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'code' => 'The verification code is invalid or has expired.',
            ]);
        }

        $user = User::findOrFail($userId);
        $user->email_verified_at = now();
        $user->save();

        // Clear verification cache and session keys
        \Illuminate\Support\Facades\Cache::forget('email_verification_code:' . $userId);
        session()->forget('register_user_id');

        app(TenantContext::class)->set($user->organization);
        
        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }

    /**
     * Resend the 6-digit verification code.
     */
    public function resendCode(Request $request): \Illuminate\Http\JsonResponse
    {
        $userId = session('register_user_id');
        if (!$userId) {
            return response()->json(['message' => 'Session expired. Please register again.'], 422);
        }

        $user = User::findOrFail($userId);
        $code = rand(100000, 999999);
        \Illuminate\Support\Facades\Cache::put('email_verification_code:' . $user->id, $code, now()->addSeconds(90));

        try {
            \App\Services\MailService::sendUsingSuperadminSmtp(
                $user->email, 
                'Verify Your Email Address', 
                '<div style="font-family: sans-serif; max-width: 500px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">'
                . '<h2 style="font-size:18px;font-weight:700;margin-bottom:12px;color:#1e1b4b">Verify Your Email</h2>'
                . '<p style="color:#4b5563;line-height:1.75;font-size:14px;">Your 6-digit email verification code is:</p>'
                . '<div style="font-size:26px;font-weight:bold;color:#7c3aed;letter-spacing:4px;margin:24px 0;background:#f8fafc;padding:12px;text-align:center;border-radius:8px;">' . $code . '</div>'
                . '<p style="color:#94a3b8;font-size:12px;">This code is valid for 90 seconds.</p>'
                . '</div>'
            );
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Failed to send verification code. Please contact support.'], 500);
        }

        return response()->json(['message' => 'Verification code resent successfully.']);
    }
}
