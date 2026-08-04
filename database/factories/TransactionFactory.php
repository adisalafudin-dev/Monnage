<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Transaction;
use App\Models\Wallet;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

/**
 * @extends Factory<Transaction>
 */
class TransactionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'wallet_id' => Wallet::factory(),
            'category_id' => Category::factory(),
            'amount' => fake()->randomFloat(2, 1, 1000),
            'description' => fake()->sentence(),
            'transacted_at' => Carbon::now(),
        ];
    }
}