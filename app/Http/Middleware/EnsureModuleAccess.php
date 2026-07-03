<?php

namespace App\Http\Middleware;

use App\Support\TenantContext;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureModuleAccess
{
    public function handle(Request $request, Closure $next, string $module): Response
    {
        $organization = app(TenantContext::class)->get();

        if (! $organization || ! $organization->hasModule($module)) {
            abort(403, "This feature isn't included in your current plan. Contact us to upgrade.");
        }

        return $next($request);
    }
}
