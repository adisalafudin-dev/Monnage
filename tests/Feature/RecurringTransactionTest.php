<?php

use App\Models\Category;
use App\Models\RecurringTransaction;
use App\Models\User;
use App\Models\Wallet;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->wallet = Wallet::factory()->create([
        'user_id' => $this->user->id, 'balance' => 5000, 'currency' => 'IDR',
    ]);
    $this->category = Category::factory()->expense()->create(['user_id' => $this->user->id]);
});

it('renders the recurring transactions index page', function () {
    $this->actingAs($this->user)
        ->get(route('recurring-transactions.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('recurring-transactions/index'));
});

it('can create a recurring transaction', function () {
    $this->actingAs($this->user)
        ->post(route('recurring-transactions.store'), [
            'wallet_id' => $this->wallet->id,
            'category_id' => $this->category->id,
            'amount' => 100,
            'description' => 'Langganan bulanan',
            'frequency' => 'monthly',
            'interval' => 1,
            'start_date' => now()->toDateString(),
        ])
        ->assertRedirect(route('recurring-transactions.index'));

    $this->assertDatabaseHas('recurring_transactions', [
        'user_id' => $this->user->id,
        'wallet_id' => $this->wallet->id,
        'frequency' => 'monthly',
        'is_active' => true,
    ]);
});

it('validates required fields when creating', function () {
    $this->actingAs($this->user)
        ->post(route('recurring-transactions.store'), [])
        ->assertSessionHasErrors(['wallet_id', 'category_id', 'amount', 'frequency', 'interval', 'start_date']);
});

it('validates frequency must be a known value', function () {
    $this->actingAs($this->user)
        ->post(route('recurring-transactions.store'), [
            'wallet_id' => $this->wallet->id,
            'category_id' => $this->category->id,
            'amount' => 100,
            'frequency' => 'biweekly',
            'interval' => 1,
            'start_date' => now()->toDateString(),
        ])
        ->assertSessionHasErrors('frequency');
});

it('rejects creating on an archived wallet', function () {
    $archived = Wallet::factory()->archived()->create([
        'user_id' => $this->user->id,
    ]);

    $this->actingAs($this->user)
        ->post(route('recurring-transactions.store'), [
            'wallet_id' => $archived->id,
            'category_id' => $this->category->id,
            'amount' => 100,
            'frequency' => 'monthly',
            'interval' => 1,
            'start_date' => now()->toDateString(),
        ])
        ->assertSessionHasErrors('wallet_id');
});

it('can update amount and description of a recurring transaction', function () {
    $rule = RecurringTransaction::factory()->create([
        'user_id' => $this->user->id,
        'wallet_id' => $this->wallet->id,
        'category_id' => $this->category->id,
    ]);

    $this->actingAs($this->user)
        ->put(route('recurring-transactions.update', $rule), [
            'amount' => 250,
            'description' => 'Updated desc',
            'is_active' => true,
        ])
        ->assertRedirect(route('recurring-transactions.index'));

    expect((float) $rule->fresh()->amount)->toBe(250.00);
    expect($rule->fresh()->description)->toBe('Updated desc');
});

it('can deactivate a recurring transaction', function () {
    $rule = RecurringTransaction::factory()->create([
        'user_id' => $this->user->id,
        'wallet_id' => $this->wallet->id,
        'category_id' => $this->category->id,
        'is_active' => true,
    ]);

    $this->actingAs($this->user)
        ->put(route('recurring-transactions.update', $rule), [
            'amount' => $rule->amount,
            'is_active' => false,
        ])
        ->assertRedirect();

    expect($rule->fresh()->is_active)->toBeFalse();
});

it('can delete a recurring transaction', function () {
    $rule = RecurringTransaction::factory()->create([
        'user_id' => $this->user->id,
        'wallet_id' => $this->wallet->id,
        'category_id' => $this->category->id,
    ]);

    $this->actingAs($this->user)
        ->delete(route('recurring-transactions.destroy', $rule))
        ->assertRedirect(route('recurring-transactions.index'));

    $this->assertDatabaseMissing('recurring_transactions', ['id' => $rule->id]);
});

it('forbids another user from managing a recurring transaction', function () {
    $rule = RecurringTransaction::factory()->create([
        'user_id' => $this->user->id,
        'wallet_id' => $this->wallet->id,
        'category_id' => $this->category->id,
    ]);

    $other = User::factory()->create();

    $this->actingAs($other)
        ->put(route('recurring-transactions.update', $rule), [
            'amount' => 999,
            'is_active' => true,
        ])
        ->assertForbidden();

    $this->actingAs($other)
        ->delete(route('recurring-transactions.destroy', $rule))
        ->assertForbidden();
});
