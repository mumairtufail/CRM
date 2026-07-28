<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'google' => [
        'client_id'     => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect'      => env('GOOGLE_REDIRECT_URI'),
    ],

    'apollo' => [
        'key'      => env('LEAD_GENERATION_API_KEY'),
        'base_url' => 'https://api.apollo.io/api/v1',
    ],

    'nvidia' => [
        'base_url' => env('NVIDIA_BASE_URL', 'https://integrate.api.nvidia.com/v1'),
        'api_key'  => env('NVIDIA_API_KEY'),
        'model'    => env('NVIDIA_MODEL', 'moonshotai/kimi-k2'),
    ],

    // AI engine that turns a plain-English prompt into structured search
    // filters for the AI Lead Search page. OpenAI-compatible endpoint
    // (NVIDIA NIM / Kimi by default). When no key is set, the lead search
    // falls back to the built-in keyword parser automatically.
    'aileadsearch' => [
        'base_url' => env('AI_LEAD_SEARCH_BASE_URL', 'https://integrate.api.nvidia.com/v1'),
        'api_key'  => env('AI_LEAD_SEARCH_API_KEY'),
        'model'    => env('AI_LEAD_SEARCH_MODEL', 'moonshotai/kimi-k2.6'),
        'timeout'  => (int) env('AI_LEAD_SEARCH_TIMEOUT', 60),
    ],

    // Pricing/checkout. `environment` is never defaulted — code that reads it
    // must fail loudly if it's unset, so the app can never accidentally run
    // checkout against the wrong Paddle account. `api_key` is server-only and
    // must never be passed to an Inertia prop or otherwise reach the frontend.
    'paddle' => [
        'environment'      => env('PADDLE_ENVIRONMENT'),
        'client_token'     => env('PADDLE_CLIENT_KEY'),
        'api_key'          => env('PADDLE_API_KEY'),
        'webhook_secret'   => env('PADDLE_WEBHOOK_SECRET'),
        // Paddle checkout tiers (resources/js/lib/pricingTiers.js) use their own
        // naming (starter/pro/agency) — this maps each Paddle `plan_slug`
        // custom_data value to the existing Plan model's slug (basic/pro/premium)
        // that actually drives module gating, so a webhook-fulfilled subscription
        // grants the equivalent real plan rather than a plan that doesn't exist.
        'plan_map' => [
            'starter' => 'basic',
            'pro'     => 'pro',
            'agency'  => 'premium',
        ],
        // Authoritative price_id -> plan_slug lookup, keyed off the Paddle
        // product id (shared by both the monthly and yearly price of a tier).
        // Webhook fulfillment prefers this over custom_data.plan_slug, since
        // custom_data is only set at the original checkout and goes stale the
        // moment a subscription's price changes some other way (portal
        // self-service upgrade, admin-initiated change, etc.) — the current
        // price/product on the subscription is always the source of truth for
        // what the customer is actually paying for.
        'product_plan_map' => [
            'pro_01kyn9cx2wn5e82k9c23vf02xz' => 'starter',
            'pro_01kyn9cz3smmhfp6d7bys3rpw7' => 'pro',
            'pro_01kyn9d0rk14nv309dsx969e0k' => 'agency',
        ],
    ],

];
