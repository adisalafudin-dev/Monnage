<?php

namespace Database\Factories;

use App\Models\Wallet;
use App\Models\WalletTransfer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WalletTransfer>
 */
class WalletTransferFactory extends Factory
{
    public function definition(): array
    {
        return [
            'from_wallet_id' => Wallet::factory(),
            'to_wallet_id' => Wallet::factory(),
            'amount' => fake()->randomFloat(2, 10, 1000),
            'exchange_rate' => 1,
            'converted_amount' => fn (array $attrs) => $attrs['amount'],
            'description' => fake()->sentence(),
            'transferred_at' => now(),
        ];
    }
}
