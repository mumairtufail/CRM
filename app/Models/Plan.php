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
        'name', 'slug', 'tagline', 'price_monthly', 'price_yearly',
        'is_active', 'is_featured', 'sort_order', 'cta_text',
    ];

    protected $casts = [
        'is_active'     => 'boolean',
        'is_featured'   => 'boolean',
        'price_monthly' => 'decimal:2',
        'price_yearly'  => 'decimal:2',
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
}
