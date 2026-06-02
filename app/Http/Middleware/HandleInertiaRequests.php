<?php

namespace App\Http\Middleware;

use App\Models\Notification;
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

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'organization' => $organization ? [
                'id'   => $organization->id,
                'name' => $organization->name,
                'slug' => $organization->slug,
            ] : null,
            'impersonating' => $impersonatorId ? [
                'name' => $request->user()?->name,
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
}
