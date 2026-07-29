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
        'is_active', 'is_featured', 'sort_order', 'cta_text', 'lead_limit',
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
        return static::where('is_active', true)
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
                'leadLimit'  => $plan->lead_limit,
            ])
            ->values()
            ->all();
    }
}
