<?php

namespace App\Providers;

use App\Contracts\LeadGenerationInterface;
use App\Services\LeadGenerationService;
use App\Services\LeadProviders\ApolloProvider;
use App\Services\LeadProviders\PeopleDataLabsProvider;
use App\Support\TenantContext;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(TenantContext::class);
        $this->app->bind(LeadGenerationInterface::class, LeadGenerationService::class);

        // Individual provider bindings — resolved using the workspace's stored API key
        $this->app->bind('lead.provider.apollo', function () {
            $org     = app(TenantContext::class)->get() ?? auth()->user()?->organization;
            $apiKey  = decrypt(($org?->settings ?? [])['lead_generation_api_key'] ?? '');
            return new ApolloProvider($apiKey);
        });

        $this->app->bind('lead.provider.pdl', function () {
            $org     = app(TenantContext::class)->get() ?? auth()->user()?->organization;
            $apiKey  = decrypt(($org?->settings ?? [])['lead_generation_api_key'] ?? '');
            return new PeopleDataLabsProvider($apiKey);
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
    }
}
