<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        // Only honor a stashed "intended" URL if it belongs to the tenant app —
        // a guest hitting an /admin/* page earlier in this browser session could
        // otherwise leave a stale admin URL that bounces this login straight
        // back out to /admin/login.
        $intended = $request->session()->pull('url.intended');
        if ($intended && ! str_starts_with(parse_url($intended, PHP_URL_PATH) ?? '', '/admin')) {
            return redirect()->to($intended);
        }

        return redirect()->to(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        ActivityLogger::log('auth.logout', description: Auth::user()?->name . ' logged out');

        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
