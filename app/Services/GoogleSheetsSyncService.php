<?php

namespace App\Services;

use App\Models\GoogleSheetConnection;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class GoogleSheetsSyncService
{
    public function sync(User $user): void
    {
        $connection = $user->googleSheetConnection;

        if (! $connection || ! $connection->hasSpreadsheet()) {
            throw new RuntimeException('Google Sheets belum terhubung atau belum ada spreadsheet yang dipilih.');
        }

        $accessToken = $this->getValidAccessToken($connection);

        $this->ensureSheetsExist($connection->spreadsheet_id, $accessToken, ['Transactions', 'Wallets']);
        $this->writeTransactions($user, $connection->spreadsheet_id, $accessToken);
        $this->writeWallets($user, $connection->spreadsheet_id, $accessToken);

        $connection->update(['last_synced_at' => now()]);
    }

    private function getValidAccessToken(GoogleSheetConnection $connection): string
    {
        if (! $connection->isTokenExpired()) {
            return $connection->access_token;
        }

        if (! $connection->refresh_token) {
            throw new RuntimeException('Sesi Google Anda kedaluwarsa. Hubungkan ulang Google Sheets dari Pengaturan.');
        }

        $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'client_id' => config('services.google.client_id'),
            'client_secret' => config('services.google.client_secret'),
            'refresh_token' => $connection->refresh_token,
            'grant_type' => 'refresh_token',
        ]);

        if ($response->failed()) {
            throw new RuntimeException('Gagal memperbarui akses Google Sheets. Hubungkan ulang dari Pengaturan.');
        }

        $data = $response->json();

        $connection->update([
            'access_token' => $data['access_token'],
            'token_expires_at' => now()->addSeconds($data['expires_in'] ?? 3600),
        ]);

        return $data['access_token'];
    }

    private function ensureSheetsExist(string $spreadsheetId, string $accessToken, array $titles): void
    {
        $response = Http::withToken($accessToken)
            ->get("https://sheets.googleapis.com/v4/spreadsheets/{$spreadsheetId}", [
                'fields' => 'sheets.properties.title',
            ]);

        if ($response->status() === 404) {
            throw new RuntimeException('Spreadsheet tidak ditemukan. Periksa kembali link-nya.');
        }

        if ($response->status() === 403) {
            throw new RuntimeException('Akun Google yang terhubung tidak memiliki akses edit ke spreadsheet ini.');
        }

        $response->throw();

        $existingTitles = collect($response->json('sheets', []))->pluck('properties.title')->all();
        $missing = array_values(array_diff($titles, $existingTitles));

        if (empty($missing)) {
            return;
        }

        Http::withToken($accessToken)
            ->post("https://sheets.googleapis.com/v4/spreadsheets/{$spreadsheetId}:batchUpdate", [
                'requests' => array_map(
                    fn ($title) => ['addSheet' => ['properties' => ['title' => $title]]],
                    $missing,
                ),
            ])
            ->throw();
    }

    private function writeTransactions(User $user, string $spreadsheetId, string $accessToken): void
    {
        $rows = [['Tanggal', 'Dompet', 'Mata Uang', 'Kategori', 'Tipe', 'Nominal', 'Keterangan']];

        Transaction::query()
            ->whereHas('wallet', fn ($q) => $q->where('user_id', $user->id))
            ->with(['wallet:id,title,currency', 'category:id,name,type'])
            ->orderBy('transacted_at')
            ->cursor()
            ->each(function (Transaction $transaction) use (&$rows) {
                $rows[] = [
                    $transaction->transacted_at->format('Y-m-d H:i'),
                    $transaction->wallet->title,
                    $transaction->wallet->currency,
                    $transaction->category->name,
                    $transaction->category->type === 'income' ? 'Pemasukan' : 'Pengeluaran',
                    (string) $transaction->amount,
                    $transaction->description ?? '',
                ];
            });

        $this->overwriteRange($spreadsheetId, $accessToken, 'Transactions', $rows);
    }

    private function writeWallets(User $user, string $spreadsheetId, string $accessToken): void
    {
        $rows = [['Dompet', 'Mata Uang', 'Saldo', 'Status']];

        $user->wallets()->orderBy('title')->get()->each(function (Wallet $wallet) use (&$rows) {
            $rows[] = [
                $wallet->title,
                $wallet->currency,
                (string) $wallet->balance,
                $wallet->status ? 'Aktif' : 'Diarsipkan',
            ];
        });

        $this->overwriteRange($spreadsheetId, $accessToken, 'Wallets', $rows);
    }

    /**
     * Clears a generous range before writing so a sync that shrinks the
     * data (e.g. after deleting transactions) doesn't leave stale rows
     * behind from a previous, larger sync.
     */
    private function overwriteRange(string $spreadsheetId, string $accessToken, string $sheetTitle, array $rows): void
    {
        Http::withToken($accessToken)
            ->post("https://sheets.googleapis.com/v4/spreadsheets/{$spreadsheetId}/values/{$sheetTitle}!A1:Z10000:clear")
            ->throw();

        $url = "https://sheets.googleapis.com/v4/spreadsheets/{$spreadsheetId}/values/{$sheetTitle}!A1"
            .'?valueInputOption=USER_ENTERED';

        Http::withToken($accessToken)
            ->put($url, ['values' => $rows])
            ->throw();
    }
}