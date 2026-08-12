<?php

namespace App\Http\Middleware;

use App\Models\Module;
use App\Models\Notification;
use App\Models\Plan;
use App\Support\TenantContext;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $tenant = app(TenantContext::class);
        $organization = $tenant->get();
        $impersonatorId = $request->session()->get('impersonator_id');

        // Tenant users (web guard) and platform admins (admin guard) are entirely
        // separate principals. Resolve both guards explicitly rather than via
        // $request->user() — Laravel's `auth:admin` middleware calls
        // Auth::shouldUse('admin') once that guard succeeds, which flips the
        // *default* guard for the rest of the request, so an unqualified
        // $request->user() cannot be trusted to mean "web guard" here.
        $webUser = $request->user('web');
        $adminUser = $request->user('admin');
        
        $isAdminContext = $request->is('admin*') || $request->is('admin');
        $resolvedUser = $isAdminContext ? $adminUser : ($webUser ?? $adminUser);
        $resolvedGuard = ($isAdminContext || (!$webUser && $adminUser)) ? 'admin' : 'web';

        return [
            ...parent::share($request),
            // Host only, no protocol — pages build canonical/OG URLs as
            // `https://{appUrl}{path}` (SeoHead component).
            'appUrl' => preg_replace('#^https?://#', '', rtrim(config('app.url'), '/')),
            'custom_logo_url' => \App\Models\SystemSetting::getCached('custom_logo_url'),
            'latestBlogs' => \Illuminate\Support\Facades\Cache::remember('latest_5_blogs', 3600, function () {
                return \App\Models\Blog::where('is_published', true)
                    ->orderBy('published_at', 'desc')
                    ->limit(5)
                    ->get(['title', 'slug'])
                    ->toArray();
            }),
            'seo' => [
                'meta_title'       => \App\Models\SystemSetting::getCached('seo_meta_title', 'LumeniaCRM - Turn Leads into Revenue'),
                'meta_description' => \App\Models\SystemSetting::getCached('seo_meta_description', 'Manage leads, campaigns, and pipelines in one unified platform.'),
                'meta_keywords'    => \App\Models\SystemSetting::getCached('seo_meta_keywords', 'crm, leadflow, lead tracking, prospecting'),
            ],
            'auth' => [
                'user'        => $resolvedUser,
                'guard'       => $resolvedGuard,
                'permissions' => $this->permissionsFor($webUser),
                'twilio_configured' => $tenant->check() ? \App\Models\TwilioSetting::where('organization_id', $tenant->id())->whereNotNull('validated_at')->exists() : false,
            ],
            'organization' => $organization ? [
                'id'   => $organization->id,
                'name' => $organization->name,
                'slug' => $organization->slug,
            ] : null,
            'plan' => $organization ? (function () use ($organization) {
                // Powers the persistent "your plan is pausing/paused" banner
                // (AppLayout) everywhere in the app, not just the Billing
                // page. latestSubscription(), not activeSubscription() — an
                // already-paused subscription has status `paused`, which
                // activeSubscription() deliberately excludes, and the banner
                // needs to keep showing (with a Resume action) for exactly
                // that state, not just the scheduled countdown before it.
                //
                // Internal (staff/test) organizations bypass plan gating and
                // billing state entirely, regardless of whatever Paddle
                // subscription happens to be attached to them.
                if ($organization->is_internal) {
                    return [
                        'name'         => $organization->plan?->name ?? 'Internal',
                        'status'       => 'active',
                        'modules'      => Module::pluck('key')->all(),
                        'subscription' => null,
                    ];
                }

                $latestSubscription = $organization->latestSubscription();

                return [
                    'name'    => $organization->plan?->name,
                    'status'  => $organization->plan_status,
                    'modules' => $organization->plan_status === 'active' && $organization->plan_id
                        ? Plan::cachedModuleKeys($organization->plan_id)
                        : [],
                    'subscription' => $latestSubscription ? [
                        'status'                  => $latestSubscription->status,
                        'scheduled_change_action' => $latestSubscription->scheduled_change_action,
                        'scheduled_change_at'     => $latestSubscription->scheduled_change_at?->toIso8601String(),
                    ] : null,
                ];
            })() : null,
            'impersonating' => $impersonatorId ? [
                'name' => $webUser?->name,
            ] : null,
            'notifications' => $tenant->check() ? [
                'unread' => Notification::unread()->count(),
                'items'  => Notification::latest()->limit(8)
                    ->get(['id', 'type', 'title', 'body', 'link', 'read_at', 'created_at'])
                    ->map(fn ($n) => [
                        'id'         => $n->id,
                        'type'       => $n->type,
                        'title'      => $n->title,
                        'body'       => $n->body,
                        'link'       => $n->link,
                        'read_at'    => $n->read_at,
                        'created_at' => $n->created_at->toIso8601String(),
                    ]),
            ] : null,
            'flash' => [
                'success'   => $request->session()->get('success'),
                'error'     => $request->session()->get('error'),
                'submitted' => $request->session()->get('submitted'),
            ],
        ];
    }

    /**
     * @return array<int, string>
     */
    private function permissionsFor(?\App\Models\User $user): array
    {
        if (! $user) {
            return [];
        }

        if ($user->isOwner()) {
            return ['*'];
        }

        if (! $user->role_id) {
            return [];
        }

        return \App\Models\Role::cachedPermissionKeys($user->role_id);
    }
}
