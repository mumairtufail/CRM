<?php

namespace App\Http\Controllers\Auth\Concerns;

use App\Models\Organization;
use App\Models\Plan;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Shared by the password-registration and Google-signup flows: both need to
 * create a brand-new Organization plus its owner User the same way.
 */
trait CreatesOrganizationWithOwner
{
    /**
     * Create a new organization and its owner user in a single transaction.
     *
     * @param  array<string, mixed>  $ownerAttributes  Attributes for the owner User
     *                                                  (organization_id and role are set here).
     */
    protected function createOrganizationWithOwner(string $workspaceName, ?string $slug, array $ownerAttributes): User
    {
        $slug ??= $this->uniqueSlug($workspaceName);

        return DB::transaction(function () use ($workspaceName, $slug, $ownerAttributes) {
            $basicPlan = Plan::where('slug', 'basic')->first()
                ?? Plan::where('is_active', true)->orderBy('sort_order')->first()
                ?? Plan::first();

            $organization = Organization::create([
                'name'             => $workspaceName,
                'slug'             => $slug,
                'plan_id'          => $basicPlan?->id,
                'plan_status'      => 'active',
                'plan_assigned_at' => now(),
            ]);

            $user = User::create($ownerAttributes + [
                'organization_id' => $organization->id,
                'role'            => 'owner',
            ]);

            $organization->update(['owner_id' => $user->id]);

            Tag::seedDefaults($organization->id);

            return $user;
        });
    }

    /**
     * Build a unique slug from the workspace name.
     */
    protected function uniqueSlug(string $name): string
    {
        $base = Str::slug($name) ?: 'workspace';
        $slug = $base;
        $i = 1;

        while (Organization::where('slug', $slug)->exists()) {
            $slug = $base.'-'.(++$i);
        }

        return $slug;
    }
}
