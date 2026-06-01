<?php

namespace Database\Seeders;

use App\Models\Tag;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::factory()->create([
            'name'     => 'Admin',
            'email'    => 'mumairtufail786@gmail.com',
            'password' => bcrypt('password'),
        ]);

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
