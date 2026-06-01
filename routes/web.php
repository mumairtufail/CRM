<?php

use App\Http\Controllers\CampaignController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\LeadController;
use App\Http\Controllers\PipelineController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SmtpCredentialController;
use App\Http\Controllers\TagController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {

    // Dashboard
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    // Leads
    Route::get('/leads',               [LeadController::class, 'index'])->name('leads.index');
    Route::get('/leads/create',        [LeadController::class, 'create'])->name('leads.create');
    Route::post('/leads',              [LeadController::class, 'store'])->name('leads.store');
    Route::get('/leads/{lead}',        [LeadController::class, 'show'])->name('leads.show');
    Route::get('/leads/{lead}/edit',   [LeadController::class, 'edit'])->name('leads.edit');
    Route::put('/leads/{lead}',        [LeadController::class, 'update'])->name('leads.update');
    Route::patch('/leads/{lead}/status', [LeadController::class, 'updateStatus'])->name('leads.status');
    Route::delete('/leads/{lead}',     [LeadController::class, 'destroy'])->name('leads.destroy');

    // Pipeline
    Route::get('/pipeline', [PipelineController::class, 'index'])->name('pipeline');

    // Campaigns
    Route::get('/campaigns',                          [CampaignController::class, 'index'])->name('campaigns.index');
    Route::get('/campaigns/create',                   [CampaignController::class, 'create'])->name('campaigns.create');
    Route::post('/campaigns',                         [CampaignController::class, 'store'])->name('campaigns.store');
    Route::get('/campaigns/{campaign}',               [CampaignController::class, 'show'])->name('campaigns.show');
    Route::post('/campaigns/{campaign}/send',         [CampaignController::class, 'send'])->name('campaigns.send');
    Route::get('/campaigns/recipient-count',          [CampaignController::class, 'recipientCount'])->name('campaigns.recipient-count');

    // Import
    Route::get('/import',                        [ImportController::class, 'index'])->name('import.index');
    Route::post('/import/upload',                [ImportController::class, 'upload'])->name('import.upload');
    Route::post('/import/sheets/fetch',          [ImportController::class, 'fetchSheets'])->name('import.sheets.fetch');
    Route::post('/import/sheets/upload',         [ImportController::class, 'uploadFromSheets'])->name('import.sheets.upload');
    Route::post('/import/{job}/confirm',         [ImportController::class, 'confirm'])->name('import.confirm');
    Route::delete('/import/{job}',               [ImportController::class, 'cancel'])->name('import.cancel');

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

    // SMTP Credentials
    Route::post('/smtp',                          [SmtpCredentialController::class, 'store'])->name('smtp.store');
    Route::put('/smtp/{smtpCredential}',          [SmtpCredentialController::class, 'update'])->name('smtp.update');
    Route::delete('/smtp/{smtpCredential}',       [SmtpCredentialController::class, 'destroy'])->name('smtp.destroy');
    Route::patch('/smtp/{smtpCredential}/activate',   [SmtpCredentialController::class, 'activate'])->name('smtp.activate');
    Route::patch('/smtp/{smtpCredential}/deactivate', [SmtpCredentialController::class, 'deactivate'])->name('smtp.deactivate');
    Route::post('/smtp/{smtpCredential}/test',    [SmtpCredentialController::class, 'test'])->name('smtp.test');
    Route::patch('/settings/mail',                [SmtpCredentialController::class, 'updateMailSettings'])->name('settings.mail');
});

require __DIR__.'/auth.php';
