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
    ];

    protected $casts = [
        'settings'         => 'array',
        'plan_assigned_at' => 'datetime',
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

    public function isFollowupEnabled(): bool
    {
        return (bool) ($this->settings['followup_enabled'] ?? false);
    }

    /**
     * Whether this tenant's active plan unlocks the given module key.
     * Modules not in the catalog (e.g. core CRM) are always available.
     */
    public function hasModule(string $key): bool
    {
        if ($this->plan_status !== 'active' || ! $this->plan_id) {
            return false;
        }

        return in_array($key, Plan::cachedModuleKeys($this->plan_id), true);
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
