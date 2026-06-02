<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Restricts a route to platform super admins. While impersonating, the active
 * user is a normal tenant user, so this naturally blocks /admin access until
 * the admin leaves impersonation.
 */
class EnsureSuperadmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! Auth::check() || ! Auth::user()->isSuperadmin()) {
            abort(403, 'Super admin access only.');
        }

        return $next($request);
    }
}
