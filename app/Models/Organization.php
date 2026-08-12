<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[ObservedBy(\App\Observers\OrganizationObserver::class)]
class Organization extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'slug', 'owner_id', 'settings', 'plan_id', 'plan_status', 'plan_assigned_at',
        'company_name', 'company_logo', 'company_website', 'company_phone', 'company_email', 'company_linkedin',
        'paddle_customer_id', 'expires_at', 'is_internal',
    ];

    protected $casts = [
        'settings'         => 'array',
        'plan_assigned_at' => 'datetime',
        'expires_at'       => 'datetime',
        'is_internal'      => 'boolean',
    ];

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function roles(): HasMany
    {
        return $this->hasMany(Role::class);
    }

    public function leads(): HasMany
    {
        return $this->hasMany(Lead::class);
    }

    public function whatsappSettings(): HasOne
    {
        return $this->hasOne(TenantWhatsappSettings::class, 'organization_id');
    }

    public function supportCases(): HasMany
    {
        return $this->hasMany(SupportCase::class);
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    /**
     * The most recent Paddle subscription that currently grants paid access, if any.
     */
    public function activeSubscription(): ?Subscription
    {
        return $this->subscriptions()
            ->whereIn('status', Subscription::ACCESS_GRANTING_STATUSES)
            ->latest('id')
            ->first();
    }

    /**
     * The most recent subscription regardless of status — unlike
     * activeSubscription(), this also finds one that's already `paused`,
     * which is exactly the case resuming needs to look up.
     */
    public function latestSubscription(): ?Subscription
    {
        return $this->subscriptions()->latest('id')->first();
    }

    /**
     * Whether this tenant's active plan unlocks the given module key.
     * Modules not in the catalog (e.g. core CRM) are always available.
     * Internal (staff/test) organizations skip plan gating entirely.
     */
    public function hasModule(string $key): bool
    {
        if ($this->is_internal) {
            return true;
        }

        if ($this->plan_status !== 'active' || ! $this->plan_id) {
            return false;
        }

        return in_array($key, Plan::cachedModuleKeys($this->plan_id), true);
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /**
     * Lead cap from the current plan, or null when unlimited.
     */
    public function leadLimit(): ?int
    {
        return $this->plan?->lead_limit;
    }

    public function hasReachedLeadLimit(): bool
    {
        $limit = $this->leadLimit();

        return $limit !== null && $this->leads()->count() >= $limit;
    }

    /**
     * Team-member seat cap from the current plan, or null when unlimited.
     */
    public function userLimit(): ?int
    {
        return $this->plan?->user_limit;
    }

    public function hasReachedUserLimit(): bool
    {
        $limit = $this->userLimit();

        return $limit !== null && $this->users()->count() >= $limit;
    }
}
