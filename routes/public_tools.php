<?php

use App\Http\Controllers\PublicToolController;
use Illuminate\Support\Facades\Route;

Route::prefix('tools')->name('tools.')->group(function () {
    Route::get('/', [PublicToolController::class, 'index'])->name('index');
    Route::get('/email-signature-generator', [PublicToolController::class, 'emailSignature'])->name('email-signature');
    Route::get('/invoice-generator', [PublicToolController::class, 'invoice'])->name('invoice');
});
