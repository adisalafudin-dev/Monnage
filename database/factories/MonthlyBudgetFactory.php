<?php

namespace Database\Factories;

use App\Models\MonthlyBudget;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MonthlyBudget>
 */
class MonthlyBudgetFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'amount' => fake()->randomFloat(2, 1000, 50000),
            'currency' => 'IDR',
            'month' => now()->month,
            'year' => now()->year,
        ];
    }
}
