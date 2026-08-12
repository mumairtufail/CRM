<?php

namespace App\Http\Middleware;

use App\Support\TenantContext;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

/**
 * Locks an expired organization out of everything except Support (and the
 * escape hatches needed to actually leave: logging out, or an admin ending
 * an impersonation session to go help them). Runs after ResolveTenant so
 * TenantContext is already populated.
 */
class CheckOrganizationExpiry
{
    public function handle(Request $request, Closure $next): Response
    {
        $organization = app(TenantContext::class)->get();

        if (! $organization
            || $organization->is_internal
            || ! $organization->expires_at
            || ! $organization->expires_at->isPast()
            || $request->is('support*', 'impersonate/leave', 'logout')
            || session('impersonator_id')
        ) {
            return $next($request);
        }

        return Inertia::render('AccountExpired')->toResponse($request);
    }
}
