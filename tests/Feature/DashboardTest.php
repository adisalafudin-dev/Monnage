<?php

use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});

test('dashboard returns correct summary data', function () {
    $user = User::factory()->create();
    $wallet = Wallet::factory()->create([
        'user_id' => $user->id,
        'balance' => 5000,
        'currency' => 'IDR',
    ]);
    $income = Category::factory()->income()->create(['user_id' => $user->id]);
    $expense = Category::factory()->expense()->create(['user_id' => $user->id]);

    Transaction::factory()->create([
        'wallet_id' => $wallet->id,
        'category_id' => $income->id,
        'amount' => 3000,
        'transacted_at' => now(),
    ]);
    Transaction::factory()->create([
        'wallet_id' => $wallet->id,
        'category_id' => $expense->id,
        'amount' => 1000,
        'transacted_at' => now(),
    ]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->has('summary', 1)
            ->where('summary.0.currency', 'IDR')
            ->where('summary.0.totalIncome', fn ($v) => (float) $v === 3000.0)
            ->where('summary.0.totalExpense', fn ($v) => (float) $v === 1000.0)
            ->has('monthlySummary', 1)
        );
});