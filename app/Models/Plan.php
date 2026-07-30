<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Cache;

#[ObservedBy(\App\Observers\PlanObserver::class)]
class Plan extends Model
{
    protected $fillable = [
        'name', 'slug', 'tagline', 'description', 'price_monthly', 'price_monthly_original', 'price_yearly', 'price_yearly_original',
        'is_active', 'is_featured', 'sort_order', 'cta_text', 'lead_limit', 'user_limit',
        'paddle_product_id', 'paddle_price_id_monthly', 'paddle_price_id_yearly',
    ];

    protected $casts = [
        'is_active'              => 'boolean',
        'is_featured'            => 'boolean',
        'price_monthly'          => 'decimal:2',
        'price_monthly_original' => 'decimal:2',
        'price_yearly'           => 'decimal:2',
        'price_yearly_original'  => 'decimal:2',
        'lead_limit'             => 'integer',
        'user_limit'             => 'integer',
    ];

    public function modules(): BelongsToMany
    {
        return $this->belongsToMany(Module::class, 'module_plan');
    }

    public function organizations(): HasMany
    {
        return $this->hasMany(Organization::class);
    }

    /**
     * Module keys unlocked by a plan, cached (this app's cache store is
     * `database`, so invalidation is explicit `Cache::forget()` rather than
     * tags — see PlanObserver and PlanController::update()).
     *
     * @return array<int, string>
     */
    public static function cachedModuleKeys(int $planId): array
    {
        return Cache::remember(
            "plan_modules:{$planId}",
            3600,
            fn () => static::find($planId)?->modules()->pluck('key')->all() ?? []
        );
    }

    public static function forgetModuleCache(int $planId): void
    {
        Cache::forget("plan_modules:{$planId}");
    }

    /**
     * The Paddle-checkout-ready tier list for the public pricing page and the
     * in-app Billing page — same shape the old static pricingTiers.js
     * exported, now sourced from the DB so admin edits actually take effect.
     * Only plans with a linked Paddle product can be sold through checkout.
     *
     * @return array<int, array{name: string, slug: string, description: ?string, features: array<int, string>, priceId: array{month: ?string, year: ?string}, isFeatured: bool}>
     */
    public static function paddleTiers(): array
    {
        return static::where('is_active', true)
            ->whereNotNull('paddle_product_id')
            ->with('modules:id,name')
            ->orderBy('sort_order')
            ->get()
            ->map(fn (Plan $plan) => [
                'name'        => $plan->name,
                'slug'        => $plan->slug,
                'description' => $plan->tagline,
                'features'    => [
                    'Core CRM — leads, pipeline, invoicing, reports, team',
                    ...$plan->modules->pluck('name')->all(),
                ],
                'priceId' => [
                    'month' => $plan->paddle_price_id_monthly,
                    'year'  => $plan->paddle_price_id_yearly,
                ],
                'isFeatured' => $plan->is_featured,
            ])
            ->values()
            ->all();
    }

    /**
     * The public landing-page tier list. Same shape as paddleTiers() but also
     * includes the Free tier (no Paddle product — priceId is null, handled
     * by Welcome.jsx by skipping PricePreview/Checkout and linking to
     * /register instead).
     *
     * @return array<int, array{name: string, slug: string, description: ?string, features: array<int, string>, priceId: array{month: ?string, year: ?string}, isFeatured: bool, leadLimit: ?int}>
     */
    public static function publicPricingTiers(): array
    {
        // Always-included core capabilities, regardless of tier — these are
        // never module-gated, so every plan (including Free) gets them.
        $coreFeatures = [
            'Leads, pipeline & AI-powered lead search',
            'Kanban & Timeline pipeline views',
            'Projects with tasks & milestones',
            'Client invoicing',
            'CSV & Google Sheets import/export',
            'Reports & analytics',
            'Roles & permissions',
            'Dedicated support',
        ];

        // WhatsApp is built but not yet publicly launched (see project
        // convention: marked "coming soon" everywhere else on the site) — the
        // module stays assigned to Premium in the DB for when it ships, but
        // isn't advertised as available today.
        $unadvertisedModuleKeys = ['whatsapp_campaigns', 'whatsapp_automation'];

        return static::where('is_active', true)
            ->with('modules:id,name,key')
            ->orderBy('sort_order')
            ->get()
            ->map(function (Plan $plan) use ($coreFeatures, $unadvertisedModuleKeys) {
                // Email Campaigns unlocks more than the module's bare name
                // implies — call out the two things that actually sell it.
                $emailCampaignExtras = $plan->modules->contains('key', 'email_campaigns')
                    ? ['AI-generated campaign & follow-up content', 'Automated, configurable follow-up sequences']
                    : [];

                return [
                    'name'        => $plan->name,
                    'slug'        => $plan->slug,
                    'description' => $plan->tagline,
                    'features'    => [
                        $plan->lead_limit ? "Up to {$plan->lead_limit} leads" : 'Unlimited leads',
                        $plan->user_limit ? "Up to {$plan->user_limit} team members" : 'Unlimited team members',
                        ...$coreFeatures,
                        ...$plan->modules->whereNotIn('key', $unadvertisedModuleKeys)->pluck('name')->all(),
                        ...$emailCampaignExtras,
                    ],
                    'priceId' => [
                        'month' => $plan->paddle_price_id_monthly,
                        'year'  => $plan->paddle_price_id_yearly,
                    ],
                    'isFeatured' => $plan->is_featured,
                    'leadLimit'  => $plan->lead_limit,
                ];
            })
            ->values()
            ->all();
    }
}
