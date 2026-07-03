<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Cache;

#[ObservedBy(\App\Observers\RoleObserver::class)]
class Role extends Model
{
    use BelongsToTenant;

    protected $fillable = ['organization_id', 'name', 'is_default'];

    protected $casts = ['is_default' => 'boolean'];

    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'role_permission');
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Permission keys granted by a role, cached (this app's cache store is
     * `database`, so invalidation is explicit `Cache::forget()` rather than tags —
     * see RoleObserver and RoleController::update()).
     *
     * @return array<int, string>
     */
    public static function cachedPermissionKeys(int $roleId): array
    {
        return Cache::remember(
            "role_permissions:{$roleId}",
            3600,
            fn () => static::find($roleId)?->permissions()->pluck('key')->all() ?? []
        );
    }

    public static function forgetPermissionCache(int $roleId): void
    {
        Cache::forget("role_permissions:{$roleId}");
    }
}
