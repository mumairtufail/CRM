<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class PlatformWhatsappCredential extends Model
{
    protected $fillable = [
        'meta_app_id',
        'meta_business_account_id',
        'phone_number_id',
        'display_phone_number',
        'access_token',
        'meta_app_secret',
        'token_expires_at',
        'webhook_verify_token',
        'status',
        'last_verified_at',
        'created_by',
    ];

    protected $hidden = ['access_token', 'meta_app_secret', 'webhook_verify_token'];

    protected function casts(): array
    {
        return [
            'access_token'         => 'encrypted',
            'meta_app_secret'      => 'encrypted',
            'webhook_verify_token' => 'encrypted',
            'token_expires_at'     => 'datetime',
            'last_verified_at'     => 'datetime',
        ];
    }

    public static function active(): ?self
    {
        return Cache::remember('platform_whatsapp_credential:active', 60, function () {
            return static::where('status', 'active')->latest()->first();
        });
    }

    public static function forgetActiveCache(): void
    {
        Cache::forget('platform_whatsapp_credential:active');
    }
}
