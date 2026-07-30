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
        'starter' => ['dialer'],
        'pro'     => ['dialer', 'email_campaigns'],
        'premium' => ['dialer', 'email_campaigns', 'whatsapp_campaigns', 'whatsapp_automation'],
    ];

    public function run(): void
    {
        $plans = [
            [
                'name'                     => 'Free',
                'slug'                     => 'basic',
                'tagline'                  => 'Get started with core CRM tools, free forever.',
                'description'              => '<p>Everything you need to get organized:</p><ul><li>Up to 200 leads</li><li>AI lead search</li><li>CSV & Google Sheets import/export</li><li>Invoicing & projects</li></ul>',
                'price_monthly'            => 0,
                'price_monthly_original'   => null,
                'price_yearly'             => 0,
                'price_yearly_original'    => null,
                'lead_limit'               => 200,
                'user_limit'               => 20,
                'is_featured'              => false,
                'sort_order'               => 1,
                'cta_text'                 => 'Get started free',
                // No Paddle product — Free is never checked out through Paddle.
                // The old $19 product this slug used to link to has been
                // archived (never deleted, per the standing guardrail).
                'paddle_product_id'        => null,
                'paddle_price_id_monthly'  => null,
                'paddle_price_id_yearly'   => null,
            ],
            [
                'name'                     => 'Starter',
                'slug'                     => 'starter',
                'tagline'                  => 'Free plus the Dialer, for teams calling leads directly.',
                'description'              => '<p>Everything in Free, plus:</p><ul><li>Unlimited leads</li><li>Built-in Dialer</li></ul>',
                'price_monthly'            => 10,
                'price_monthly_original'   => null,
                'price_yearly'             => 100,
                'price_yearly_original'    => null,
                'lead_limit'               => null,
                'user_limit'               => null,
                'is_featured'              => false,
                'sort_order'               => 2,
                'cta_text'                 => 'Sign up free, then upgrade',
                'paddle_product_id'        => 'pro_01kyqag9mqzazdh1wmak0s6tet',
                'paddle_price_id_monthly'  => 'pri_01kyqag9zhahzhyz19nae7e68w',
                'paddle_price_id_yearly'   => 'pri_01kyqaga9zmrzsxt4hdxtnbbev',
            ],
            [
                'name'                     => 'Pro',
                'slug'                     => 'pro',
                'tagline'                  => 'Starter plus automated email campaigns to nurture leads at scale.',
                'description'              => '<p>Everything in Starter, plus:</p><ul><li>Automated email campaigns</li><li>Advanced reports</li></ul>',
                'price_monthly'            => 20,
                'price_monthly_original'   => null,
                'price_yearly'             => 200,
                'price_yearly_original'    => null,
                'lead_limit'               => null,
                'user_limit'               => null,
                'is_featured'              => true,
                'sort_order'               => 3,
                'cta_text'                 => 'Sign up free, then upgrade',
                'paddle_product_id'        => 'pro_01kyn9cz3smmhfp6d7bys3rpw7',
                'paddle_price_id_monthly'  => 'pri_01kyqagapxmtxsckrx5wcnbm7s',
                'paddle_price_id_yearly'   => 'pri_01kyqagb7p26pnyt66c7jmt3nq',
            ],
            [
                'name'                     => 'Premium',
                'slug'                     => 'premium',
                'tagline'                  => 'Everything in Pro, ready for WhatsApp the moment it launches.',
                'description'              => '<p>Everything in Pro, plus:</p><ul><li>WhatsApp Campaigns & Auto-Response Bot (coming soon)</li><li>Dedicated Support</li></ul>',
                'price_monthly'            => 25,
                'price_monthly_original'   => null,
                'price_yearly'             => 250,
                'price_yearly_original'    => null,
                'lead_limit'               => null,
                'user_limit'               => null,
                'is_featured'              => false,
                'sort_order'               => 4,
                'cta_text'                 => 'Sign up free, then upgrade',
                'paddle_product_id'        => 'pro_01kyn9d0rk14nv309dsx969e0k',
                'paddle_price_id_monthly'  => 'pri_01kyqagbjf6fqe7mf0rdanxf78',
                'paddle_price_id_yearly'   => 'pri_01kyqagbwy4yccjndypn2z152v',
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
