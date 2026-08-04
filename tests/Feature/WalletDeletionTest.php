<?php

use App\Models\Category;
use App\Models\RecurringTransaction;
use App\Models\User;
use App\Models\Wallet;

it('prevents deleting a wallet that has recurring transactions', function () {
    $user = User::factory()->create();
    $wallet = Wallet::factory()->create(['user_id' => $user->id]);
    $category = Category::factory()->create(['user_id' => $user->id]);

    RecurringTransaction::create([
        'user_id' => $user->id,
        'wallet_id' => $wallet->id,
        'category_id' => $category->id,
        'amount' => 10000,
        'description' => 'Monthly subscription',
        'frequency' => 'monthly',
        'interval' => 1,
        'start_date' => now()->toDateString(),
        'next_due_date' => now()->addMonth()->toDateString(),
        'is_active' => true,
    ]);

    $response = $this->actingAs($user)
        ->delete(route('wallets.destroy', $wallet));

    $response->assertRedirect();
    $response->assertSessionHasErrors('wallet');
    $this->assertDatabaseHas('wallets', ['id' => $wallet->id]);
    $this->assertDatabaseHas('recurring_transactions', ['wallet_id' => $wallet->id]);
});
