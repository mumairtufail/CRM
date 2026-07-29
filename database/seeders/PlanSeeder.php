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
        'pro'     => ['email_campaigns', 'dialer'],
        'premium' => ['email_campaigns', 'whatsapp_campaigns', 'whatsapp_automation', 'dialer'],
    ];

    public function run(): void
    {
        $plans = [
            [
                'name'                     => 'Basic',
                'slug'                     => 'basic',
                'tagline'                  => 'Everything you need to run your core CRM.',
                'description'              => '<p>Get access to basic lead and pipeline tracking features:</p><ul><li>Up to 500 leads</li><li>1 active sales pipeline</li><li>Basic client invoicing</li></ul>',
                'price_monthly'            => 19,
                'price_monthly_original'   => 26,
                'price_yearly'             => 190,
                'price_yearly_original'    => 260,
                'is_featured'              => false,
                'sort_order'               => 1,
                'cta_text'                 => 'Get started free',
                // Linked to the Paddle products/prices already created and
                // live-tested earlier — never recreate these, only ever link
                // or (on a future price change) mint a new Price under the
                // same Product.
                'paddle_product_id'        => 'pro_01kyn9cx2wn5e82k9c23vf02xz',
                'paddle_price_id_monthly'  => 'pri_01kyn9cxkb91f15nsm0y4e0rkq',
                'paddle_price_id_yearly'   => 'pri_01kyn9cyh49t1wh335g2gjxn9s',
            ],
            [
                'name'                     => 'Pro',
                'slug'                     => 'pro',
                'tagline'                  => 'Core CRM plus email campaigns to nurture leads at scale.',
                'description'              => '<p>Perfect for growing sales teams needing campaign tools:</p><ul><li>Everything in Basic</li><li>Unlimited leads & pipelines</li><li>Automated email campaigns</li><li>Advanced reports</li></ul>',
                'price_monthly'            => 49,
                'price_monthly_original'   => 61,
                'price_yearly'             => 490,
                'price_yearly_original'    => 610,
                'is_featured'              => true,
                'sort_order'               => 2,
                'cta_text'                 => 'Sign up free, then upgrade',
                'paddle_product_id'        => 'pro_01kyn9cz3smmhfp6d7bys3rpw7',
                'paddle_price_id_monthly'  => 'pri_01kyn9czn8jjyncrk9jazajyv4',
                'paddle_price_id_yearly'   => 'pri_01kyn9d06at8m7j6kpdsa9b4rs',
            ],
            [
                'name'                     => 'Premium',
                'slug'                     => 'premium',
                'tagline'                  => 'Everything in Pro, plus WhatsApp campaigns and an automated bot.',
                'description'              => '<p>Fully automated communication suites for large organizations:</p><ul><li>Everything in Pro</li><li>Official WhatsApp Campaigns</li><li>Interactive WhatsApp Auto-Response Bot</li><li>Priority Support</li></ul>',
                'price_monthly'            => 99,
                'price_monthly_original'   => 132,
                'price_yearly'             => 990,
                'price_yearly_original'    => 1320,
                'is_featured'              => false,
                'sort_order'               => 3,
                'cta_text'                 => 'Sign up free, then upgrade',
                'paddle_product_id'        => 'pro_01kyn9d0rk14nv309dsx969e0k',
                'paddle_price_id_monthly'  => 'pri_01kyn9d18q849sdykaq6s70tmj',
                'paddle_price_id_yearly'   => 'pri_01kyn9d1t7yasxf5n9cs9bykkv',
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
