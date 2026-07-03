<?php

namespace Database\Seeders;

use App\Models\Module;
use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    /** Modules each tier unlocks, on top of the always-included core CRM. */
    public const TIER_MODULES = [
        'basic'   => [],
        'pro'     => ['email_campaigns'],
        'premium' => ['email_campaigns', 'whatsapp_campaigns', 'whatsapp_automation'],
    ];

    public function run(): void
    {
        $plans = [
            [
                'name'          => 'Basic',
                'slug'          => 'basic',
                'tagline'       => 'Everything you need to run your core CRM.',
                'price_monthly' => 29,
                'price_yearly'  => 290,
                'is_featured'   => false,
                'sort_order'    => 1,
                'cta_text'      => 'Get started free',
            ],
            [
                'name'          => 'Pro',
                'slug'          => 'pro',
                'tagline'       => 'Core CRM plus email campaigns to nurture leads at scale.',
                'price_monthly' => 79,
                'price_yearly'  => 790,
                'is_featured'   => true,
                'sort_order'    => 2,
                'cta_text'      => 'Sign up free, then upgrade',
            ],
            [
                'name'          => 'Premium',
                'slug'          => 'premium',
                'tagline'       => 'Everything in Pro, plus WhatsApp campaigns and an automated bot.',
                'price_monthly' => 149,
                'price_yearly'  => 1490,
                'is_featured'   => false,
                'sort_order'    => 3,
                'cta_text'      => 'Sign up free, then upgrade',
            ],
        ];

        foreach ($plans as $data) {
            $slug = $data['slug'];
            $plan = Plan::updateOrCreate(['slug' => $slug], $data);

            $moduleIds = Module::whereIn('key', self::TIER_MODULES[$slug])->pluck('id');
            $plan->modules()->sync($moduleIds);
        }
    }
}
