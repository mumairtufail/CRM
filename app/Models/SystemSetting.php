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
}
