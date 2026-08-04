<?php

use App\Models\GoogleSheetConnection;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use App\Models\Category;
use App\Services\GoogleSheetsSyncService;
use Illuminate\Support\Facades\Http;

/*
 |--------------------------------------------------------------------------
 | Test helpers
 |--------------------------------------------------------------------------
 */

function createSyncableUser(): User
{
    $user = User::factory()->create();

    $wallet = Wallet::factory()->for($user)->create();
    $category = Category::factory()->for($user)->income()->create();
    Transaction::factory()->for($wallet)->for($category)->create();

    GoogleSheetConnection::factory()->for($user)->create();

    return $user;
}

function fakeSheetsApiWithExistingSheets(): void
{
    Http::fake([
        'https://sheets.googleapis.com/v4/spreadsheets/*' => function ($request) {
            $url = $request->url();

            if (str_contains($url, ':batchUpdate')) {
                return Http::response(['spreadsheetId' => 'test-spreadsheet-id-123'], 200);
            }

            if (str_contains($url, ':clear')) {
                return Http::response([
                    'spreadsheetId' => 'test-spreadsheet-id-123',
                    'clearedRange' => 'Sheet1!A1:Z1000',
                ], 200);
            }

            if ($request->method() === 'PUT') {
                return Http::response([
                    'spreadsheetId' => 'test-spreadsheet-id-123',
                    'updatedRange' => 'Sheet1!A1:G2',
                    'updatedRows' => 2,
                    'updatedCells' => 14,
                ], 200);
            }

            return Http::response([
                'sheets' => [
                    ['properties' => ['title' => 'Transactions']],
                    ['properties' => ['title' => 'Wallets']],
                ],
            ], 200);
        },
    ]);
}

/*
 |--------------------------------------------------------------------------
 | Sync tests
 |--------------------------------------------------------------------------
 */

it('syncs transactions and wallets to Google Sheets successfully', function () {
    fakeSheetsApiWithExistingSheets();

    $user = createSyncableUser();
    $service = new GoogleSheetsSyncService();

    $service->sync($user);

    $connection = $user->refresh()->googleSheetConnection;
    expect($connection->last_synced_at)->not->toBeNull();
});

it('refreshes expired access token before syncing', function () {
    Http::fake([
        'https://oauth2.googleapis.com/token' => Http::response([
            'access_token' => 'refreshed-token-xyz',
            'expires_in' => 3600,
        ], 200),
    ]);
    fakeSheetsApiWithExistingSheets();

    $user = User::factory()->create();
    $wallet = Wallet::factory()->for($user)->create();
    $category = Category::factory()->for($user)->income()->create();
    Transaction::factory()->for($wallet)->for($category)->create();

    $connection = GoogleSheetConnection::factory()
        ->for($user)
        ->withExpiredToken()
        ->create();

    $service = new GoogleSheetsSyncService();
    $service->sync($user);

    $connection->refresh();

    expect($connection->access_token)->toBe('refreshed-token-xyz');
    expect($connection->token_expires_at)->toBeGreaterThan(now()->addMinutes(55));
});

it('throws when Google Sheets is not connected', function () {
    $user = User::factory()->create();

    $service = new GoogleSheetsSyncService();

    expect(fn () => $service->sync($user))
        ->toThrow(RuntimeException::class, 'Google Sheets belum terhubung atau belum ada spreadsheet yang dipilih.');
});

it('throws when no spreadsheet is linked', function () {
    $user = User::factory()->create();
    GoogleSheetConnection::factory()
        ->for($user)
        ->withoutSpreadsheet()
        ->create();

    $service = new GoogleSheetsSyncService();

    expect(fn () => $service->sync($user))
        ->toThrow(RuntimeException::class, 'Google Sheets belum terhubung atau belum ada spreadsheet yang dipilih.');
});

it('throws when refresh token is missing and token is expired', function () {
    $user = User::factory()->create();
    GoogleSheetConnection::factory()
        ->for($user)
        ->withExpiredToken()
        ->withoutRefreshToken()
        ->create();

    $service = new GoogleSheetsSyncService();

    expect(fn () => $service->sync($user))
        ->toThrow(RuntimeException::class, 'Sesi Google Anda kedaluwarsa. Hubungkan ulang Google Sheets dari Pengaturan.');
});

it('throws when token refresh fails', function () {
    Http::fake([
        'https://oauth2.googleapis.com/token' => Http::response([
            'error' => 'invalid_grant',
        ], 400),
    ]);

    $user = User::factory()->create();
    GoogleSheetConnection::factory()
        ->for($user)
        ->withExpiredToken()
        ->create();

    $service = new GoogleSheetsSyncService();

    expect(fn () => $service->sync($user))
        ->toThrow(RuntimeException::class, 'Gagal memperbarui akses Google Sheets. Hubungkan ulang dari Pengaturan.');
});

it('throws when refresh response has no access_token key', function () {
    Http::fake([
        'https://oauth2.googleapis.com/token' => Http::response([
            'error' => 'invalid_client',
            'error_description' => 'Unknown client',
        ], 200),
    ]);

    $user = User::factory()->create();
    GoogleSheetConnection::factory()
        ->for($user)
        ->withExpiredToken()
        ->create();

    $service = new GoogleSheetsSyncService();

    expect(fn () => $service->sync($user))
        ->toThrow(RuntimeException::class, 'Respons token Google tidak valid. Hubungkan ulang Google Sheets dari Pengaturan.');
});

it('throws 404 when spreadsheet is not found', function () {
    Http::fake([
        'https://sheets.googleapis.com/v4/spreadsheets/*' => Http::response(null, 404),
    ]);

    $user = createSyncableUser();
    $service = new GoogleSheetsSyncService();

    expect(fn () => $service->sync($user))
        ->toThrow(RuntimeException::class, 'Spreadsheet tidak ditemukan. Periksa kembali link-nya.');
});

it('throws 403 when user lacks edit access', function () {
    Http::fake([
        'https://sheets.googleapis.com/v4/spreadsheets/*' => Http::response(null, 403),
    ]);

    $user = createSyncableUser();
    $service = new GoogleSheetsSyncService();

    expect(fn () => $service->sync($user))
        ->toThrow(RuntimeException::class, 'Akun Google yang terhubung tidak memiliki akses edit ke spreadsheet ini.');
});

it('auto-creates missing sheets via batchUpdate', function () {
    Http::fake([
        'https://sheets.googleapis.com/v4/spreadsheets/*' => function ($request) {
            $url = $request->url();

            if (str_contains($url, ':batchUpdate')) {
                return Http::response(['spreadsheetId' => 'test-spreadsheet-id-123'], 200);
            }

            if (str_contains($url, ':clear')) {
                return Http::response(['spreadsheetId' => 'test-spreadsheet-id-123', 'clearedRange' => 'Sheet1!A1:Z1000'], 200);
            }

            if ($request->method() === 'PUT') {
                return Http::response(['spreadsheetId' => 'test-spreadsheet-id-123', 'updatedRows' => 2], 200);
            }

            // GET metadata — no sheets exist yet
            return Http::response(['sheets' => []], 200);
        },
    ]);

    $user = createSyncableUser();
    $service = new GoogleSheetsSyncService();

    $service->sync($user);

    $connection = $user->refresh()->googleSheetConnection;
    expect($connection->last_synced_at)->not->toBeNull();
});

it('clears range before writing to prevent stale rows', function () {
    $clearCalled = false;
    $writeCalledAfterClear = false;

    Http::fake([
        'https://sheets.googleapis.com/v4/spreadsheets/*' => function ($request) use (&$clearCalled, &$writeCalledAfterClear) {
            $url = $request->url();

            if (str_contains($url, ':clear')) {
                $clearCalled = true;

                return Http::response(['spreadsheetId' => 'test-spreadsheet-id-123', 'clearedRange' => 'Sheet1!A1:Z1000'], 200);
            }

            if ($request->method() === 'PUT') {
                if ($clearCalled) {
                    $writeCalledAfterClear = true;
                }

                return Http::response(['spreadsheetId' => 'test-spreadsheet-id-123', 'updatedRows' => 2], 200);
            }

            if (str_contains($url, ':batchUpdate')) {
                return Http::response(['spreadsheetId' => 'test-spreadsheet-id-123'], 200);
            }

            return Http::response([
                'sheets' => [
                    ['properties' => ['title' => 'Transactions']],
                    ['properties' => ['title' => 'Wallets']],
                ],
            ], 200);
        },
    ]);

    $user = createSyncableUser();
    $service = new GoogleSheetsSyncService();

    $service->sync($user);

    expect($clearCalled)->toBeTrue();
    expect($writeCalledAfterClear)->toBeTrue();
});

it('logs sync start and completion in non-production', function () {
    fakeSheetsApiWithExistingSheets();

    $user = createSyncableUser();
    $service = new GoogleSheetsSyncService();

    // Clear log file to detect new entries
    $logFile = storage_path('logs/laravel.log');
    if (file_exists($logFile)) {
        file_put_contents($logFile, '');
    }

    $service->sync($user);

    $afterContent = file_get_contents($logFile);

    expect($afterContent)->toContain('Google Sheets sync started');
    expect($afterContent)->toContain('Google Sheets sync completed');
});

it('logs error when sync fails', function () {
    Http::fake([
        'https://sheets.googleapis.com/v4/spreadsheets/*' => Http::response(null, 404),
    ]);

    $user = createSyncableUser();
    $service = new GoogleSheetsSyncService();

    // Clear log file to detect new entries
    $logFile = storage_path('logs/laravel.log');
    if (file_exists($logFile)) {
        file_put_contents($logFile, '');
    }

    try {
        $service->sync($user);
    } catch (RuntimeException $e) {
        // Expected
    }

    $logContent = file_get_contents($logFile);

    expect($logContent)->toContain('Google Sheets sync failed');
});
