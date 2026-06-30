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

];
