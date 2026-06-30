<?php

use App\Http\Controllers\Admin\ContactMessageController as AdminContactMessageController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\OrganizationController as AdminOrganizationController;
use App\Http\Controllers\Admin\AccountController as AdminAccountController;
use App\Http\Controllers\Admin\SmtpSettingsController as AdminSmtpSettingsController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\AiProviderController;
use App\Http\Controllers\CampaignController;
use App\Http\Controllers\TwilioWebhookController;
use App\Http\Controllers\WhatsappCampaignController;
use App\Http\Controllers\WhatsappConversationController;
use App\Http\Controllers\WhatsappCredentialController;
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
use App\Http\Controllers\PublicLeadController;
use App\Http\Controllers\SmtpCredentialController;
use App\Http\Controllers\OrganizationSettingsController;
use App\Http\Controllers\ContactMessageController;
use App\Http\Controllers\TagController;
use Illuminate\Support\Facades\Route;

// Landing page — default public route
Route::get('/', fn () => inertia('Welcome', [
    'appUrl' => preg_replace('#^https?://#', '', rtrim(config('app.url'), '/')),
]))->name('home');

// Public contact form submission (no auth required)
Route::post('/contact', [ContactMessageController::class, 'store'])->name('contact.store');

// Public lead intake form (no auth required) — scoped to a specific organization.
Route::get('/intake/{organization:slug}',  [PublicLeadController::class, 'show'])->name('intake.show');
Route::post('/intake/{organization:slug}', [PublicLeadController::class, 'store'])->name('intake.store');

// Email tracking — public, no auth (must be outside auth middleware)
Route::get('/t/{token}/open.gif', [CampaignController::class, 'trackOpen'])->name('track.open');
Route::get('/t/{token}/click',    [CampaignController::class, 'trackClick'])->name('track.click');

// Twilio webhooks — public, validated by Twilio signature
Route::prefix('webhook/twilio')->group(function () {
    Route::post('/whatsapp', [TwilioWebhookController::class, 'handleIncoming'])->name('twilio.whatsapp');
    Route::post('/status',   [TwilioWebhookController::class, 'handleStatus'])->name('twilio.status');
});

// Super admin portal
Route::middleware(['auth', 'superadmin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/',                              [AdminDashboardController::class, 'index'])->name('dashboard');
    Route::get('/users',                         [AdminUserController::class, 'index'])->name('users.index');
    Route::post('/users/{user}/impersonate',     [AdminUserController::class, 'impersonate'])->name('users.impersonate');
    Route::get('/organizations',                 [AdminOrganizationController::class, 'index'])->name('organizations.index');
    Route::get('/settings',                      fn () => inertia('Admin/Settings'))->name('settings');
    Route::get('/settings/account',             [AdminAccountController::class, 'edit'])->name('settings.account');
    Route::patch('/settings/account',           [AdminAccountController::class, 'update'])->name('settings.account.update');
    Route::patch('/settings/account/password',  [AdminAccountController::class, 'updatePassword'])->name('settings.account.password');

    Route::get('/smtp-settings',                 [AdminSmtpSettingsController::class, 'edit'])->name('smtp.edit');
    Route::post('/smtp-settings',                [AdminSmtpSettingsController::class, 'update'])->name('smtp.update');
    Route::post('/smtp-settings/test',           [AdminSmtpSettingsController::class, 'test'])->name('smtp.test');

    // Contact messages (from public landing page form)
    Route::get('/contact-messages',                            [AdminContactMessageController::class, 'index'])->name('contact.index');
    Route::patch('/contact-messages/{contactMessage}',         [AdminContactMessageController::class, 'update'])->name('contact.update');
    Route::delete('/contact-messages/{contactMessage}',        [AdminContactMessageController::class, 'destroy'])->name('contact.destroy');
});

Route::middleware(['auth'])->group(function () {

    // Stop impersonating — available to the impersonated user (not super-admin gated).
    Route::post('/impersonate/leave', [ImpersonationController::class, 'leave'])->name('impersonate.leave');

    // Notifications
    Route::get('/notifications',                       [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/read-all',             [NotificationController::class, 'markAllRead'])->name('notifications.read-all');
    Route::post('/notifications/{notification}/read',  [NotificationController::class, 'markRead'])->name('notifications.read');
    Route::delete('/notifications/clear',              [NotificationController::class, 'destroyAll'])->name('notifications.clear');
    Route::delete('/notifications/{notification}',     [NotificationController::class, 'destroy'])->name('notifications.destroy');

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

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

    // Campaigns
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

    // Tags
    Route::get('/tags',            [TagController::class, 'index'])->name('tags.index');
    Route::post('/tags',           [TagController::class, 'store'])->name('tags.store');
    Route::put('/tags/{tag}',      [TagController::class, 'update'])->name('tags.update');
    Route::delete('/tags/{tag}',   [TagController::class, 'destroy'])->name('tags.destroy');

    // Documentation / user guide (static Inertia page)
    Route::get('/documentation', fn () => inertia('Documentation/Index'))->name('documentation');

    // Profile / Settings
    Route::get('/profile',               [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile',             [ProfileController::class, 'update'])->name('profile.update');
    Route::post('/profile/workspace',    [ProfileController::class, 'updateWorkspace'])->name('profile.workspace');
    Route::delete('/profile/logo',       [ProfileController::class, 'removeLogo'])->name('profile.logo.remove');
    Route::delete('/profile',            [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Organization-level settings (follow-up toggle, etc.)
    Route::post('/organization/settings', [OrganizationSettingsController::class, 'update'])->name('organization.settings.update');

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
    Route::get('/inbox/{fetchedEmail}',                    [InboxController::class, 'show'])->name('inbox.show');
    Route::post('/inbox/sync',                             [InboxController::class, 'sync'])->name('inbox.sync');
    Route::post('/inbox/send',                             [InboxController::class, 'send'])->name('inbox.send');
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

    // WhatsApp Settings
    Route::get('/settings/whatsapp',          [WhatsappCredentialController::class, 'show'])->name('whatsapp.settings');
    Route::post('/settings/whatsapp',         [WhatsappCredentialController::class, 'store'])->name('whatsapp.store');
    Route::post('/settings/whatsapp/verify',  [WhatsappCredentialController::class, 'verify'])->name('whatsapp.verify');
    Route::post('/settings/whatsapp/toggle',  [WhatsappCredentialController::class, 'toggle'])->name('whatsapp.toggle');
    Route::delete('/settings/whatsapp',       [WhatsappCredentialController::class, 'destroy'])->name('whatsapp.destroy');

    Route::post('/settings/cache/clear', [ProfileController::class, 'clearLeadsCache'])->name('settings.cache.clear');

    // WhatsApp Campaigns
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

    // WhatsApp Conversations (inbox)
    Route::get('/whatsapp/conversations',                       [WhatsappConversationController::class, 'index'])->name('whatsapp.conversations.index');
    Route::get('/whatsapp/conversations/{lead}',                [WhatsappConversationController::class, 'show'])->name('whatsapp.conversations.show');
    Route::post('/whatsapp/conversations/{lead}/send',          [WhatsappConversationController::class, 'send'])->name('whatsapp.conversations.send');

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

require __DIR__.'/auth.php';
