<?php

namespace Database\Factories;

use App\Models\Budget;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Budget>
 */
class BudgetFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'category_id' => Category::factory()->expense(),
            'amount' => fake()->randomFloat(2, 100, 5000),
            'currency' => 'IDR',
            'rollover' => false,
            'month' => now()->month,
            'year' => now()->year,
        ];
    }

    public function rollover(): static
    {
        return $this->state(fn (array $attributes) => [
            'rollover' => true,
        ]);
    }
}
