<?php

use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->wallet = Wallet::factory()->create([
        'user_id' => $this->user->id,
        'balance' => 5000,
        'currency' => 'IDR',
    ]);
    $this->incomeCategory = Category::factory()->income()->create(['user_id' => $this->user->id]);
    $this->expenseCategory = Category::factory()->expense()->create(['user_id' => $this->user->id]);
});

it('renders the transaction index page', function () {
    $this->actingAs($this->user)
        ->get(route('transactions.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('transactions/index'));
});

it('can create an income transaction and wallet balance increases', function () {
    $this->actingAs($this->user)
        ->post(route('transactions.store'), [
            'wallet_id' => $this->wallet->id,
            'category_id' => $this->incomeCategory->id,
            'amount' => 1000,
            'description' => 'Gaji bulan ini',
            'transacted_at' => now()->toDateTimeString(),
        ])
        ->assertRedirect(route('transactions.index'));

    $this->assertDatabaseHas('transactions', [
        'wallet_id' => $this->wallet->id,
        'category_id' => $this->incomeCategory->id,
        'amount' => 1000,
    ]);

    // Balance should increase: 5000 + 1000 = 6000
    expect((float) $this->wallet->fresh()->balance)->toBe(6000.00);
});

it('can create an expense transaction and wallet balance decreases', function () {
    $this->actingAs($this->user)
        ->post(route('transactions.store'), [
            'wallet_id' => $this->wallet->id,
            'category_id' => $this->expenseCategory->id,
            'amount' => 500,
            'description' => 'Makan siang',
            'transacted_at' => now()->toDateTimeString(),
        ])
        ->assertRedirect(route('transactions.index'));

    // Balance should decrease: 5000 - 500 = 4500
    expect((float) $this->wallet->fresh()->balance)->toBe(4500.00);
});

it('validates required fields when creating a transaction', function () {
    $this->actingAs($this->user)
        ->post(route('transactions.store'), [])
        ->assertSessionHasErrors(['wallet_id', 'category_id', 'amount', 'transacted_at']);
});

it('rejects transaction on an archived wallet', function () {
    $archivedWallet = Wallet::factory()->archived()->create([
        'user_id' => $this->user->id,
    ]);

    $this->actingAs($this->user)
        ->post(route('transactions.store'), [
            'wallet_id' => $archivedWallet->id,
            'category_id' => $this->incomeCategory->id,
            'amount' => 100,
            'transacted_at' => now()->toDateTimeString(),
        ])
        ->assertSessionHasErrors('wallet_id');
});

it('can update a transaction and balances are adjusted correctly', function () {
    // Create an expense of 500 → balance becomes 4500
    $this->actingAs($this->user)->post(route('transactions.store'), [
        'wallet_id' => $this->wallet->id,
        'category_id' => $this->expenseCategory->id,
        'amount' => 500,
        'transacted_at' => now()->toDateTimeString(),
    ]);

    $transaction = Transaction::first();
    expect((float) $this->wallet->fresh()->balance)->toBe(4500.00);

    // Update amount to 300 → reversal (+500), then new deduction (-300) = 5200
    $this->actingAs($this->user)
        ->put(route('transactions.update', $transaction), [
            'wallet_id' => $this->wallet->id,
            'category_id' => $this->expenseCategory->id,
            'amount' => 300,
            'transacted_at' => now()->toDateTimeString(),
        ])
        ->assertRedirect(route('transactions.index'));

    expect((float) $this->wallet->fresh()->balance)->toBe(4700.00);
});

it('can delete a transaction and balance is restored', function () {
    $this->actingAs($this->user)->post(route('transactions.store'), [
        'wallet_id' => $this->wallet->id,
        'category_id' => $this->expenseCategory->id,
        'amount' => 800,
        'transacted_at' => now()->toDateTimeString(),
    ]);

    $transaction = Transaction::first();
    expect((float) $this->wallet->fresh()->balance)->toBe(4200.00);

    $this->actingAs($this->user)
        ->delete(route('transactions.destroy', $transaction))
        ->assertRedirect(route('transactions.index'));

    // Balance restored: 4200 + 800 = 5000
    expect((float) $this->wallet->fresh()->balance)->toBe(5000.00);
    $this->assertDatabaseMissing('transactions', ['id' => $transaction->id]);
});

it('forbids another user from deleting a transaction', function () {
    $this->actingAs($this->user)->post(route('transactions.store'), [
        'wallet_id' => $this->wallet->id,
        'category_id' => $this->incomeCategory->id,
        'amount' => 100,
        'transacted_at' => now()->toDateTimeString(),
    ]);

    $transaction = Transaction::first();
    $other = User::factory()->create();

    $this->actingAs($other)
        ->delete(route('transactions.destroy', $transaction))
        ->assertForbidden();
});

it('can move a transaction to a different wallet', function () {
    $walletB = Wallet::factory()->create([
        'user_id' => $this->user->id,
        'balance' => 2000,
        'currency' => 'IDR',
    ]);

    // Income on wallet A: 5000 + 1000 = 6000
    $this->actingAs($this->user)->post(route('transactions.store'), [
        'wallet_id' => $this->wallet->id,
        'category_id' => $this->incomeCategory->id,
        'amount' => 1000,
        'transacted_at' => now()->toDateTimeString(),
    ]);

    $transaction = Transaction::first();

    // Move to wallet B with same category/amount
    $this->actingAs($this->user)
        ->put(route('transactions.update', $transaction), [
            'wallet_id' => $walletB->id,
            'category_id' => $this->incomeCategory->id,
            'amount' => 1000,
            'transacted_at' => now()->toDateTimeString(),
        ])
        ->assertRedirect(route('transactions.index'));

    // Wallet A: 6000 - 1000 (reversal) = 5000
    expect((float) $this->wallet->fresh()->balance)->toBe(5000.00);
    // Wallet B: 2000 + 1000 (new income) = 3000
    expect((float) $walletB->fresh()->balance)->toBe(3000.00);
});
