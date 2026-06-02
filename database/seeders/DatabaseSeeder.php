<?php

namespace Database\Seeders;

use App\Models\Organization;
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

        // Platform super admin — no organization, full cross-tenant portal access.
        User::create([
            'organization_id' => null,
            'role'            => 'superadmin',
            'is_superadmin'   => true,
            'name'            => 'Super Admin',
            'email'           => 'hello@lumenialab.com',
            'password'        => Hash::make('password'),
        ]);

        // Demo organization + owner.
        $organization = Organization::create([
            'name' => 'Demo Workspace',
            'slug' => 'demo',
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

        $tagData = [
            ['name' => 'Hot Lead',   'color' => '#ef4444'],
            ['name' => 'Cold',       'color' => '#64748b'],
            ['name' => 'Follow Up',  'color' => '#f59e0b'],
            ['name' => 'VIP',        'color' => '#8b5cf6'],
            ['name' => 'Agency',     'color' => '#3b82f6'],
            ['name' => 'Startup',    'color' => '#10b981'],
            ['name' => 'Enterprise', 'color' => '#6366f1'],
            ['name' => 'Pakistan',   'color' => '#14b8a6'],
            ['name' => 'UAE',        'color' => '#ec4899'],
            ['name' => 'US',         'color' => '#0ea5e9'],
        ];

        foreach ($tagData as $tag) {
            Tag::create($tag);
        }
    }
}
