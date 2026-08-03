<?php

use App\Http\Controllers\BudgetController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\WalletController;
use App\Http\Controllers\WalletTransferController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RecurringTransactionController;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('wallets', WalletController::class)
        ->only(['index', 'store', 'update', 'destroy']);

    Route::resource('categories', CategoryController::class)
        ->only(['index', 'store', 'update', 'destroy']);

    Route::resource('transactions', TransactionController::class)
        ->only(['index', 'store', 'update', 'destroy']);

    Route::resource('budgets', BudgetController::class)->only(['index', 'store', 'destroy']);
    Route::post('budgets/overall', [BudgetController::class, 'storeOverall'])->name('budgets.overall.store');
    Route::delete('budgets/overall/{monthlyBudget}', [BudgetController::class, 'destroyOverall'])->name('budgets.overall.destroy');

    Route::resource('transfers', WalletTransferController::class)
        ->only(['index', 'store', 'destroy']);


    Route::resource('recurring-transactions', RecurringTransactionController::class)
        ->only(['index', 'store', 'update', 'destroy']);
});

require __DIR__.'/settings.php';
