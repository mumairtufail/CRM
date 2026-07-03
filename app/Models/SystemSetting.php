<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class SystemSetting extends Model
{
    protected $fillable = ['key', 'value'];

    // ── Read helpers ──────────────────────────────────────────────────────────

    public static function get(string $key, mixed $default = null): mixed
    {
        $value = static::where('key', $key)->value('value');
        return $value !== null ? $value : $default;
    }

    public static function getCached(string $key, mixed $default = null): mixed
    {
        return Cache::remember("system_setting:{$key}", 3600, fn () => static::get($key));
    }

    // ── Write helpers ─────────────────────────────────────────────────────────

    public static function set(string $key, mixed $value): void
    {
        static::updateOrCreate(['key' => $key], ['value' => $value]);
        Cache::forget("system_setting:{$key}");
    }

    // ── SMTP helpers ──────────────────────────────────────────────────────────

    public static function getSmtp(): array
    {
        return [
            'host'       => static::getCached('smtp_host'),
            'port'       => static::getCached('smtp_port'),
            'encryption' => static::getCached('smtp_encryption'),
            'username'   => static::getCached('smtp_username'),
            'password'   => static::getCached('smtp_password'),
            'from_name'  => static::getCached('smtp_from_name'),
            'from_email' => static::getCached('smtp_from_email'),
        ];
    }

    public static function isSmtpConfigured(): bool
    {
        return !empty(static::getCached('smtp_host')) && !empty(static::getCached('smtp_username'));
    }

    public static function saveSmtp(array $data): void
    {
        $fields = ['host', 'port', 'encryption', 'username', 'password', 'from_name', 'from_email'];
        foreach ($fields as $field) {
            if (array_key_exists($field, $data)) {
                static::set("smtp_{$field}", $data[$field]);
            }
        }
    }

    public static function clearSmtpCache(): void
    {
        $fields = ['host', 'port', 'encryption', 'username', 'password', 'from_name', 'from_email'];
        foreach ($fields as $field) {
            Cache::forget("system_setting:smtp_{$field}");
        }
    }

    // ── Admin AI helpers ──────────────────────────────────────────────────────

    public static function getAdminAi(): array
    {
        $apiKey = static::getCached('admin_ai_api_key');
        if (!empty($apiKey)) {
            try {
                $apiKey = decrypt($apiKey);
            } catch (\Throwable) {
                $apiKey = '';
            }
        }

        return [
            'provider'     => static::getCached('admin_ai_provider'),
            'api_key'      => $apiKey,
            'model'        => static::getCached('admin_ai_model'),
            'base_url'     => static::getCached('admin_ai_base_url'),
            'is_active'    => (bool) static::getCached('admin_ai_is_active', false),
            'validated_at' => static::getCached('admin_ai_validated_at'),
        ];
    }

    public static function saveAdminAi(array $data): void
    {
        $fields = ['provider', 'api_key', 'model', 'base_url', 'is_active', 'validated_at'];
        foreach ($fields as $field) {
            if (array_key_exists($field, $data)) {
                $val = $data[$field];
                if ($field === 'is_active') {
                    $val = $val ? '1' : '0';
                }
                if ($field === 'api_key' && !empty($val)) {
                    $val = encrypt($val);
                }
                static::set("admin_ai_{$field}", $val);
            }
        }
    }

    public static function clearAdminAiCache(): void
    {
        $fields = ['provider', 'api_key', 'model', 'base_url', 'is_active', 'validated_at'];
        foreach ($fields as $field) {
            Cache::forget("system_setting:admin_ai_{$field}");
        }
    }

    // ── SEO helpers ───────────────────────────────────────────────────────────

    public static function getSeo(): array
    {
        return [
            'meta_title'       => static::getCached('seo_meta_title'),
            'meta_description' => static::getCached('seo_meta_description'),
            'meta_keywords'    => static::getCached('seo_meta_keywords'),
            'robots_txt'       => static::getCached('seo_robots_txt', "User-agent: *\nDisallow:"),
        ];
    }

    public static function saveSeo(array $data): void
    {
        $fields = ['meta_title', 'meta_description', 'meta_keywords', 'robots_txt'];
        foreach ($fields as $field) {
            if (array_key_exists($field, $data)) {
                static::set("seo_{$field}", $data[$field]);
            }
        }
    }

    public static function clearSeoCache(): void
    {
        $fields = ['meta_title', 'meta_description', 'meta_keywords', 'robots_txt'];
        foreach ($fields as $field) {
            Cache::forget("system_setting:seo_{$field}");
        }
    }
}
