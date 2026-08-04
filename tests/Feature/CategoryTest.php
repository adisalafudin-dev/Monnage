<?php

use App\Models\Budget;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->incomeCategory = Category::factory()->income()->create(['user_id' => $this->user->id]);
    $this->expenseCategory = Category::factory()->expense()->create(['user_id' => $this->user->id]);
});

it('renders the category index page', function () {
    $this->actingAs($this->user)
        ->get(route('categories.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('categories/index')
            ->has('categories', 2));
});

it('can create a category', function () {
    $this->actingAs($this->user)
        ->post(route('categories.store'), [
            'name' => 'Gaji',
            'type' => 'income',
        ])
        ->assertRedirect(route('categories.index'));

    $this->assertDatabaseHas('categories', [
        'user_id' => $this->user->id,
        'name' => 'Gaji',
        'type' => 'income',
    ]);
});

it('validates required fields when creating a category', function () {
    $this->actingAs($this->user)
        ->post(route('categories.store'), [])
        ->assertSessionHasErrors(['name', 'type']);
});

it('validates type must be income or expense', function () {
    $this->actingAs($this->user)
        ->post(route('categories.store'), [
            'name' => 'Bad',
            'type' => 'savings',
        ])
        ->assertSessionHasErrors('type');
});

it('can update a category', function () {
    $this->actingAs($this->user)
        ->put(route('categories.update', $this->incomeCategory), [
            'name' => 'Gaji Bulanan',
            'type' => 'income',
        ])
        ->assertRedirect(route('categories.index'));

    expect($this->incomeCategory->fresh()->name)->toBe('Gaji Bulanan');
});

it('prevents type change when category is in use by transactions', function () {
    $wallet = Wallet::factory()->create(['user_id' => $this->user->id]);
    Transaction::factory()->create([
        'wallet_id' => $wallet->id,
        'category_id' => $this->incomeCategory->id,
    ]);

    $this->actingAs($this->user)
        ->put(route('categories.update', $this->incomeCategory), [
            'name' => $this->incomeCategory->name,
            'type' => 'expense',
        ])
        ->assertSessionHasErrors('type');
});

it('prevents type change when category is in use by budgets', function () {
    Budget::factory()->create([
        'user_id' => $this->user->id,
        'category_id' => $this->expenseCategory->id,
    ]);

    $this->actingAs($this->user)
        ->put(route('categories.update', $this->expenseCategory), [
            'name' => $this->expenseCategory->name,
            'type' => 'income',
        ])
        ->assertSessionHasErrors('type');
});

it('can delete an unused category', function () {
    $this->actingAs($this->user)
        ->delete(route('categories.destroy', $this->incomeCategory))
        ->assertRedirect(route('categories.index'));

    $this->assertDatabaseMissing('categories', ['id' => $this->incomeCategory->id]);
});

it('cannot delete a category with transactions', function () {
    $wallet = Wallet::factory()->create(['user_id' => $this->user->id]);
    Transaction::factory()->create([
        'wallet_id' => $wallet->id,
        'category_id' => $this->incomeCategory->id,
    ]);

    $this->actingAs($this->user)
        ->delete(route('categories.destroy', $this->incomeCategory))
        ->assertSessionHasErrors('category');

    $this->assertDatabaseHas('categories', ['id' => $this->incomeCategory->id]);
});

it('forbids another user from managing a category', function () {
    $other = User::factory()->create();

    $this->actingAs($other)
        ->put(route('categories.update', $this->incomeCategory), [
            'name' => 'Hacked',
            'type' => 'income',
        ])
        ->assertForbidden();

    $this->actingAs($other)
        ->delete(route('categories.destroy', $this->incomeCategory))
        ->assertForbidden();
});
