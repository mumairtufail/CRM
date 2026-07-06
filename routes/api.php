<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\LeadImportController;
use App\Http\Controllers\Api\LeadOutreachMessageController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::post('/leads/import-single', [LeadImportController::class, 'importSingle']);
    Route::post('/leads/{lead}/generate-message', [LeadOutreachMessageController::class, 'generate']);
});
