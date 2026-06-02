<?php

namespace App\Models\Concerns;

use App\Models\Organization;
use App\Support\TenantContext;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Applied to every tenant-owned model. Registers a global scope that filters
 * every query by the currently active organization, and auto-stamps
 * organization_id on create. When $tenantIncludesGlobal is true, rows with a
 * null organization_id (shared "system" rows) remain visible to every tenant.
 */
trait BelongsToTenant
{
    public static function bootBelongsToTenant(): void
    {
        static::addGlobalScope('tenant', function (Builder $builder) {
            $tenant = app(TenantContext::class);

            if (! $tenant->check()) {
                return;
            }

            $model = $builder->getModel();
            $column = $model->getQualifiedOrganizationIdColumn();

            if ($model->tenantIncludesGlobal()) {
                $builder->where(function (Builder $q) use ($column, $tenant) {
                    $q->where($column, $tenant->id())
                      ->orWhereNull($column);
                });
            } else {
                $builder->where($column, $tenant->id());
            }
        });

        static::creating(function ($model) {
            if ($model->getAttribute('organization_id') === null) {
                $tenant = app(TenantContext::class);
                if ($tenant->check()) {
                    $model->setAttribute('organization_id', $tenant->id());
                }
            }
        });
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function getQualifiedOrganizationIdColumn(): string
    {
        return $this->qualifyColumn('organization_id');
    }

    public function tenantIncludesGlobal(): bool
    {
        return property_exists($this, 'tenantIncludesGlobal') && $this->tenantIncludesGlobal === true;
    }
}
