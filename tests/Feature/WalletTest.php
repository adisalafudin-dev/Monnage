<?php

use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->wallet = Wallet::factory()->create([
        'user_id' => $this->user->id,
        'balance' => 1000,
        'currency' => 'IDR',
    ]);
    $this->incomeCategory = Category::factory()->income()->create(['user_id' => $this->user->id]);
    $this->expenseCategory = Category::factory()->expense()->create(['user_id' => $this->user->id]);
});

it('renders the wallet index page', function () {
    $this->actingAs($this->user)
        ->get(route('wallets.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('wallets/index')
            ->has('wallets', 1));
});

it('can create a wallet', function () {
    $this->actingAs($this->user)
        ->post(route('wallets.store'), [
            'title' => 'Tabungan Baru',
            'description' => 'Deskripsi',
            'balance' => 500,
            'currency' => 'IDR',
            'status' => true,
        ])
        ->assertRedirect(route('wallets.index'));

    $this->assertDatabaseHas('wallets', [
        'user_id' => $this->user->id,
        'title' => 'Tabungan Baru',
        'balance' => 500,
    ]);
});

it('validates required fields when creating a wallet', function () {
    $this->actingAs($this->user)
        ->post(route('wallets.store'), [])
        ->assertSessionHasErrors(['title', 'balance', 'currency']);
});

it('can update a wallet', function () {
    $this->actingAs($this->user)
        ->put(route('wallets.update', $this->wallet), [
            'title' => 'Dompet Diperbarui',
            'description' => 'Desc baru',
            'balance' => 2000,
            'currency' => 'IDR',
            'status' => true,
        ])
        ->assertRedirect(route('wallets.index'));

    expect($this->wallet->fresh()->title)->toBe('Dompet Diperbarui');
});

it('can delete an empty wallet', function () {
    $this->actingAs($this->user)
        ->delete(route('wallets.destroy', $this->wallet))
        ->assertRedirect(route('wallets.index'));

    $this->assertDatabaseMissing('wallets', ['id' => $this->wallet->id]);
});

it('cannot delete a wallet with transactions', function () {
    Transaction::factory()->create([
        'wallet_id' => $this->wallet->id,
        'category_id' => $this->incomeCategory->id,
    ]);

    $this->actingAs($this->user)
        ->delete(route('wallets.destroy', $this->wallet))
        ->assertSessionHasErrors('wallet');

    $this->assertDatabaseHas('wallets', ['id' => $this->wallet->id]);
});

it('cannot delete a wallet with recurring transactions', function () {
    \App\Models\RecurringTransaction::factory()->create([
        'user_id' => $this->user->id,
        'wallet_id' => $this->wallet->id,
        'category_id' => $this->incomeCategory->id,
    ]);

    $this->actingAs($this->user)
        ->delete(route('wallets.destroy', $this->wallet))
        ->assertSessionHasErrors('wallet');

    $this->assertDatabaseHas('wallets', ['id' => $this->wallet->id]);
});

it('forbids another user from updating a wallet', function () {
    $other = User::factory()->create();

    $this->actingAs($other)
        ->put(route('wallets.update', $this->wallet), [
            'title' => 'Hacked',
            'balance' => 99999,
            'currency' => 'IDR',
        ])
        ->assertForbidden();
});

it('forbids another user from deleting a wallet', function () {
    $other = User::factory()->create();

    $this->actingAs($other)
        ->delete(route('wallets.destroy', $this->wallet))
        ->assertForbidden();
});
