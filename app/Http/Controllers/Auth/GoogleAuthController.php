<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Fortify\Events\TwoFactorAuthenticationChallenged;
use Laravel\Fortify\Fortify;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\InvalidStateException;

class GoogleAuthController extends Controller
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
            return redirect()->route('login')->withErrors([
                'email' => 'Login dengan Google gagal atau kedaluwarsa, silakan coba lagi.',
            ]);
        }

        $emailVerified = $googleUser->user['email_verified'] ?? $googleUser->user['verified_email'] ?? true;

        $user = User::where('google_id', $googleUser->getId())->first();

        if (! $user) {
            $existing = User::where('email', $googleUser->getEmail())->first();

            if ($existing) {
                // An account with this email exists but hasn't linked Google
                // yet. Deliberately NOT auto-linking here — see plan notes:
                // linking only happens as an explicit action from Settings
                // while already authenticated as that user.
                return redirect()->route('login')->withErrors([
                    'email' => 'Akun dengan email ini sudah terdaftar. Masuk dengan kata sandi Anda, lalu hubungkan Google dari Pengaturan.',
                ]);
            }

            if (! $emailVerified) {
                return redirect()->route('login')->withErrors([
                    'email' => 'Google tidak dapat memverifikasi email akun ini.',
                ]);
            }

            $user = User::create([
                'name' => $googleUser->getName() ?: $googleUser->getNickname() ?: 'Pengguna Google',
                'email' => $googleUser->getEmail(),
                'google_id' => $googleUser->getId(),
                'avatar' => $googleUser->getAvatar(),
                'password' => null,
                'email_verified_at' => now(),
            ]);
        }

        // Replicates Fortify's own RedirectIfTwoFactorAuthenticatable logic
        // exactly, so a Google login can't silently bypass 2FA that's
        // already confirmed on this account.
        if (
            Fortify::confirmsTwoFactorAuthentication()
            && $user->two_factor_secret
            && ! is_null($user->two_factor_confirmed_at)
        ) {
            $request->session()->put([
                'login.id' => $user->getKey(),
                'login.remember' => true,
            ]);

            TwoFactorAuthenticationChallenged::dispatch($user);

            return redirect()->route('two-factor.login');
        }

        Auth::login($user, remember: true);
        $request->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }
}