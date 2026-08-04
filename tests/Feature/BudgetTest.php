<?php

use App\Models\Budget;
use App\Models\Category;
use App\Models\MonthlyBudget;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;

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

it('renders the budget index page', function () {
    $this->actingAs($this->user)
        ->get(route('budgets.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('budgets/index'));
});

it('can create a budget for an expense category', function () {
    $this->actingAs($this->user)
        ->post(route('budgets.store'), [
            'category_id' => $this->expenseCategory->id,
            'amount' => 500000,
            'currency' => 'IDR',
            'rollover' => false,
            'month' => now()->month,
            'year' => now()->year,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('budgets', [
        'user_id' => $this->user->id,
        'category_id' => $this->expenseCategory->id,
    ]);
});

it('rejects a budget for an income category', function () {
    $this->actingAs($this->user)
        ->post(route('budgets.store'), [
            'category_id' => $this->incomeCategory->id,
            'amount' => 500000,
            'currency' => 'IDR',
            'month' => now()->month,
            'year' => now()->year,
        ])
        ->assertSessionHasErrors('category_id');
});

it('upserts budget for same category/month/year/currency', function () {
    $payload = [
        'category_id' => $this->expenseCategory->id,
        'amount' => 500000,
        'currency' => 'IDR',
        'rollover' => false,
        'month' => now()->month,
        'year' => now()->year,
    ];

    $this->actingAs($this->user)->post(route('budgets.store'), $payload);
    $this->actingAs($this->user)->post(route('budgets.store'), array_merge($payload, ['amount' => 700000]));

    expect(Budget::where('user_id', $this->user->id)->count())->toBe(1);
    expect((float) Budget::first()->amount)->toBe(700000.00);
});

it('can delete a budget', function () {
    $budget = Budget::factory()->create([
        'user_id' => $this->user->id,
        'category_id' => $this->expenseCategory->id,
    ]);

    $this->actingAs($this->user)
        ->delete(route('budgets.destroy', $budget))
        ->assertRedirect();

    $this->assertDatabaseMissing('budgets', ['id' => $budget->id]);
});

it('forbids another user from deleting a budget', function () {
    $budget = Budget::factory()->create([
        'user_id' => $this->user->id,
        'category_id' => $this->expenseCategory->id,
    ]);
    $other = User::factory()->create();

    $this->actingAs($other)
        ->delete(route('budgets.destroy', $budget))
        ->assertForbidden();
});

it('shows spending percentage for a budget', function () {
    Budget::factory()->create([
        'user_id' => $this->user->id,
        'category_id' => $this->expenseCategory->id,
        'amount' => 1000,
        'currency' => 'IDR',
        'month' => now()->month,
        'year' => now()->year,
    ]);

    Transaction::factory()->create([
        'wallet_id' => $this->wallet->id,
        'category_id' => $this->expenseCategory->id,
        'amount' => 400,
        'transacted_at' => now(),
    ]);

    $this->actingAs($this->user)
        ->get(route('budgets.index', ['month' => now()->month, 'year' => now()->year]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('budgets.0.spent', fn ($v) => (float) $v === 400.0)
            ->where('budgets.0.percentage', fn ($v) => (float) $v === 40.0));
});

it('can create an overall monthly budget', function () {
    $this->actingAs($this->user)
        ->post(route('budgets.overall.store'), [
            'amount' => 2000000,
            'currency' => 'IDR',
            'month' => now()->month,
            'year' => now()->year,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('monthly_budgets', [
        'user_id' => $this->user->id,
        'amount' => 2000000,
    ]);
});

it('can delete an overall monthly budget', function () {
    $mb = MonthlyBudget::factory()->create(['user_id' => $this->user->id]);

    $this->actingAs($this->user)
        ->delete(route('budgets.overall.destroy', $mb))
        ->assertRedirect();

    $this->assertDatabaseMissing('monthly_budgets', ['id' => $mb->id]);
});

it('forbids another user from deleting an overall monthly budget', function () {
    $mb = MonthlyBudget::factory()->create(['user_id' => $this->user->id]);
    $other = User::factory()->create();

    $this->actingAs($other)
        ->delete(route('budgets.overall.destroy', $mb))
        ->assertForbidden();
});
