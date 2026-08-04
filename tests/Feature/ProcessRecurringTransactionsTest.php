<?php

use App\Models\Category;
use App\Models\RecurringTransaction;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Support\Carbon;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->wallet = Wallet::factory()->create([
        'user_id' => $this->user->id,
        'balance' => 10000,
        'currency' => 'IDR',
    ]);
    $this->expenseCategory = Category::factory()->expense()->create(['user_id' => $this->user->id]);
    $this->incomeCategory = Category::factory()->income()->create(['user_id' => $this->user->id]);
});

it('creates a transaction when a rule is due', function () {
    RecurringTransaction::factory()->create([
        'user_id' => $this->user->id,
        'wallet_id' => $this->wallet->id,
        'category_id' => $this->expenseCategory->id,
        'amount' => 500,
        'description' => 'Langganan',
        'frequency' => 'monthly',
        'interval' => 1,
        'start_date' => today()->subDay(),
        'next_due_date' => today()->subDay(),
        'is_active' => true,
    ]);

    $this->artisan('recurring-transactions:process')
        ->assertSuccessful();

    expect(Transaction::count())->toBe(1);
    expect(Transaction::first()->amount)->toBe('500.00');
    // Balance: 10000 - 500 = 9500
    expect((float) $this->wallet->fresh()->balance)->toBe(9500.00);
});

it('creates income transaction and increases balance', function () {
    RecurringTransaction::factory()->create([
        'user_id' => $this->user->id,
        'wallet_id' => $this->wallet->id,
        'category_id' => $this->incomeCategory->id,
        'amount' => 2000,
        'frequency' => 'monthly',
        'interval' => 1,
        'next_due_date' => today()->subDay(),
        'start_date' => today()->subDay(),
        'is_active' => true,
    ]);

    $this->artisan('recurring-transactions:process')->assertSuccessful();

    // Balance: 10000 + 2000 = 12000
    expect((float) $this->wallet->fresh()->balance)->toBe(12000.00);
});

it('catches up on multiple missed occurrences', function () {
    RecurringTransaction::factory()->create([
        'user_id' => $this->user->id,
        'wallet_id' => $this->wallet->id,
        'category_id' => $this->expenseCategory->id,
        'amount' => 100,
        'frequency' => 'daily',
        'interval' => 1,
        'start_date' => today()->subDays(3),
        'next_due_date' => today()->subDays(3),
        'is_active' => true,
    ]);

    $this->artisan('recurring-transactions:process')->assertSuccessful();

    // subDays(3) → 4 occurrences (day-3, day-2, day-1, today) since lte(today())
    expect(Transaction::count())->toBe(4);
    // Balance: 10000 - (4 × 100) = 9600
    expect((float) $this->wallet->fresh()->balance)->toBe(9600.00);
});

it('skips inactive rules', function () {
    RecurringTransaction::factory()->inactive()->create([
        'user_id' => $this->user->id,
        'wallet_id' => $this->wallet->id,
        'category_id' => $this->expenseCategory->id,
        'amount' => 500,
        'next_due_date' => today()->subDay(),
        'start_date' => today()->subDay(),
    ]);

    $this->artisan('recurring-transactions:process')->assertSuccessful();

    expect(Transaction::count())->toBe(0);
    expect((float) $this->wallet->fresh()->balance)->toBe(10000.00);
});

it('skips rules not yet due', function () {
    RecurringTransaction::factory()->create([
        'user_id' => $this->user->id,
        'wallet_id' => $this->wallet->id,
        'category_id' => $this->expenseCategory->id,
        'amount' => 500,
        'next_due_date' => today()->addWeek(),
        'start_date' => today(),
        'is_active' => true,
    ]);

    $this->artisan('recurring-transactions:process')->assertSuccessful();

    expect(Transaction::count())->toBe(0);
});

it('pauses rule when wallet is archived', function () {
    $archived = Wallet::factory()->archived()->create([
        'user_id' => $this->user->id,
        'balance' => 5000,
    ]);

    $rule = RecurringTransaction::factory()->create([
        'user_id' => $this->user->id,
        'wallet_id' => $archived->id,
        'category_id' => $this->expenseCategory->id,
        'amount' => 500,
        'next_due_date' => today()->subDay(),
        'start_date' => today()->subDay(),
        'is_active' => true,
    ]);

    $this->artisan('recurring-transactions:process')->assertSuccessful();

    expect(Transaction::count())->toBe(0);
    expect($rule->fresh()->is_active)->toBeFalse();
});

it('deactivates rule after reaching end_date', function () {
    $rule = RecurringTransaction::factory()->create([
        'user_id' => $this->user->id,
        'wallet_id' => $this->wallet->id,
        'category_id' => $this->expenseCategory->id,
        'amount' => 100,
        'frequency' => 'daily',
        'interval' => 1,
        'start_date' => today()->subDays(2),
        'next_due_date' => today()->subDays(2),
        'end_date' => today()->subDay(),
        'is_active' => true,
    ]);

    $this->artisan('recurring-transactions:process')->assertSuccessful();

    $rule->refresh();
    // Should have created transactions for the 2 past days, then deactivated
    // because the next computed due date would exceed end_date
    expect($rule->is_active)->toBeFalse();
    expect($rule->last_generated_at)->not->toBeNull();
});

it('advances next_due_date correctly for monthly frequency', function () {
    Carbon::setTestNow(Carbon::create(2026, 3, 15));

    $rule = RecurringTransaction::factory()->create([
        'user_id' => $this->user->id,
        'wallet_id' => $this->wallet->id,
        'category_id' => $this->expenseCategory->id,
        'amount' => 100,
        'frequency' => 'monthly',
        'interval' => 1,
        'start_date' => Carbon::create(2026, 3, 1),
        'next_due_date' => Carbon::create(2026, 3, 1),
        'is_active' => true,
    ]);

    $this->artisan('recurring-transactions:process')->assertSuccessful();

    $rule->refresh();
    expect($rule->next_due_date->toDateString())->toBe('2026-04-01');

    Carbon::setTestNow(); // reset
});

it('sets last_generated_at after processing', function () {
    $rule = RecurringTransaction::factory()->create([
        'user_id' => $this->user->id,
        'wallet_id' => $this->wallet->id,
        'category_id' => $this->expenseCategory->id,
        'amount' => 100,
        'next_due_date' => today()->subDay(),
        'start_date' => today()->subDay(),
        'is_active' => true,
    ]);

    $this->artisan('recurring-transactions:process')->assertSuccessful();

    expect($rule->fresh()->last_generated_at)->not->toBeNull();
});
