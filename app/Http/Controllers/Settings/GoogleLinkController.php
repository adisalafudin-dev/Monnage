<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\InvalidStateException;

class GoogleLinkController extends Controller
{
    public function redirect(): RedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

    public function callback(Request $request): RedirectResponse
    {
        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (InvalidStateException $e) {
            return redirect()->route('security.edit')->withErrors([
                'google' => 'Menghubungkan Google gagal atau kedaluwarsa, silakan coba lagi.',
            ]);
        }

        $emailVerified = $googleUser->user['email_verified'] ?? $googleUser->user['verified_email'] ?? true;

        if (! $emailVerified) {
            return redirect()->route('security.edit')->withErrors([
                'google' => 'Google tidak dapat memverifikasi email akun ini.',
            ]);
        }

        $linkedToSomeoneElse = User::where('google_id', $googleUser->getId())
            ->where('id', '!=', $request->user()->id)
            ->exists();

        if ($linkedToSomeoneElse) {
            return redirect()->route('security.edit')->withErrors([
                'google' => 'Akun Google ini sudah terhubung ke pengguna lain.',
            ]);
        }

        if (strcasecmp($googleUser->getEmail(), $request->user()->email) !== 0) {
            return redirect()->route('security.edit')->withErrors([
                'google' => 'Email akun Google harus sama dengan email akun Anda ('.$request->user()->email.').',
            ]);
        }

        $request->user()->update([
            'google_id' => $googleUser->getId(),
            'avatar' => $googleUser->getAvatar(),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Akun Google berhasil dihubungkan.']);

        return redirect()->route('security.edit');
    }

    public function destroy(Request $request): RedirectResponse
    {
        $user = $request->user();

        if (! $user->password) {
            return redirect()->route('security.edit')->withErrors([
                'google' => 'Atur kata sandi terlebih dahulu sebelum memutuskan hubungan Google, agar Anda tidak kehilangan akses ke akun ini.',
            ]);
        }

        $user->update(['google_id' => null, 'avatar' => null]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Akun Google berhasil diputuskan.']);

        return redirect()->route('security.edit');
    }
}