<?php

use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransfer;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->walletA = Wallet::factory()->create([
        'user_id' => $this->user->id, 'balance' => 5000, 'currency' => 'IDR',
    ]);
    $this->walletB = Wallet::factory()->create([
        'user_id' => $this->user->id, 'balance' => 3000, 'currency' => 'IDR',
    ]);
});

it('renders the transfer index page', function () {
    $this->actingAs($this->user)
        ->get(route('transfers.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('transfers/index'));
});

it('can transfer between wallets and balances adjust', function () {
    $this->actingAs($this->user)
        ->post(route('transfers.store'), [
            'from_wallet_id' => $this->walletA->id,
            'to_wallet_id' => $this->walletB->id,
            'amount' => 2000,
            'exchange_rate' => 1,
            'transferred_at' => now()->toDateTimeString(),
        ])
        ->assertRedirect(route('transfers.index'));

    // A: 5000 - 2000 = 3000, B: 3000 + 2000 = 5000
    expect((float) $this->walletA->fresh()->balance)->toBe(3000.00);
    expect((float) $this->walletB->fresh()->balance)->toBe(5000.00);
});

it('rejects transfer when balance is insufficient', function () {
    $this->actingAs($this->user)
        ->post(route('transfers.store'), [
            'from_wallet_id' => $this->walletA->id,
            'to_wallet_id' => $this->walletB->id,
            'amount' => 99999,
            'exchange_rate' => 1,
            'transferred_at' => now()->toDateTimeString(),
        ])
        ->assertSessionHasErrors('amount');

    // Balances unchanged
    expect((float) $this->walletA->fresh()->balance)->toBe(5000.00);
});

it('rejects transfer to same wallet', function () {
    $this->actingAs($this->user)
        ->post(route('transfers.store'), [
            'from_wallet_id' => $this->walletA->id,
            'to_wallet_id' => $this->walletA->id,
            'amount' => 100,
            'exchange_rate' => 1,
            'transferred_at' => now()->toDateTimeString(),
        ])
        ->assertSessionHasErrors('from_wallet_id');
});

it('forces exchange_rate 1 for same-currency transfer', function () {
    $this->actingAs($this->user)
        ->post(route('transfers.store'), [
            'from_wallet_id' => $this->walletA->id,
            'to_wallet_id' => $this->walletB->id,
            'amount' => 1000,
            'exchange_rate' => 2.5, // should be ignored
            'transferred_at' => now()->toDateTimeString(),
        ]);

    $transfer = WalletTransfer::first();
    expect((float) $transfer->exchange_rate)->toBe(1.000000);
    expect((float) $transfer->converted_amount)->toBe(1000.00);
});

it('applies exchange rate for cross-currency transfer', function () {
    $walletUSD = Wallet::factory()->create([
        'user_id' => $this->user->id, 'balance' => 0, 'currency' => 'USD',
    ]);

    $this->actingAs($this->user)
        ->post(route('transfers.store'), [
            'from_wallet_id' => $this->walletA->id,
            'to_wallet_id' => $walletUSD->id,
            'amount' => 1000,
            'exchange_rate' => 0.000063, // IDR→USD rate
            'transferred_at' => now()->toDateTimeString(),
        ]);

    $transfer = WalletTransfer::first();
    expect((float) $transfer->exchange_rate)->toBe(0.000063);
    expect((float) $this->walletA->fresh()->balance)->toBe(4000.00);
    expect((float) $walletUSD->fresh()->balance)->toBe(round(1000 * 0.000063, 2));
});

it('can delete a transfer and balances are restored', function () {
    $this->actingAs($this->user)->post(route('transfers.store'), [
        'from_wallet_id' => $this->walletA->id,
        'to_wallet_id' => $this->walletB->id,
        'amount' => 2000,
        'exchange_rate' => 1,
        'transferred_at' => now()->toDateTimeString(),
    ]);

    $transfer = WalletTransfer::first();

    $this->actingAs($this->user)
        ->delete(route('transfers.destroy', $transfer))
        ->assertRedirect(route('transfers.index'));

    // Both wallets restored to original
    expect((float) $this->walletA->fresh()->balance)->toBe(5000.00);
    expect((float) $this->walletB->fresh()->balance)->toBe(3000.00);
});

it('forbids another user from deleting a transfer', function () {
    $this->actingAs($this->user)->post(route('transfers.store'), [
        'from_wallet_id' => $this->walletA->id,
        'to_wallet_id' => $this->walletB->id,
        'amount' => 500,
        'exchange_rate' => 1,
        'transferred_at' => now()->toDateTimeString(),
    ]);

    $transfer = WalletTransfer::first();
    $other = User::factory()->create();

    $this->actingAs($other)
        ->delete(route('transfers.destroy', $transfer))
        ->assertForbidden();
});

it('rejects transfer involving archived wallets', function () {
    $archived = Wallet::factory()->archived()->create([
        'user_id' => $this->user->id, 'balance' => 1000, 'currency' => 'IDR',
    ]);

    $this->actingAs($this->user)
        ->post(route('transfers.store'), [
            'from_wallet_id' => $archived->id,
            'to_wallet_id' => $this->walletB->id,
            'amount' => 100,
            'exchange_rate' => 1,
            'transferred_at' => now()->toDateTimeString(),
        ])
        ->assertSessionHasErrors('from_wallet_id');
});
