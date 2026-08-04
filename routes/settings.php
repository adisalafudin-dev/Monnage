<?php

use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use Illuminate\Auth\Middleware\RequirePassword;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Settings\GoogleLinkController;
use App\Http\Controllers\Settings\GoogleSheetController;


Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('settings/integrations', [GoogleSheetController::class, 'edit'])->name('integrations.edit');
    Route::get('settings/integrations/google-sheets/redirect', [GoogleSheetController::class, 'redirect'])->name('integrations.google-sheets.redirect');
    Route::get('settings/integrations/google-sheets/callback', [GoogleSheetController::class, 'callback'])->name('integrations.google-sheets.callback');
    Route::put('settings/integrations/google-sheets', [GoogleSheetController::class, 'update'])->name('integrations.google-sheets.update');
    Route::delete('settings/integrations/google-sheets', [GoogleSheetController::class, 'destroy'])->name('integrations.google-sheets.destroy');
    Route::post('settings/integrations/google-sheets/sync', [GoogleSheetController::class, 'sync'])->name('integrations.google-sheets.sync');

    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/security', [SecurityController::class, 'edit'])
        ->middleware(RequirePassword::class)
        ->name('security.edit');

    Route::put('settings/password', [SecurityController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::inertia('settings/appearance', 'settings/appearance')->name('appearance.edit');

    Route::get('settings/google/redirect', [GoogleLinkController::class, 'redirect'])->name('google.redirect');
    Route::get('settings/google/callback', [GoogleLinkController::class, 'callback'])->name('google.callback');
    Route::delete('settings/google', [GoogleLinkController::class, 'destroy'])->name('google.destroy');

});

Route::get('.well-known/passkey-endpoints', function () {
    return response()->json([
        'enroll' => route('security.edit'),
        'manage' => route('security.edit'),
    ]);
})->name('well-known.passkeys');
