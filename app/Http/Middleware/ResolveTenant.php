<?php

namespace App\Http\Middleware;

use App\Models\Organization;
use App\Support\TenantContext;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Hybrid tenant resolver:
 *  1. If the request host is a tenant subdomain (e.g. acme.crm.test), resolve the
 *     organization by its slug.
 *  2. Otherwise fall back to the authenticated user's organization.
 *  3. If both are present and disagree, deny access (cross-tenant URL access).
 */
class ResolveTenant
{
    public function handle(Request $request, Closure $next): Response
    {
        $tenant = app(TenantContext::class);

        $subdomainOrg = $this->resolveFromSubdomain($request);
        $userOrg      = Auth::check() ? Auth::user()->organization : null;

        if ($subdomainOrg && $userOrg && $subdomainOrg->id !== $userOrg->id) {
            abort(403, 'You do not have access to this workspace.');
        }

        $org = $subdomainOrg ?: $userOrg;

        if ($org) {
            $tenant->set($org);
        }

        return $next($request);
    }

    /**
     * Returns the organization matching the request subdomain, or null when the
     * request is on the bare app domain (no tenant subdomain). A subdomain that
     * matches no organization aborts with 404.
     */
    protected function resolveFromSubdomain(Request $request): ?Organization
    {
        $host      = $request->getHost();
        $appDomain = config('app.domain');

        if (! $appDomain || $host === $appDomain) {
            return null;
        }

        if (! str_ends_with($host, '.'.$appDomain)) {
            return null;
        }

        $sub = substr($host, 0, -(strlen($appDomain) + 1));

        if ($sub === '' || $sub === 'www') {
            return null;
        }

        return Organization::where('slug', $sub)->firstOr(function () {
            abort(404, 'Workspace not found.');
        });
    }
}
