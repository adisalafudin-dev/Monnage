<?php

namespace App\Http\Controllers;

use App\Models\Wallet;
use Illuminate\Http\Request;
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
            'description' => 'nullable|string',
            'balance' => 'required|numeric|min:0',
            'status' => 'boolean',
        ]);

        $request->user()->wallets()->create($validated);

        return redirect()->route('wallets.index')->with('success', 'Dompet berhasil dibuat.');
    }

    public function update(Request $request, Wallet $wallet)
    {
        $this->authorizeWallet($wallet);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'balance' => 'required|numeric|min:0',
            'status' => 'boolean',
        ]);

        $wallet->update($validated);

        return redirect()->route('wallets.index')->with('success', 'Dompet berhasil diperbarui.');
    }

    public function destroy(Wallet $wallet)
    {
        $this->authorizeWallet($wallet);

        $wallet->delete();

        return redirect()->route('wallets.index')->with('success', 'Dompet berhasil dihapus.');
    }

    private function authorizeWallet(Wallet $wallet)
    {
        if ($wallet->user_id !== auth()->id) {
            abort(403);
        }
    }
}