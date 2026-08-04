<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Wallet;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Wallet>
 */
class WalletFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'title' => fake()->words(2, true),
            'description' => fake()->sentence(),
            'balance' => fake()->randomFloat(2, 0, 10000),
            'currency' => 'IDR',
            'status' => Wallet::STATUS_ACTIVE,
        ];
    }

    public function archived(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => Wallet::STATUS_ARCHIVED,
        ]);
    }
}