<?php

namespace App\Providers;

use App\Contracts\LeadGenerationInterface;
use App\Models\Lead;
use App\Models\LeadGroup;
use App\Models\TenantWhatsappSettings;
use App\Observers\LeadGroupObserver;
use App\Observers\LeadObserver;
use App\Models\SystemSetting;
use App\Services\LeadGenerationService;
use App\Services\LeadProviders\ApolloProvider;
use App\Services\LeadProviders\PeopleDataLabsProvider;
use App\Support\TenantContext;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;

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

        Lead::observe(LeadObserver::class);
        LeadGroup::observe(LeadGroupObserver::class);

        $this->applySystemSmtpConfig();
        $this->registerWhatsappRateLimiter();

        VerifyEmail::toMailUsing(function (object $notifiable, string $url) {
            return (new MailMessage)
                ->subject('Verify Email Address - LumeniaCRM')
                ->view('emails.verify-email', ['url' => $url, 'user' => $notifiable]);
        });
    }

    /**
     * Per-tenant WhatsApp send limiter — trial tenants get a much stricter cap than
     * paid ones, and campaign batches (App\Jobs\SendWhatsappBatch) hit this same named
     * limiter manually per-iteration so campaigns and live conversation sends share one
     * per-organization ceiling instead of each having their own budget.
     */
    private function registerWhatsappRateLimiter(): void
    {
        RateLimiter::for('whatsapp-send', function (Request $request) {
            $orgId = $request->user()?->organization_id;

            return TenantWhatsappSettings::sendLimitFor($orgId)->by("whatsapp-send:{$orgId}");
        });
    }

    private function applySystemSmtpConfig(): void
    {
        // Guard: skip if the table doesn't exist yet (before migrations run)
        try {
            if (!Schema::hasTable('system_settings')) {
                return;
            }

            $smtp = SystemSetting::getSmtp();

            if (empty($smtp['host']) || empty($smtp['username'])) {
                return;
            }

            Config::set('mail.mailers.smtp.host',       $smtp['host']);
            Config::set('mail.mailers.smtp.port',       (int) ($smtp['port'] ?? 587));
            Config::set('mail.mailers.smtp.encryption', $smtp['encryption'] === 'none' ? null : $smtp['encryption']);
            Config::set('mail.mailers.smtp.username',   $smtp['username']);
            Config::set('mail.mailers.smtp.password',   $smtp['password'] ?? '');
            Config::set('mail.from.address',            $smtp['from_email'] ?? config('mail.from.address'));
            Config::set('mail.from.name',               $smtp['from_name']  ?? config('mail.from.name'));
            Config::set('mail.default', 'smtp');
        } catch (\Throwable) {
            // Never block the app if settings table is unavailable
        }
    }
}
