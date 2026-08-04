<?php

namespace Database\Factories;

use App\Models\GoogleSheetConnection;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

/**
 * @extends Factory<GoogleSheetConnection>
 */
class GoogleSheetConnectionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'access_token' => 'valid-access-token',
            'refresh_token' => 'valid-refresh-token',
            'token_expires_at' => Carbon::now()->addHour(),
            'spreadsheet_id' => 'test-spreadsheet-id-123',
            'spreadsheet_url' => 'https://docs.google.com/spreadsheets/d/test-spreadsheet-id-123/edit',
            'last_synced_at' => null,
        ];
    }

    /**
     * Indicate that the access token has expired and needs refreshing.
     */
    public function withExpiredToken(): static
    {
        return $this->state(fn (array $attributes) => [
            'token_expires_at' => Carbon::now()->subHour(),
        ]);
    }

    /**
     * Indicate that no spreadsheet has been linked yet.
     */
    public function withoutSpreadsheet(): static
    {
        return $this->state(fn (array $attributes) => [
            'spreadsheet_id' => null,
            'spreadsheet_url' => null,
        ]);
    }

    /**
     * Indicate that there is no refresh token available.
     */
    public function withoutRefreshToken(): static
    {
        return $this->state(fn (array $attributes) => [
            'refresh_token' => null,
        ]);
    }
}