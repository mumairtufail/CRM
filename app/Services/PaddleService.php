<?php

namespace App\Services;

use Paddle\SDK\Client;
use Paddle\SDK\Environment;
use Paddle\SDK\Options;

class PaddleService
{
    /**
     * Builds an authenticated Paddle API client for the configured environment.
     * Never silently defaults — an unset/invalid PADDLE_ENVIRONMENT fails loudly
     * rather than risking a call landing on the wrong (sandbox vs. live) account.
     */
    public static function client(): Client
    {
        $apiKey = config('services.paddle.api_key');
        $environment = config('services.paddle.environment');

        if (!$apiKey) {
            throw new \RuntimeException('PADDLE_API_KEY is not set.');
        }
        if (!in_array($environment, ['sandbox', 'production'], true)) {
            throw new \RuntimeException('PADDLE_ENVIRONMENT must be set to "sandbox" or "production".');
        }

        return new Client(
            apiKey: $apiKey,
            options: new Options($environment === 'sandbox' ? Environment::SANDBOX : Environment::PRODUCTION),
        );
    }
}
