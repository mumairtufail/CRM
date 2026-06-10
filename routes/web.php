<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\OrganizationController as AdminOrganizationController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\CampaignController;
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
use App\Http\Controllers\TagController;
use Illuminate\Support\Facades\Route;

// Public lead intake form (no auth required) — scoped to a specific organization.
Route::get('/intake/{organization:slug}',  [PublicLeadController::class, 'show'])->name('intake.show');
Route::post('/intake/{organization:slug}', [PublicLeadController::class, 'store'])->name('intake.store');

// Email tracking — public, no auth (must be outside auth middleware)
Route::get('/t/{token}/open.gif', [CampaignController::class, 'trackOpen'])->name('track.open');
Route::get('/t/{token}/click',    [CampaignController::class, 'trackClick'])->name('track.click');

// Super admin portal
Route::middleware(['auth', 'superadmin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/',                              [AdminDashboardController::class, 'index'])->name('dashboard');
    Route::get('/users',                         [AdminUserController::class, 'index'])->name('users.index');
    Route::post('/users/{user}/impersonate',     [AdminUserController::class, 'impersonate'])->name('users.impersonate');
    Route::get('/organizations',                 [AdminOrganizationController::class, 'index'])->name('organizations.index');
});

Route::middleware(['auth'])->group(function () {

    // Stop impersonating — available to the impersonated user (not super-admin gated).
    Route::post('/impersonate/leave', [ImpersonationController::class, 'leave'])->name('impersonate.leave');

    // Notifications
    Route::get('/notifications',                       [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/read-all',             [NotificationController::class, 'markAllRead'])->name('notifications.read-all');
    Route::post('/notifications/{notification}/read',  [NotificationController::class, 'markRead'])->name('notifications.read');

    // Dashboard
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    // Leads
    Route::get('/leads',               [LeadController::class, 'index'])->name('leads.index');
    Route::get('/leads/create',        [LeadController::class, 'create'])->name('leads.create');
    Route::post('/leads',              [LeadController::class, 'store'])->name('leads.store');
    Route::post('/leads/bulk-destroy',  [LeadController::class, 'bulkDestroy'])->name('leads.bulk-destroy');
    Route::post('/leads/{lead}/convert', [LeadController::class, 'convert'])->name('leads.convert');
    Route::get('/leads/{lead}',        [LeadController::class, 'show'])->name('leads.show');
    Route::get('/leads/{lead}/edit',   [LeadController::class, 'edit'])->name('leads.edit');
    Route::put('/leads/{lead}',        [LeadController::class, 'update'])->name('leads.update');
    Route::patch('/leads/{lead}/status', [LeadController::class, 'updateStatus'])->name('leads.status');
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
    Route::post('/campaigns/{campaign}/send',         [CampaignController::class, 'send'])->name('campaigns.send');

    // Lead Groups
    Route::get('/groups',                        [LeadGroupController::class, 'index'])->name('groups.index');
    Route::post('/groups',                       [LeadGroupController::class, 'store'])->name('groups.store');
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

    // Profile / Settings
    Route::get('/profile',               [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile',             [ProfileController::class, 'update'])->name('profile.update');
    Route::post('/profile/workspace',    [ProfileController::class, 'updateWorkspace'])->name('profile.workspace');
    Route::delete('/profile/logo',       [ProfileController::class, 'removeLogo'])->name('profile.logo.remove');
    Route::delete('/profile',            [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Lead generation provider settings
    Route::post('/settings/lead-provider/save', [ProfileController::class, 'saveLeadProvider'])->name('settings.lead-provider.save');
    Route::post('/settings/lead-provider/test', [ProfileController::class, 'testLeadProvider'])->name('settings.lead-provider.test');

    // Email Templates
    Route::post('/email-templates',                              [EmailTemplateController::class, 'store'])->name('email-templates.store');
    Route::put('/email-templates/{emailTemplate}',               [EmailTemplateController::class, 'update'])->name('email-templates.update');
    Route::delete('/email-templates/{emailTemplate}',            [EmailTemplateController::class, 'destroy'])->name('email-templates.destroy');
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
    Route::patch('/inbox/{fetchedEmail}/read',             [InboxController::class, 'markRead'])->name('inbox.read');
    Route::patch('/inbox/{fetchedEmail}/starred',          [InboxController::class, 'markStarred'])->name('inbox.starred');
    Route::patch('/inbox/{fetchedEmail}/trash',            [InboxController::class, 'trash'])->name('inbox.trash');
    Route::patch('/inbox/{fetchedEmail}/restore',          [InboxController::class, 'restore'])->name('inbox.restore');
    Route::delete('/inbox/{fetchedEmail}',                 [InboxController::class, 'destroy'])->name('inbox.destroy');

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
