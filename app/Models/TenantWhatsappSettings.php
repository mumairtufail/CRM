<?php

namespace App\Models;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Eloquent\Model;

class TenantWhatsappSettings extends Model
{
    protected $table = 'tenant_whatsapp_settings';

    protected $fillable = [
        'organization_id',
        'is_enabled',
        'enabled_by',
        'enabled_at',
        'disabled_at',
        'plan_type',
        'monthly_message_quota',
        'credential_mode',
        'billing_note',
    ];

    protected function casts(): array
    {
        return [
            'is_enabled'  => 'boolean',
            'enabled_at'  => 'datetime',
            'disabled_at' => 'datetime',
        ];
    }

    public static function forOrganization(?int $organizationId): ?self
    {
        if ($organizationId === null) {
            return null;
        }

        return static::where('organization_id', $organizationId)->first();
    }

    public function isUsableForSend(): bool
    {
        return $this->is_enabled && $this->plan_type !== 'suspended';
    }

    public function hasQuotaRemaining(int $currentMonthCount): bool
    {
        if ($this->monthly_message_quota === null) {
            return true;
        }

        return $currentMonthCount < $this->monthly_message_quota;
    }

    /**
     * Per-tenant send rate limit — trial tenants get a much stricter cap than paid
     * ones. Shared by the `whatsapp-send` named RateLimiter (AppServiceProvider) and
     * App\Jobs\SendWhatsappBatch, which hits the same limiter manually per-iteration
     * since queued jobs bypass HTTP throttle middleware.
     */
    public static function sendLimitFor(?int $organizationId): Limit
    {
        $settings  = static::forOrganization($organizationId);
        $perMinute = $settings?->plan_type === 'paid' ? 30 : 5;

        return Limit::perMinute($perMinute);
    }

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }
}
