<?php

use App\Http\Controllers\Admin\ContactMessageController as AdminContactMessageController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\OrganizationController as AdminOrganizationController;
use App\Http\Controllers\Admin\PlanController as AdminPlanController;
use App\Http\Controllers\Admin\AccountController as AdminAccountController;
use App\Http\Controllers\Admin\SmtpSettingsController as AdminSmtpSettingsController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\WhatsappSettingsController as AdminWhatsappSettingsController;
use App\Http\Controllers\Admin\WhatsappTenantAccessController as AdminWhatsappTenantAccessController;
use App\Http\Controllers\Admin\WhatsappUnassignedInboundController as AdminWhatsappUnassignedInboundController;
use App\Http\Controllers\Admin\SupportCaseController as AdminSupportCaseController;
use App\Http\Controllers\Admin\BlogController as AdminBlogController;
use App\Http\Controllers\Auth\AdminAuthenticatedSessionController;
use App\Http\Controllers\SupportCaseController;
use App\Http\Controllers\AiProviderController;
use App\Http\Controllers\Tenant\TwilioController;
use App\Http\Controllers\AiEmailComposerController;
use App\Http\Controllers\CampaignController;
use App\Http\Controllers\MetaWebhookController;
use App\Http\Controllers\WhatsappCampaignController;
use App\Http\Controllers\WhatsappConversationController;
use App\Http\Controllers\WhatsappStatusController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ProjectTaskController;
use App\Http\Controllers\ProjectDocumentController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\ClientDocumentController;
use App\Http\Controllers\LeadGenerationController;
use App\Http\Controllers\LeadGroupController;
use App\Http\Controllers\InboxController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ImpersonationController;
use App\Http\Controllers\EmailTemplateController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\LeadController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PipelineController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\FormController;
use App\Http\Controllers\PublicFormController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\ErrorReportController;
use App\Http\Controllers\TeamMemberController;
use App\Http\Controllers\SmtpCredentialController;
use App\Http\Controllers\OrganizationSettingsController;
use App\Http\Controllers\ContactMessageController;
use App\Http\Controllers\TagController;
use Illuminate\Support\Facades\Route;

// Landing page — default public route
Route::get('/', function (\Illuminate\Http\Request $request) {
    $chatbot = \App\Models\SystemSetting::getChatbot();

    // Never silently default the Paddle environment — a misconfigured/missing
    // value must fail loudly rather than quietly falling back to sandbox or
    // production, since that risk is exactly what real money moving through
    // the wrong Paddle account looks like.
    $paddleEnvironment = config('services.paddle.environment');
    abort_unless(
        in_array($paddleEnvironment, ['sandbox', 'production'], true),
        500,
        'PADDLE_ENVIRONMENT must be set to "sandbox" or "production".'
    );

    return inertia('Welcome', [
        'appUrl' => preg_replace('#^https?://#', '', rtrim(config('app.url'), '/')),
        'chatbot' => [
            'enabled'         => $chatbot['enabled'],
            'agent_name'      => $chatbot['agent_name'],
            'welcome_message' => $chatbot['welcome_message'],
        ],
        // Client-side token only — PADDLE_API_KEY (server-only) never reaches this.
        'paddle' => [
            'environment' => $paddleEnvironment,
            'clientToken' => config('services.paddle.client_token'),
        ],
        // Best-effort from a reverse-proxy/CDN header; null when absent, on
        // purpose — Paddle.PricePreview() auto-detects from IP when no
        // country is passed, and we must never invent one.
        'country' => \App\Support\GeoCountry::fromRequest($request),
        // DB-driven — admin-editable via /admin/plans, synced to real Paddle
        // products/prices there. See Plan::paddleTiers().
        'tiers' => \App\Models\Plan::paddleTiers(),
    ]);
})->name('home');

// Public Blog routes (SEO optimized)
Route::get('/blog',              [\App\Http\Controllers\BlogController::class, 'index'])->name('blog.index');
Route::get('/blog/{slug}',       [\App\Http\Controllers\BlogController::class, 'show'])->name('blog.show');
Route::get('/sitemap.xml',       [\App\Http\Controllers\SitemapController::class, 'index'])->name('sitemap');

// Products, changelog, and legal pages (static Inertia pages)
Route::get('/products', function () {
    return inertia('Products', [
        'plans' => \App\Models\Plan::where('is_active', true)
            ->with('modules:id,key,name')
            ->orderBy('sort_order')
            ->get(['id', 'name', 'tagline', 'price_monthly', 'is_featured', 'cta_text']),
    ]);
})->name('products');
Route::get('/changelog',              fn () => inertia('Changelog'))->name('changelog');
Route::get('/privacy-policy',         fn () => inertia('Legal/PrivacyPolicy'))->name('legal.privacy');
Route::get('/terms-and-conditions',   fn () => inertia('Legal/TermsAndConditions'))->name('legal.terms');
Route::get('/refund-policy',          fn () => inertia('Legal/RefundPolicy'))->name('legal.refund');
Route::get('/shipping-policy',        fn () => inertia('Legal/ShippingPolicy'))->name('legal.shipping');

// Public contact form submission (no auth required)
Route::post('/contact', [ContactMessageController::class, 'store'])->name('contact.store');

// Public landing-page chatbot (no auth required, throttled per IP)
Route::post('/chatbot/message', [\App\Http\Controllers\ChatbotController::class, 'message'])
    ->middleware('throttle:20,1')->name('chatbot.message');

// Public lead capture forms (no auth required) — looked up by the form's own slug.
Route::get('/f/{form:slug}',  [PublicFormController::class, 'show'])->name('forms.public.show');
Route::post('/f/{form:slug}', [PublicFormController::class, 'store'])->name('forms.public.store');
Route::post('/f/{form:slug}/autosave', [PublicFormController::class, 'autosave'])->name('forms.public.autosave');

// Email tracking — public, no auth (must be outside auth middleware)
Route::get('/t/{token}/open.gif', [CampaignController::class, 'trackOpen'])->name('track.open');
Route::get('/t/{token}/click',    [CampaignController::class, 'trackClick'])->name('track.click');

// Meta WhatsApp Cloud API webhook — public, validated by X-Hub-Signature-256
Route::prefix('webhook/meta')->group(function () {
    Route::get('/whatsapp',  [MetaWebhookController::class, 'verify'])->name('meta.whatsapp.verify');
    Route::post('/whatsapp', [MetaWebhookController::class, 'handle'])->middleware('throttle:60,1')->name('meta.whatsapp.handle');
});

// Super admin portal — authenticated on its own `admin` guard, separate from tenant users.
Route::middleware('guest:admin')->prefix('admin')->name('admin.')->group(function () {
    Route::get('/login',  [AdminAuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [AdminAuthenticatedSessionController::class, 'store'])->name('login.store');
});

Route::post('/admin/logout', [AdminAuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth:admin')->name('admin.logout');

Route::middleware(['auth:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/',                              [AdminDashboardController::class, 'index'])->name('dashboard');
    Route::get('/users',                         [AdminUserController::class, 'index'])->name('users.index');
    Route::post('/users/{user}/impersonate',     [AdminUserController::class, 'impersonate'])->name('users.impersonate');
    Route::get('/activity-log',                  [\App\Http\Controllers\Admin\ActivityLogController::class, 'index'])->name('activity-log.index');
    Route::get('/error-log',                     [\App\Http\Controllers\Admin\ErrorLogController::class, 'index'])->name('error-log.index');
    Route::get('/organizations',                 [AdminOrganizationController::class, 'index'])->name('organizations.index');
    Route::patch('/organizations/{organization:id}/plan', [AdminOrganizationController::class, 'updatePlan'])->name('organizations.plan.update');
    Route::delete('/organizations/{organization:id}', [AdminOrganizationController::class, 'destroy'])->name('organizations.destroy');
    Route::post('/organizations/bulk-delete', [AdminOrganizationController::class, 'bulkDestroy'])->name('organizations.bulk-destroy');

    // Subscription plans
    Route::get('/plans',                          [AdminPlanController::class, 'index'])->name('plans.index');
    Route::post('/plans',                         [AdminPlanController::class, 'store'])->name('plans.store');
    Route::patch('/plans/{plan}',                 [AdminPlanController::class, 'update'])->name('plans.update');
    Route::patch('/plans/{plan}/toggle',          [AdminPlanController::class, 'toggleActive'])->name('plans.toggle');
    Route::delete('/plans/{plan}',                [AdminPlanController::class, 'destroy'])->name('plans.destroy');

    // Billing — cross-tenant subscriptions & invoices (Paddle)
    Route::get('/billing',                          [\App\Http\Controllers\Admin\BillingController::class, 'index'])->name('billing.index');
    Route::get('/billing/invoices/{transaction}/download', [\App\Http\Controllers\Admin\BillingController::class, 'downloadInvoice'])->name('billing.invoices.download');
    Route::post('/billing/{subscription}/pause',            [\App\Http\Controllers\Admin\BillingController::class, 'pause'])->name('billing.pause');
    Route::post('/billing/{subscription}/resume',           [\App\Http\Controllers\Admin\BillingController::class, 'resume'])->name('billing.resume');

    // Discount codes (Paddle) — no local table, Paddle is the source of truth
    Route::get('/discounts',           [\App\Http\Controllers\Admin\DiscountController::class, 'index'])->name('discounts.index');
    Route::post('/discounts',          [\App\Http\Controllers\Admin\DiscountController::class, 'store'])->name('discounts.store');
    Route::patch('/discounts/{discount}',  [\App\Http\Controllers\Admin\DiscountController::class, 'update'])->name('discounts.update');
    Route::delete('/discounts/{discount}', [\App\Http\Controllers\Admin\DiscountController::class, 'destroy'])->name('discounts.destroy');

    // Blogs Management
    Route::get('/blogs',                        [AdminBlogController::class, 'index'])->name('blogs.index');
    Route::get('/blogs/create',                 [AdminBlogController::class, 'create'])->name('blogs.create');
    Route::post('/blogs/generate-seo',          [AdminBlogController::class, 'generateSeoSuggest'])->name('blogs.generate-seo');
    Route::post('/blogs/ai-generate',           [AdminBlogController::class, 'aiGenerate'])->name('blogs.ai-generate');
    Route::post('/blogs',                       [AdminBlogController::class, 'store'])->name('blogs.store');
    Route::get('/blogs/{blog}/edit',            [AdminBlogController::class, 'edit'])->name('blogs.edit');
    Route::post('/blogs/{blog}',                [AdminBlogController::class, 'update'])->name('blogs.update');
    Route::patch('/blogs/{blog}/toggle',        [AdminBlogController::class, 'togglePublish'])->name('blogs.toggle');
    Route::delete('/blogs/{blog}',              [AdminBlogController::class, 'destroy'])->name('blogs.destroy');

    Route::get('/settings', function (\Illuminate\Http\Request $request) {
        $aiSetting = \App\Models\SystemSetting::getAdminAi();
        if (!empty($aiSetting['api_key'])) {
            $aiSetting['api_key'] = substr($aiSetting['api_key'], 0, 8) . str_repeat('*', 24);
        }

        return inertia('Admin/Settings', [
            'user' => $request->user('admin')?->only('name', 'email'),
            'custom_logo_url' => \App\Models\SystemSetting::get('custom_logo_url'),
            'setting' => $aiSetting,
            'models' => [
                'claude' => [
                    ['id' => 'claude-opus-4-8',           'label' => 'Claude Opus 4.8'],
                    ['id' => 'claude-sonnet-4-6',          'label' => 'Claude Sonnet 4.6'],
                    ['id' => 'claude-haiku-4-5-20251001',  'label' => 'Claude Haiku 4.5'],
                    ['id' => 'claude-opus-4-5',            'label' => 'Claude Opus 4.5'],
                    ['id' => 'claude-sonnet-3-7',          'label' => 'Claude Sonnet 3.7'],
                    ['id' => 'claude-sonnet-3-5',          'label' => 'Claude Sonnet 3.5'],
                    ['id' => 'claude-haiku-3-5',           'label' => 'Claude Haiku 3.5'],
                ],
                'openai' => [
                    ['id' => 'gpt-4o',            'label' => 'GPT-4o'],
                    ['id' => 'gpt-4o-mini',       'label' => 'GPT-4o mini'],
                    ['id' => 'gpt-4-turbo',       'label' => 'GPT-4 Turbo'],
                    ['id' => 'gpt-3.5-turbo',     'label' => 'GPT-3.5 Turbo'],
                    ['id' => 'o3-mini',           'label' => 'o3-mini'],
                    ['id' => 'o1-mini',           'label' => 'o1-mini'],
                    ['id' => 'o1',                'label' => 'o1'],
                ],
                'kimi' => [
                    ['id' => 'moonshotai/kimi-k2',                             'label' => 'Kimi K2'],
                    ['id' => 'moonshotai/kimi-k2.6',                           'label' => 'Kimi K2.6'],
                    ['id' => 'nvidia/llama-3.1-nemotron-70b-instruct',         'label' => 'Llama 3.1 Nemotron 70B'],
                    ['id' => 'meta/llama-3.1-405b-instruct',                   'label' => 'Llama 3.1 405B'],
                    ['id' => 'nvidia/mistral-nemo-minitron-8b-8k-instruct',    'label' => 'Mistral Nemo Minitron 8B'],
                    ['id' => 'deepseek-ai/deepseek-r1',                        'label' => 'DeepSeek R1'],
                ],
            ],
            'seo' => \App\Models\SystemSetting::getSeo(),
            'app_url' => config('app.url'),
            'smtp' => \App\Models\SystemSetting::getSmtp(),
            'configured' => \App\Models\SystemSetting::isSmtpConfigured(),
            'chatbot' => \App\Models\SystemSetting::getChatbot(),
            'chatbot_default_prompt' => \App\Services\ChatbotService::defaultSystemPrompt(),
            // Guard: don't 500 if the deploy hasn't run the chatbot migration yet.
            'chatbot_knowledge' => \Illuminate\Support\Facades\Schema::hasTable('chatbot_knowledge_entries')
                ? \App\Models\ChatbotKnowledgeEntry::orderBy('sort_order')->orderBy('id')->get()
                : [],
        ]);
    })->name('settings');

    Route::get('/settings/account',             fn () => redirect()->route('settings', ['tab' => 'account']))->name('settings.account');
    Route::patch('/settings/account',           [AdminAccountController::class, 'update'])->name('settings.account.update');
    Route::patch('/settings/account/password',  [AdminAccountController::class, 'updatePassword'])->name('settings.account.password');
    Route::get('/settings/branding',            fn () => redirect()->route('settings', ['tab' => 'branding']))->name('settings.branding');
    Route::post('/settings/branding',           [AdminAccountController::class, 'updateBranding'])->name('settings.branding.update');
    Route::post('/settings/branding/reset',     [AdminAccountController::class, 'resetBranding'])->name('settings.branding.reset');
    Route::get('/settings/ai',                  fn () => redirect()->route('settings', ['tab' => 'ai']))->name('settings.ai');
    Route::post('/settings/ai',                 [\App\Http\Controllers\Admin\AiSettingsController::class, 'update'])->name('settings.ai.update');
    Route::post('/settings/ai/test',            [\App\Http\Controllers\Admin\AiSettingsController::class, 'test'])->name('settings.ai.test');
    Route::delete('/settings/ai',               [\App\Http\Controllers\Admin\AiSettingsController::class, 'destroy'])->name('settings.ai.destroy');
    Route::get('/settings/seo',                 fn () => redirect()->route('settings', ['tab' => 'seo']))->name('settings.seo');
    Route::post('/settings/seo',                [\App\Http\Controllers\Admin\SeoSettingsController::class, 'update'])->name('settings.seo.update');

    // Chatbot — settings tab, knowledge base CRUD, and recorded conversations
    Route::get('/settings/chatbot',                       fn () => redirect()->route('settings', ['tab' => 'chatbot']))->name('settings.chatbot');
    Route::post('/settings/chatbot',                      [\App\Http\Controllers\Admin\ChatbotSettingsController::class, 'update'])->name('settings.chatbot.update');
    Route::post('/settings/chatbot/knowledge',            [\App\Http\Controllers\Admin\ChatbotSettingsController::class, 'storeKnowledge'])->name('settings.chatbot.knowledge.store');
    Route::patch('/settings/chatbot/knowledge/{entry}',   [\App\Http\Controllers\Admin\ChatbotSettingsController::class, 'updateKnowledge'])->name('settings.chatbot.knowledge.update');
    Route::delete('/settings/chatbot/knowledge/{entry}',  [\App\Http\Controllers\Admin\ChatbotSettingsController::class, 'destroyKnowledge'])->name('settings.chatbot.knowledge.destroy');
    Route::get('/chatbot-conversations',                  [\App\Http\Controllers\Admin\ChatbotSettingsController::class, 'conversations'])->name('chatbot.conversations');
    Route::get('/chatbot-conversations/{conversation}',   [\App\Http\Controllers\Admin\ChatbotSettingsController::class, 'showConversation'])->name('chatbot.conversations.show');
    Route::delete('/chatbot-conversations/{conversation}',[\App\Http\Controllers\Admin\ChatbotSettingsController::class, 'destroyConversation'])->name('chatbot.conversations.destroy');

    Route::get('/smtp-settings',                 fn () => redirect()->route('settings', ['tab' => 'smtp']))->name('smtp.edit');
    Route::post('/smtp-settings',                [AdminSmtpSettingsController::class, 'update'])->name('smtp.update');
    Route::post('/smtp-settings/test',           [AdminSmtpSettingsController::class, 'test'])->name('smtp.test');

    // Contact messages (from public landing page form)
    Route::get('/contact-messages',                            [AdminContactMessageController::class, 'index'])->name('contact.index');
    Route::patch('/contact-messages/{contactMessage}',         [AdminContactMessageController::class, 'update'])->name('contact.update');
    Route::delete('/contact-messages/{contactMessage}',        [AdminContactMessageController::class, 'destroy'])->name('contact.destroy');

    // WhatsApp admin — one page (pooled credentials, per-tenant access, unassigned inbound) split into tabs
    Route::get('/whatsapp-settings',            [AdminWhatsappSettingsController::class, 'index'])->name('whatsapp.edit');
    Route::post('/whatsapp-settings',           [AdminWhatsappSettingsController::class, 'update'])->name('whatsapp.update');
    Route::post('/whatsapp-settings/test',      [AdminWhatsappSettingsController::class, 'test'])->name('whatsapp.test');

    Route::patch('/whatsapp-tenants/{organization:id}', [AdminWhatsappTenantAccessController::class, 'update'])->name('whatsapp-tenants.update');

    Route::post('/whatsapp-inbound/{inbound}/assign',     [AdminWhatsappUnassignedInboundController::class, 'assign'])->name('whatsapp-inbound.assign');
    Route::post('/whatsapp-inbound/{inbound}/ignore',     [AdminWhatsappUnassignedInboundController::class, 'ignore'])->name('whatsapp-inbound.ignore');

    // Support cases — cross-tenant view + reply
    Route::get('/support',                        [AdminSupportCaseController::class, 'index'])->name('support.index');
    Route::get('/support/{supportCase}',          [AdminSupportCaseController::class, 'show'])->name('support.show');
    Route::post('/support/{supportCase}/reply',   [AdminSupportCaseController::class, 'reply'])->name('support.reply');
    Route::patch('/support/{supportCase}/status', [AdminSupportCaseController::class, 'updateStatus'])->name('support.status');
});

Route::middleware(['auth'])->group(function () {

    // Stop impersonating — available to the impersonated user (not super-admin gated).
    Route::post('/impersonate/leave', [ImpersonationController::class, 'leave'])->name('impersonate.leave');

    // Frontend error reporting (throttled — a broken page shouldn't be able to flood the DB)
    Route::post('/errors/report', [ErrorReportController::class, 'store'])->middleware('throttle:20,1')->name('errors.report');

    // Notifications
    Route::get('/notifications',                       [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/read-all',             [NotificationController::class, 'markAllRead'])->name('notifications.read-all');
    Route::post('/notifications/{notification}/read',  [NotificationController::class, 'markRead'])->name('notifications.read');
    Route::delete('/notifications/clear',              [NotificationController::class, 'destroyAll'])->name('notifications.clear');
    Route::delete('/notifications/{notification}',     [NotificationController::class, 'destroy'])->name('notifications.destroy');

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Reports & Analytics
    Route::get('/reports', [ReportController::class, 'index'])->middleware('permission:reports.view')->name('reports.index');

    // Leads
    Route::get('/leads',               [LeadController::class, 'index'])->name('leads.index');
    Route::get('/leads/search',        [LeadController::class, 'search'])->name('leads.search');
    Route::get('/leads/create',        [LeadController::class, 'create'])->name('leads.create');
    Route::post('/leads',              [LeadController::class, 'store'])->name('leads.store');
    Route::post('/leads/bulk-destroy',       [LeadController::class, 'bulkDestroy'])->name('leads.bulk-destroy');
    Route::post('/leads/bulk-add-to-group',  [LeadController::class, 'bulkAddToGroup'])->name('leads.bulk-add-to-group');
    Route::post('/leads/{lead}/convert', [LeadController::class, 'convert'])->name('leads.convert');
    Route::get('/leads/{lead}',        [LeadController::class, 'show'])->name('leads.show');
    Route::get('/leads/{lead}/edit',   [LeadController::class, 'edit'])->name('leads.edit');
    Route::put('/leads/{lead}',        [LeadController::class, 'update'])->name('leads.update');
    Route::patch('/leads/{lead}/status', [LeadController::class, 'updateStatus'])->name('leads.status');
    Route::patch('/leads/{lead}/channels', [LeadController::class, 'updateChannels'])->name('leads.channels');
    Route::patch('/leads/{lead}/assign', [LeadController::class, 'assign'])->middleware('permission:leads.assign')->name('leads.assign');
    Route::delete('/leads/{lead}',     [LeadController::class, 'destroy'])->name('leads.destroy');

    // AI Lead Generation
    Route::prefix('lead-generation')->name('lead-generation.')->group(function () {
        Route::get('/',             [LeadGenerationController::class, 'index'])->name('index');
        Route::post('/parse-prompt',[LeadGenerationController::class, 'parsePrompt'])->name('parse-prompt');
        Route::post('/search',      [LeadGenerationController::class, 'search'])->name('search');
        Route::post('/import',      [LeadGenerationController::class, 'import'])->name('import');
    });

    // Pipeline
    Route::get('/pipeline', [PipelineController::class, 'index'])->name('pipeline');

    // Campaigns (requires the Email Campaigns module — Pro plan and above)
    Route::middleware('module:email_campaigns')->group(function () {
        Route::get('/campaigns',                          [CampaignController::class, 'index'])->name('campaigns.index');
        Route::get('/campaigns/create',                   [CampaignController::class, 'create'])->name('campaigns.create');
        Route::post('/campaigns',                         [CampaignController::class, 'store'])->name('campaigns.store');
        Route::get('/campaigns/recipient-count',          [CampaignController::class, 'recipientCount'])->name('campaigns.recipient-count');
        Route::get('/campaigns/{campaign}',               [CampaignController::class, 'show'])->name('campaigns.show');
        Route::get('/campaigns/{campaign}/edit',          [CampaignController::class, 'edit'])->name('campaigns.edit');
        Route::put('/campaigns/{campaign}',               [CampaignController::class, 'update'])->name('campaigns.update');
        Route::delete('/campaigns/{campaign}',            [CampaignController::class, 'destroy'])->name('campaigns.destroy');
        Route::post('/campaigns/bulk-delete',             [CampaignController::class, 'bulkDestroy'])->name('campaigns.bulk-destroy');
        Route::post('/campaigns/{campaign}/send',             [CampaignController::class, 'send'])->name('campaigns.send');
        Route::post('/campaigns/{campaign}/stop',             [CampaignController::class, 'stop'])->name('campaigns.stop');
        Route::post('/campaigns/{campaign}/resume-followups', [CampaignController::class, 'resumeFollowups'])->name('campaigns.resume-followups');
        Route::post('/campaigns/{campaign}/clone',            [CampaignController::class, 'clone'])->name('campaigns.clone');
        Route::get('/campaigns/{campaign}/log',               [CampaignController::class, 'log'])->name('campaigns.log');

        Route::post('/campaigns/ai-compose/draft',     [AiEmailComposerController::class, 'draft'])->name('campaigns.ai-compose.draft');
        Route::post('/campaigns/ai-compose/followups', [AiEmailComposerController::class, 'followups'])->name('campaigns.ai-compose.followups');
        Route::post('/campaigns/ai-compose/rewrite',   [AiEmailComposerController::class, 'rewrite'])->name('campaigns.ai-compose.rewrite');
    });

    // Lead Groups
    Route::get('/groups',                        [LeadGroupController::class, 'index'])->name('groups.index');
    Route::post('/groups',                       [LeadGroupController::class, 'store'])->name('groups.store');
    Route::post('/groups/bulk-destroy',          [LeadGroupController::class, 'bulkDestroy'])->name('groups.bulk-destroy');
    Route::get('/groups/list',                   [LeadGroupController::class, 'listForSelect'])->name('groups.list');
    Route::get('/groups/{group}',                [LeadGroupController::class, 'show'])->name('groups.show');
    Route::patch('/groups/{group}',              [LeadGroupController::class, 'update'])->name('groups.update');
    Route::delete('/groups/{group}',             [LeadGroupController::class, 'destroy'])->name('groups.destroy');
    Route::post('/groups/{group}/leads',         [LeadGroupController::class, 'addLeads'])->name('groups.leads.add');
    Route::delete('/groups/{group}/leads',       [LeadGroupController::class, 'removeLeads'])->name('groups.leads.remove');

    // Lead Capture Forms
    Route::get('/forms',                        [FormController::class, 'index'])->name('forms.index');
    Route::get('/forms/create',                 [FormController::class, 'create'])->name('forms.create');
    Route::post('/forms',                       [FormController::class, 'store'])->name('forms.store');
    Route::get('/forms/list',                   [FormController::class, 'listForSelect'])->name('forms.list');
    Route::get('/forms/check-slug',              [FormController::class, 'checkSlug'])->name('forms.check-slug');
    Route::get('/forms/{form}/edit',             [FormController::class, 'edit'])->name('forms.edit');
    Route::put('/forms/{form}',                 [FormController::class, 'update'])->name('forms.update');
    Route::patch('/forms/{form}/toggle',        [FormController::class, 'toggleActive'])->name('forms.toggle');
    Route::delete('/forms/{form}',              [FormController::class, 'destroy'])->name('forms.destroy');

    // Import
    Route::get('/import',                        [ImportController::class, 'index'])->name('import.index');
    Route::post('/import/upload',                [ImportController::class, 'upload'])->name('import.upload');
    Route::post('/import/sheets/fetch',          [ImportController::class, 'fetchSheets'])->name('import.sheets.fetch');
    Route::post('/import/sheets/upload',         [ImportController::class, 'uploadFromSheets'])->name('import.sheets.upload');
    Route::post('/import/{job}/confirm',         [ImportController::class, 'confirm'])->name('import.confirm');
    Route::delete('/import/{job}',               [ImportController::class, 'cancel'])->name('import.cancel');

    // Invoices
    Route::get('/invoices',                    [InvoiceController::class, 'index'])->name('invoices.index');
    Route::get('/invoices/create',             [InvoiceController::class, 'create'])->name('invoices.create');
    Route::post('/invoices',                   [InvoiceController::class, 'store'])->name('invoices.store');
    Route::get('/invoices/{invoice}',          [InvoiceController::class, 'show'])->name('invoices.show');
    Route::put('/invoices/{invoice}',          [InvoiceController::class, 'update'])->name('invoices.update');
    Route::post('/invoices/{invoice}/send',    [InvoiceController::class, 'send'])->name('invoices.send');
    Route::delete('/invoices/{invoice}',       [InvoiceController::class, 'destroy'])->name('invoices.destroy');

    // Billing & Invoices (Paddle) — no module gate, every plan needs to see its own billing
    Route::get('/billing',                             [\App\Http\Controllers\BillingController::class, 'index'])->name('billing.index');
    Route::get('/billing/invoices/{transaction}/download', [\App\Http\Controllers\BillingController::class, 'downloadInvoice'])->name('billing.invoices.download');
    Route::post('/billing/pause',                       [\App\Http\Controllers\BillingController::class, 'pause'])->name('billing.pause');
    Route::post('/billing/resume',                      [\App\Http\Controllers\BillingController::class, 'resume'])->name('billing.resume');

    // Tags — managed from the Settings > Tags tab (see ProfileController::edit)
    Route::post('/tags',           [TagController::class, 'store'])->name('tags.store');
    Route::put('/tags/{tag}',      [TagController::class, 'update'])->name('tags.update');
    Route::delete('/tags/{tag}',   [TagController::class, 'destroy'])->name('tags.destroy');

    // Documentation / user guide (static Inertia page)
    Route::get('/documentation', fn () => inertia('Documentation/Index'))->name('documentation');

    // Support cases (self-service, no permission gate)
    Route::get('/support',                      [SupportCaseController::class, 'index'])->name('support.index');
    Route::post('/support',                     [SupportCaseController::class, 'store'])->name('support.store');
    Route::get('/support/{supportCase}',        [SupportCaseController::class, 'show'])->name('support.show');
    Route::post('/support/{supportCase}/reply', [SupportCaseController::class, 'reply'])->name('support.reply');

    // Profile / Settings
    Route::get('/profile',               [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile',             [ProfileController::class, 'update'])->name('profile.update');
    Route::post('/profile/workspace',    [ProfileController::class, 'updateWorkspace'])->name('profile.workspace');
    Route::post('/profile/callback-phone', [ProfileController::class, 'updateCallbackPhone'])->name('profile.callback-phone');
    Route::delete('/profile/logo',       [ProfileController::class, 'removeLogo'])->name('profile.logo.remove');
    Route::delete('/profile',            [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Organization-level settings (follow-up toggle, etc.)
    Route::post('/organization/settings', [OrganizationSettingsController::class, 'update'])->name('organization.settings.update');

    // Paddle customer portal — mints a session for the signed-in user's own org and redirects there
    Route::get('/settings/billing/portal', [\App\Http\Controllers\BillingPortalController::class, 'redirect'])->name('settings.billing.portal');

    // Team management
    Route::get('/settings/team',             [TeamMemberController::class, 'index'])->name('settings.team.index');
    Route::get('/settings/team/{user}',      [TeamMemberController::class, 'show'])->name('settings.team.show');
    Route::post('/settings/team',            [TeamMemberController::class, 'store'])->middleware('permission:team.manage')->name('settings.team.store');
    Route::patch('/settings/team/{user}',    [TeamMemberController::class, 'update'])->middleware('permission:team.manage')->name('settings.team.update');
    Route::delete('/settings/team/{user}',   [TeamMemberController::class, 'destroy'])->middleware('permission:team.manage')->name('settings.team.destroy');

    // Roles & permissions
    Route::get('/settings/roles',                [RoleController::class, 'index'])->name('settings.roles.index');
    Route::get('/settings/roles/create',         [RoleController::class, 'create'])->middleware('permission:team.manage_roles')->name('settings.roles.create');
    Route::post('/settings/roles',                [RoleController::class, 'store'])->middleware('permission:team.manage_roles')->name('settings.roles.store');
    Route::get('/settings/roles/{role}/edit',    [RoleController::class, 'edit'])->middleware('permission:team.manage_roles')->name('settings.roles.edit');
    Route::patch('/settings/roles/{role}',        [RoleController::class, 'update'])->middleware('permission:team.manage_roles')->name('settings.roles.update');
    Route::delete('/settings/roles/{role}',       [RoleController::class, 'destroy'])->middleware('permission:team.manage_roles')->name('settings.roles.destroy');

    // Lead generation provider settings
    Route::post('/settings/lead-provider/save', [ProfileController::class, 'saveLeadProvider'])->name('settings.lead-provider.save');
    Route::post('/settings/lead-provider/test', [ProfileController::class, 'testLeadProvider'])->name('settings.lead-provider.test');

    // Email Templates (built-in only — custom templates are not supported)
    Route::patch('/email-templates/{emailTemplate}/activate',    [EmailTemplateController::class, 'activate'])->name('email-templates.activate');
    Route::patch('/email-templates/deactivate',                  [EmailTemplateController::class, 'deactivate'])->name('email-templates.deactivate');
    Route::get('/email-templates/{emailTemplate}/preview',       [EmailTemplateController::class, 'preview'])->name('email-templates.preview');

    // Clients
    Route::get('/clients',                                    [ClientController::class, 'index'])->name('clients.index');
    Route::get('/clients/create',                             [ClientController::class, 'create'])->name('clients.create');
    Route::post('/clients',                                   [ClientController::class, 'store'])->name('clients.store');
    Route::get('/clients/{client}',                           [ClientController::class, 'show'])->name('clients.show');
    Route::patch('/clients/{client}',                         [ClientController::class, 'update'])->name('clients.update');
    Route::delete('/clients/{client}',                        [ClientController::class, 'destroy'])->name('clients.destroy');
    Route::post('/clients/{client}/documents',                [ClientDocumentController::class, 'store'])->name('clients.documents.store');
    Route::delete('/clients/{client}/documents/{document}',   [ClientDocumentController::class, 'destroy'])->name('clients.documents.destroy');

    // Projects
    Route::get('/projects',                                            [ProjectController::class, 'index'])->name('projects.index');
    Route::get('/projects/create',                                     [ProjectController::class, 'create'])->name('projects.create');
    Route::post('/projects',                                           [ProjectController::class, 'store'])->name('projects.store');
    Route::get('/projects/{project}',                                  [ProjectController::class, 'show'])->name('projects.show');
    Route::patch('/projects/{project}',                                [ProjectController::class, 'update'])->name('projects.update');
    Route::delete('/projects/{project}',                               [ProjectController::class, 'destroy'])->name('projects.destroy');
    Route::post('/projects/{project}/tasks',                           [ProjectTaskController::class, 'store'])->name('projects.tasks.store');
    Route::patch('/projects/{project}/tasks/{task}',                   [ProjectTaskController::class, 'update'])->name('projects.tasks.update');
    Route::delete('/projects/{project}/tasks/{task}',                  [ProjectTaskController::class, 'destroy'])->name('projects.tasks.destroy');
    Route::post('/projects/{project}/documents',                       [ProjectDocumentController::class, 'store'])->name('projects.documents.store');
    Route::delete('/projects/{project}/documents/{document}',          [ProjectDocumentController::class, 'destroy'])->name('projects.documents.destroy');

    // Inbox (IMAP fetch)
    Route::get('/inbox',                                   [InboxController::class, 'index'])->name('inbox.index');
    Route::get('/inbox/sync-status',                       [InboxController::class, 'syncStatus'])->name('inbox.sync-status');
    Route::get('/inbox/{fetchedEmail}',                    [InboxController::class, 'show'])->name('inbox.show');
    Route::post('/inbox/sync',                             [InboxController::class, 'sync'])->name('inbox.sync');
    Route::post('/inbox/send',                             [InboxController::class, 'send'])->name('inbox.send');
    Route::post('/inbox/{fetchedEmail}/reply',             [InboxController::class, 'reply'])->name('inbox.reply');
    Route::patch('/inbox/{fetchedEmail}/read',             [InboxController::class, 'markRead'])->name('inbox.read');
    Route::patch('/inbox/{fetchedEmail}/starred',          [InboxController::class, 'markStarred'])->name('inbox.starred');
    Route::patch('/inbox/{fetchedEmail}/trash',            [InboxController::class, 'trash'])->name('inbox.trash');
    Route::patch('/inbox/{fetchedEmail}/restore',          [InboxController::class, 'restore'])->name('inbox.restore');
    Route::delete('/inbox/{fetchedEmail}',                 [InboxController::class, 'destroy'])->name('inbox.destroy');

    // AI Provider Settings
    Route::get('/settings/ai',          [AiProviderController::class, 'show'])->name('ai.show');
    Route::post('/settings/ai',         [AiProviderController::class, 'store'])->name('ai.store');
    Route::post('/settings/ai/validate',[AiProviderController::class, 'validate'])->name('ai.validate');
    Route::get('/settings/ai/models',   [AiProviderController::class, 'models'])->name('ai.models');
    Route::delete('/settings/ai',       [AiProviderController::class, 'destroy'])->name('ai.destroy');

    // WhatsApp Status (read-only — tenants never configure Meta credentials themselves)
    Route::middleware('module:whatsapp_automation')->group(function () {
        Route::get('/settings/whatsapp', [WhatsappStatusController::class, 'show'])->name('whatsapp.settings');
    });

    // Twilio Settings & Dialer — gated to plans that include the `dialer` module
    Route::middleware('module:dialer')->group(function () {
        Route::post('/settings/twilio',          [TwilioController::class, 'store'])->name('twilio.store');
        Route::post('/settings/twilio/validate', [TwilioController::class, 'validateCredentials'])->name('twilio.validate');
        Route::delete('/settings/twilio',        [TwilioController::class, 'destroy'])->name('twilio.destroy');
        Route::get('/settings/twilio/balance',   [TwilioController::class, 'balance'])->name('twilio.balance');

        Route::get('/twilio',       [TwilioController::class, 'index'])->name('twilio.index');
        Route::get('/twilio/token',  [TwilioController::class, 'generateToken'])->name('twilio.token');
        Route::post('/twilio/call',  [TwilioController::class, 'placeCall'])->name('twilio.call');
        Route::post('/twilio/sms',   [TwilioController::class, 'sendSms'])->name('twilio.sms');
        Route::post('/twilio/sync',  [TwilioController::class, 'syncLogs'])->name('twilio.sync');
        Route::get('/twilio/leads',  [TwilioController::class, 'searchLeads'])->name('twilio.leads');
        Route::get('/twilio/calls/{call}/recording', [TwilioController::class, 'streamRecording'])->name('twilio.recording');
        Route::delete('/twilio/calls/bulk',   [TwilioController::class, 'bulkDestroyCalls'])->name('twilio.calls.bulk-destroy');
        Route::delete('/twilio/calls/{call}', [TwilioController::class, 'destroyCall'])->name('twilio.calls.destroy');
    });

    Route::post('/settings/cache/clear', [ProfileController::class, 'clearLeadsCache'])->name('settings.cache.clear');

    // WhatsApp Campaigns (Premium plan only)
    Route::middleware('module:whatsapp_campaigns')->group(function () {
        Route::get('/whatsapp/campaigns',                           [WhatsappCampaignController::class, 'index'])->name('whatsapp.campaigns.index');
        Route::get('/whatsapp/campaigns/create',                    [WhatsappCampaignController::class, 'create'])->name('whatsapp.campaigns.create');
        Route::post('/whatsapp/campaigns',                          [WhatsappCampaignController::class, 'store'])->name('whatsapp.campaigns.store');
        Route::get('/whatsapp/campaigns/{campaign}',                [WhatsappCampaignController::class, 'show'])->name('whatsapp.campaigns.show');
        Route::get('/whatsapp/campaigns/{campaign}/edit',           [WhatsappCampaignController::class, 'edit'])->name('whatsapp.campaigns.edit');
        Route::put('/whatsapp/campaigns/{campaign}',                [WhatsappCampaignController::class, 'update'])->name('whatsapp.campaigns.update');
        Route::delete('/whatsapp/campaigns/{campaign}',             [WhatsappCampaignController::class, 'destroy'])->name('whatsapp.campaigns.destroy');
        Route::post('/whatsapp/campaigns/{campaign}/send',          [WhatsappCampaignController::class, 'send'])->name('whatsapp.campaigns.send');
        Route::post('/whatsapp/campaigns/{campaign}/stop',          [WhatsappCampaignController::class, 'stop'])->name('whatsapp.campaigns.stop');
        Route::post('/whatsapp/campaigns/{campaign}/resume',        [WhatsappCampaignController::class, 'resume'])->name('whatsapp.campaigns.resume');
        Route::post('/whatsapp/campaigns/{campaign}/clone',         [WhatsappCampaignController::class, 'clone'])->name('whatsapp.campaigns.clone');
        Route::get('/whatsapp/campaigns/{campaign}/log',            [WhatsappCampaignController::class, 'log'])->name('whatsapp.campaigns.log');
    });

    // WhatsApp Conversations (inbox / bot automation — Premium plan only)
    Route::middleware('module:whatsapp_automation')->group(function () {
        Route::get('/whatsapp/conversations',                       [WhatsappConversationController::class, 'index'])->name('whatsapp.conversations.index');
        Route::get('/whatsapp/conversations/{lead}',                [WhatsappConversationController::class, 'show'])->name('whatsapp.conversations.show');
        Route::post('/whatsapp/conversations/{lead}/send',          [WhatsappConversationController::class, 'send'])->middleware('throttle:whatsapp-send')->name('whatsapp.conversations.send');
    });

    // SMTP Credentials
    Route::post('/smtp',                          [SmtpCredentialController::class, 'store'])->name('smtp.store');
    Route::put('/smtp/{smtpCredential}',          [SmtpCredentialController::class, 'update'])->name('smtp.update');
    Route::delete('/smtp/{smtpCredential}',       [SmtpCredentialController::class, 'destroy'])->name('smtp.destroy');
    Route::patch('/smtp/{smtpCredential}/activate',   [SmtpCredentialController::class, 'activate'])->name('smtp.activate');
    Route::patch('/smtp/{smtpCredential}/deactivate', [SmtpCredentialController::class, 'deactivate'])->name('smtp.deactivate');
    Route::post('/smtp/{smtpCredential}/test',      [SmtpCredentialController::class, 'test'])->name('smtp.test');
    Route::post('/smtp/{smtpCredential}/test-imap', [SmtpCredentialController::class, 'testImap'])->name('smtp.test-imap');
    Route::patch('/settings/mail',                [SmtpCredentialController::class, 'updateMailSettings'])->name('settings.mail');
});

// Public tools routes for lead generation and traffic acquisition
require __DIR__.'/public_tools.php';

require __DIR__.'/auth.php';

