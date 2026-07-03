<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\Organization;
use App\Models\Plan;
use App\Models\Tag;
use App\Models\User;
use App\Support\TenantContext;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // System (shared) email templates — no tenant context, organization_id stays null.
        $this->call(EmailTemplateSeeder::class);

        // Permission catalog — must run before any Organization is created, since
        // creating an Organization auto-seeds a default "Agent" role from it.
        $this->call(PermissionSeeder::class);

        // Subscription plan catalog — must run before any Organization is created
        // so we can assign a default plan below.
        $this->call(ModuleSeeder::class);
        $this->call(PlanSeeder::class);

        // Platform super admin — separate `admins` table/guard, full cross-tenant portal access.
        Admin::create([
            'name'     => 'Super Admin',
            'email'    => 'hello@lumenialab.com',
            'password' => Hash::make('password'),
        ]);

        // Demo organization + owner — on the Basic plan, same default a real signup gets.
        $basicPlan = Plan::where('slug', 'basic')->first();

        $organization = Organization::create([
            'name'             => 'Demo Workspace',
            'slug'             => 'demo',
            'plan_id'          => $basicPlan?->id,
            'plan_status'      => 'active',
            'plan_assigned_at' => now(),
        ]);

        $admin = User::create([
            'organization_id' => $organization->id,
            'role'            => 'owner',
            'name'            => 'Admin',
            'email'           => 'mumairtufail786@gmail.com',
            'password'        => Hash::make('password'),
        ]);

        $organization->update(['owner_id' => $admin->id]);

        // Scope the rest of the seed (tags, etc.) to the demo organization.
        app(TenantContext::class)->set($organization);

        Tag::seedDefaults($organization->id);
    }
}
