<?php

use App\Http\Controllers\BudgetController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\WalletController;
use App\Http\Controllers\WalletTransferController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\LocaleController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RecurringTransactionController;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
})->name('home');

Route::patch('locale', [LocaleController::class, 'update'])->name('locale.update');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('wallets', WalletController::class)
        ->only(['index', 'store', 'update', 'destroy']);

    Route::resource('categories', CategoryController::class)
        ->only(['index', 'store', 'update', 'destroy']);

    Route::resource('transactions', TransactionController::class)
        ->only(['index', 'store', 'update', 'destroy']);


    Route::get('transactions/export', [TransactionController::class, 'export'])->name('transactions.export');

    Route::resource('budgets', BudgetController::class)->only(['index', 'store', 'destroy']);
    Route::post('budgets/overall', [BudgetController::class, 'storeOverall'])->name('budgets.overall.store');
    Route::delete('budgets/overall/{monthlyBudget}', [BudgetController::class, 'destroyOverall'])->name('budgets.overall.destroy');

    Route::resource('transfers', WalletTransferController::class)
        ->only(['index', 'store', 'destroy']);


    Route::resource('recurring-transactions', RecurringTransactionController::class)
        ->only(['index', 'store', 'update', 'destroy']);

});



Route::middleware('guest')->group(function () {
    Route::get('auth/google/redirect', [GoogleAuthController::class, 'redirect'])->name('auth.google.redirect');
    Route::get('auth/google/callback', [GoogleAuthController::class, 'callback'])->name('auth.google.callback');
});

require __DIR__.'/settings.php';
