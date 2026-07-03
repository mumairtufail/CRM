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
                'name'                   => 'Basic',
                'slug'                   => 'basic',
                'tagline'                => 'Everything you need to run your core CRM.',
                'description'            => '<p>Get access to basic lead and pipeline tracking features:</p><ul><li>Up to 500 leads</li><li>1 active sales pipeline</li><li>Basic client invoicing</li></ul>',
                'price_monthly'          => 29,
                'price_monthly_original' => 39,
                'price_yearly'           => 290,
                'price_yearly_original'  => 390,
                'is_featured'            => false,
                'sort_order'             => 1,
                'cta_text'               => 'Get started free',
            ],
            [
                'name'                   => 'Pro',
                'slug'                   => 'pro',
                'tagline'                => 'Core CRM plus email campaigns to nurture leads at scale.',
                'description'            => '<p>Perfect for growing sales teams needing campaign tools:</p><ul><li>Everything in Basic</li><li>Unlimited leads & pipelines</li><li>Automated email campaigns</li><li>Advanced reports</li></ul>',
                'price_monthly'          => 79,
                'price_monthly_original' => 99,
                'price_yearly'           => 790,
                'price_yearly_original'  => 990,
                'is_featured'            => true,
                'sort_order'             => 2,
                'cta_text'               => 'Sign up free, then upgrade',
            ],
            [
                'name'                   => 'Premium',
                'slug'                   => 'premium',
                'tagline'                => 'Everything in Pro, plus WhatsApp campaigns and an automated bot.',
                'description'            => '<p>Fully automated communication suites for large organizations:</p><ul><li>Everything in Pro</li><li>Official WhatsApp Campaigns</li><li>Interactive WhatsApp Auto-Response Bot</li><li>Priority Support</li></ul>',
                'price_monthly'          => 149,
                'price_monthly_original' => 199,
                'price_yearly'           => 1490,
                'price_yearly_original'  => 1990,
                'is_featured'            => false,
                'sort_order'             => 3,
                'cta_text'               => 'Sign up free, then upgrade',
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
