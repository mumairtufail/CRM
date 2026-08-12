<?php

namespace Database\Seeders;

use App\Models\Module;
use App\Models\Plan;
use App\Services\PlanPaddleSync;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    // NOTE: a price_monthly/price_yearly change here DOES sync to Paddle —
    // run() diffs each plan's old DB price against $data below and calls
    // PlanPaddleSync::sync(), the same routine Admin\PlanController uses, so
    // re-running this seeder after a price edit is a safe way to both update
    // the DB and re-mint the matching Paddle price. The paddle_product_id /
    // paddle_price_id_* fields below are NOT part of that sync, though —
    // they're bootstrap values used only the first time a plan row is ever
    // created; once a plan exists, its live Paddle linkage is left alone
    // here and owned entirely by PlanPaddleSync (see run()).

    /** Modules each tier unlocks, on top of the always-included core CRM. */
    public const TIER_MODULES = [
        'basic'   => [],
        'starter' => ['dialer', 'inbox'],
        'pro'     => ['email_campaigns', 'inbox'],
        'premium' => ['dialer', 'email_campaigns', 'inbox', 'whatsapp_campaigns', 'whatsapp_automation'],
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
                // slug stays 'starter' (DB identifier, never renamed — see the
                // 'basic'->Free precedent) but this tier is now positioned and
                // sold as "Caller": Dialer and a connected Inbox, no Email Campaigns.
                'name'                     => 'Caller',
                'slug'                     => 'starter',
                'tagline'                  => 'Free plus the Dialer and a connected Inbox, for teams that live on the phone.',
                'description'              => '<p>Everything in Free, plus:</p><ul><li>Unlimited leads</li><li>Built-in Dialer — click-to-call, recordings, SMS</li><li>Connected Inbox (IMAP)</li></ul>',
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
                'paddle_price_id_monthly'  => 'pri_01kyvdpxj7905znnvc8mk84tmr',
                'paddle_price_id_yearly'   => 'pri_01kyvdq089a9n3fdnp0q8wt4be',
            ],
            [
                // slug stays 'pro'; sold as "Outreach": Email Campaigns + Inbox,
                // no Dialer.
                'name'                     => 'Outreach',
                'slug'                     => 'pro',
                'tagline'                  => 'Free plus Email Campaigns and a connected Inbox, for structured outreach.',
                'description'              => '<p>Everything in Free, plus:</p><ul><li>Unlimited leads</li><li>Automated email campaigns with AI-generated follow-ups</li><li>Connected Inbox (IMAP)</li></ul>',
                'price_monthly'            => 10,
                'price_monthly_original'   => null,
                'price_yearly'             => 100,
                'price_yearly_original'    => null,
                'lead_limit'               => null,
                'user_limit'               => null,
                'is_featured'              => false,
                'sort_order'               => 3,
                'cta_text'                 => 'Sign up free, then upgrade',
                'paddle_product_id'        => 'pro_01kyn9cz3smmhfp6d7bys3rpw7',
                'paddle_price_id_monthly'  => 'pri_01kyqagapxmtxsckrx5wcnbm7s',
                'paddle_price_id_yearly'   => 'pri_01kyqagb7p26pnyt66c7jmt3nq',
            ],
            [
                // slug stays 'premium'; sold as "Max": everything — Dialer,
                // Email Campaigns, Inbox — plus first access to WhatsApp once it
                // publicly launches.
                'name'                     => 'Max',
                'slug'                     => 'premium',
                'tagline'                  => 'Dialer, Email Campaigns, and Inbox together — plus WhatsApp the moment it launches.',
                'description'              => '<p>Everything Lumenia CRM offers:</p><ul><li>Unlimited leads</li><li>Built-in Dialer</li><li>Email campaigns with AI-generated follow-ups</li><li>Connected Inbox (IMAP)</li><li>WhatsApp Campaigns & Auto-Response Bot (coming soon)</li></ul>',
                'price_monthly'            => 20,
                'price_monthly_original'   => null,
                'price_yearly'             => 200,
                'price_yearly_original'    => null,
                'lead_limit'               => null,
                'user_limit'               => null,
                'is_featured'              => true,
                'sort_order'               => 4,
                'cta_text'                 => 'Sign up free, then upgrade',
                'paddle_product_id'        => 'pro_01kyn9d0rk14nv309dsx969e0k',
                'paddle_price_id_monthly'  => 'pri_01kyvdq0hand28tmmv73rvekva',
                'paddle_price_id_yearly'   => 'pri_01kyvdq0trhwz6pj4c1vpsbx32',
            ],
        ];

        foreach ($plans as $data) {
            $slug = $data['slug'];

            // The paddle_* fields above are bootstrap values for a brand-new
            // install only — once a plan row exists, its paddle_product_id /
            // paddle_price_id_* are live state owned by PlanPaddleSync (the
            // only thing that talks to the Paddle API), never by this seeder.
            // Letting updateOrCreate() below write these hardcoded, eventually
            // stale IDs back over a plan that already has real ones is exactly
            // what silently undid a live Paddle fix once already.
            $paddleBootstrap = [
                'paddle_product_id'       => $data['paddle_product_id'],
                'paddle_price_id_monthly' => $data['paddle_price_id_monthly'],
                'paddle_price_id_yearly'  => $data['paddle_price_id_yearly'],
            ];
            unset($data['paddle_product_id'], $data['paddle_price_id_monthly'], $data['paddle_price_id_yearly']);

            $existing = Plan::where('slug', $slug)->first();

            // Captured before the write so PlanPaddleSync can tell whether
            // the price actually changed — same before/after pattern
            // Admin\PlanController::update() uses.
            $oldMonthly = $existing?->price_monthly === null ? null : (float) $existing->price_monthly;
            $oldYearly  = $existing?->price_yearly === null ? null : (float) $existing->price_yearly;

            $plan = $existing
                ? tap($existing)->update($data)
                : Plan::create([...$data, ...$paddleBootstrap]);

            $moduleIds = Module::whereIn('key', self::TIER_MODULES[$slug])->pluck('id');
            $plan->modules()->sync($moduleIds);

            PlanPaddleSync::sync($plan, $oldMonthly, $oldYearly);
        }
    }
}
