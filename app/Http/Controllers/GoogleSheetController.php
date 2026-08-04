<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\GoogleProvider;
use Laravel\Socialite\Two\InvalidStateException;
use App\Services\GoogleSheetsSyncService;
use RuntimeException;

class GoogleSheetController extends Controller
{
    public function edit(Request $request): Response
    {
        $connection = $request->user()->googleSheetConnection;

        return Inertia::render('settings/integrations', [
            'googleSheetsConnected' => (bool) $connection?->access_token,
            'spreadsheetUrl' => $connection?->spreadsheet_url,
            'lastSyncedAt' => $connection?->last_synced_at,
        ]);
    }

    public function redirect(): RedirectResponse
    {
        /** @var GoogleProvider $provider */
        $provider = Socialite::driver('google');

        $provider->scopes([
            'https://www.googleapis.com/auth/spreadsheets',
        ]);

        $provider->with(['access_type' => 'offline', 'prompt' => 'consent']);

        return $provider->redirect();
    }

    public function callback(Request $request): RedirectResponse
    {
        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (InvalidStateException $e) {
            return redirect()->route('integrations.edit')->withErrors([
                'sheets' => 'Menghubungkan Google Sheets gagal atau kedaluwarsa, silakan coba lagi.',
            ]);
        }

        $request->user()->googleSheetConnection()->updateOrCreate(
            ['user_id' => $request->user()->id],
            [
                'access_token' => $googleUser->token,
                'refresh_token' => $googleUser->refreshToken
                    ?? $request->user()->googleSheetConnection?->refresh_token,
                'token_expires_at' => now()->addSeconds($googleUser->expiresIn ?? 3600),
            ]
        );

        return redirect()->route('integrations.edit')
            ->with('success', 'Google Sheets berhasil terhubung. Tempel link spreadsheet Anda di bawah.');
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate(['spreadsheet_url' => 'required|url']);

        if (! preg_match('/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/', $validated['spreadsheet_url'], $matches)) {
            return back()->withErrors(['spreadsheet_url' => 'Link Google Sheets tidak valid.']);
        }

        $connection = $request->user()->googleSheetConnection;

        if (! $connection?->access_token) {
            return back()->withErrors(['spreadsheet_url' => 'Hubungkan akun Google Anda terlebih dahulu.']);
        }

        $connection->update([
            'spreadsheet_id' => $matches[1],
            'spreadsheet_url' => $validated['spreadsheet_url'],
        ]);

        return redirect()->route('integrations.edit')->with('success', 'Spreadsheet berhasil disimpan.');
    }

    public function destroy(Request $request): RedirectResponse
    {
        $connection = $request->user()->googleSheetConnection;

        if ($connection) {
            if ($connection->access_token) {
                // Best-effort revoke on Google's side too — local deletion
                // happens regardless of whether this call succeeds.
                Http::asForm()->post('https://oauth2.googleapis.com/revoke', [
                    'token' => $connection->access_token,
                ]);
            }

            $connection->delete();
        }

        return redirect()->route('integrations.edit')->with('success', 'Google Sheets berhasil diputuskan.');
    }



    public function sync(Request $request, GoogleSheetsSyncService $syncService): RedirectResponse
    {
        $connection = $request->user()->googleSheetConnection;

        if (! $connection?->hasSpreadsheet()) {
            return back()->withErrors(['sheets' => 'Tempel link spreadsheet terlebih dahulu.']);
        }

        try {
            $syncService->sync($request->user());
        } catch (RuntimeException $e) {
            return back()->withErrors(['sheets' => $e->getMessage()]);
        }

        return redirect()->route('integrations.edit')->with('success', 'Berhasil sinkron ke Google Sheets.');
    }
}