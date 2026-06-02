<?php

namespace App\Support;

use App\Models\Organization;

/**
 * Holds the "current" organization for the duration of a request (or a seeder run).
 * Bound as a singleton in the container so the ResolveTenant middleware and the
 * BelongsToTenant trait share one source of truth.
 */
class TenantContext
{
    protected ?Organization $organization = null;

    public function set(?Organization $organization): void
    {
        $this->organization = $organization;
    }

    public function get(): ?Organization
    {
        return $this->organization;
    }

    public function id(): ?int
    {
        return $this->organization?->id;
    }

    public function check(): bool
    {
        return $this->organization !== null;
    }

    public function forget(): void
    {
        $this->organization = null;
    }
}
