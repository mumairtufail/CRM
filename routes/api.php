<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\LeadImportController;
use App\Http\Controllers\Api\LeadOutreachMessageController;
use App\Http\Controllers\Webhooks\TwilioWebhookController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Twilio Webhooks
Route::post('/webhooks/twilio/voice',        [TwilioWebhookController::class, 'handleVoice'])->name('webhooks.twilio.voice');
Route::post('/webhooks/twilio/voicemail',    [TwilioWebhookController::class, 'handleVoicemail'])->name('webhooks.twilio.voicemail');
Route::post('/webhooks/twilio/voice-bridge', [TwilioWebhookController::class, 'handleVoiceBridge'])->name('webhooks.twilio.voice-bridge');
Route::post('/webhooks/twilio/sms',          [TwilioWebhookController::class, 'handleSms'])->name('webhooks.twilio.sms');

Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::post('/leads/import-single', [LeadImportController::class, 'importSingle']);
    Route::post('/leads/{lead}/generate-message', [LeadOutreachMessageController::class, 'generate']);
});
