<?php

namespace App\Http\Controllers;

use App\Models\Wallet;
use App\Support\Currency;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class WalletController extends Controller
{
    public function index(Request $request)
    {
        $wallets = $request->user()->wallets()
            ->latest()
            ->get();

        return Inertia::render('wallets/index', [
            'wallets' => $wallets,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:5000',
            'balance' => 'required|numeric|min:0',
            'currency' => ['required', 'string', 'size:3', Rule::in(Currency::codes())],
            'status' => 'boolean',
        ]);

        $request->user()->wallets()->create($validated);

        return redirect()->route('wallets.index')->with('success', __('Dompet berhasil dibuat.'));
    }

    public function update(Request $request, Wallet $wallet)
    {
        $this->authorizeWallet($wallet);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:5000',
            'balance' => 'required|numeric|min:0',
            'currency' => ['required', 'string', 'size:3', Rule::in(Currency::codes())],
            'status' => 'boolean',
        ]);

        $wallet->update($validated);

        return redirect()->route('wallets.index')->with('success', __('Dompet berhasil diperbarui.'));
    }
    
    public function destroy(Wallet $wallet)
    {
        $this->authorizeWallet($wallet);

        if (
            $wallet->transactions()->exists()
            || $wallet->transfersFrom()->exists()
            || $wallet->transfersTo()->exists()
        ) {
            return back()->withErrors([
                'wallet' => __('Dompet yang memiliki riwayat transaksi atau transfer tidak dapat dihapus. Arsipkan dompet ini sebagai gantinya.'),
            ]);
        }

        $wallet->delete();

        return redirect()->route('wallets.index')->with('success', __('Dompet berhasil dihapus.'));
    }

    private function authorizeWallet(Wallet $wallet)
    {
        if ($wallet->user_id !== auth()->id()) {
            abort(403);
        }
    }
}
