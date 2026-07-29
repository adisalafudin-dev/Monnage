<?php

namespace App\Http\Controllers;

use App\Models\WalletTransfer;
use App\Http\Requests\StoreWalletTransferRequest;
use App\Http\Requests\UpdateWalletTransferRequest;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class WalletTransferController extends Controller
{
    public function index(Request $request)
    {
        $transfers = WalletTransfer::query()
            ->whereHas('fromWallet', fn ($q) => $q->where('user_id', $request->user()->id))
            ->with(['fromWallet:id,title', 'toWallet:id,title'])
            ->latest('transferred_at')
            ->get();
 
        $wallets = $request->user()->wallets()->get(['id', 'title', 'balance']);
 
        return Inertia::render('transfers/index', [
            'transfers' => $transfers,
            'wallets' => $wallets,
        ]);
    }
 
    public function store(Request $request)
    {
        $validated = $request->validate([
            'from_wallet_id' => 'required|exists:wallets,id|different:to_wallet_id',
            'to_wallet_id' => 'required|exists:wallets,id',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'nullable|string',
            'transferred_at' => 'required|date',
        ]);
 
        DB::transaction(function () use ($request, $validated) {
            // Lock both wallets in a consistent order (by id) to avoid deadlocks
            // when two transfers between the same pair of wallets run concurrently.
            $walletIds = collect([$validated['from_wallet_id'], $validated['to_wallet_id']])->sort()->values();
            $wallets = Wallet::query()
                ->whereIn('id', $walletIds)
                ->lockForUpdate()
                ->orderBy('id')
                ->get()
                ->keyBy('id');
 
            $fromWallet = $wallets->get($validated['from_wallet_id']);
            $toWallet = $wallets->get($validated['to_wallet_id']);
 
            $this->authorizeWallet($fromWallet, $request);
            $this->authorizeWallet($toWallet, $request);
 
            if ($fromWallet->balance < $validated['amount']) {
                throw ValidationException::withMessages([
                    'amount' => 'Saldo dompet asal tidak mencukupi.',
                ]);
            }
 
            $transfer = WalletTransfer::create($validated);
 
            $fromWallet->decrement('balance', $validated['amount']);
            $toWallet->increment('balance', $validated['amount']);
        });
 
        return redirect()->route('transfers.index')->with('success', 'Transfer berhasil dicatat.');
    }
 
    public function update(Request $request, WalletTransfer $transfer)
    {
        $validated = $request->validate([
            'from_wallet_id' => 'required|exists:wallets,id|different:to_wallet_id',
            'to_wallet_id' => 'required|exists:wallets,id',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'nullable|string',
            'transferred_at' => 'required|date',
        ]);
 
        DB::transaction(function () use ($request, $transfer, $validated) {
            $currentTransfer = WalletTransfer::query()
                ->lockForUpdate()
                ->findOrFail($transfer->id);
 
            // Lock every wallet touched by either the old or the new transfer, in a
            // consistent order, to avoid deadlocks and to make sure the reversal
            // below and the re-application further down see the same locked rows.
            $walletIds = collect([
                $currentTransfer->from_wallet_id,
                $currentTransfer->to_wallet_id,
                $validated['from_wallet_id'],
                $validated['to_wallet_id'],
            ])->unique()->sort()->values();
 
            $wallets = Wallet::query()
                ->whereIn('id', $walletIds)
                ->lockForUpdate()
                ->orderBy('id')
                ->get()
                ->keyBy('id');
 
            foreach ($wallets as $wallet) {
                $this->authorizeWallet($wallet, $request);
            }
 
            // Reverse the original transfer's effect on balances first.
            $wallets->get($currentTransfer->from_wallet_id)->increment('balance', $currentTransfer->amount);
            $wallets->get($currentTransfer->to_wallet_id)->decrement('balance', $currentTransfer->amount);
 
            $fromWallet = $wallets->get($validated['from_wallet_id']);
            $toWallet = $wallets->get($validated['to_wallet_id']);
 
            if ($fromWallet->balance < $validated['amount']) {
                throw ValidationException::withMessages([
                    'amount' => 'Saldo dompet asal tidak mencukupi.',
                ]);
            }
 
            $currentTransfer->update($validated);
 
            $fromWallet->decrement('balance', $validated['amount']);
            $toWallet->increment('balance', $validated['amount']);
        });
 
        return redirect()->route('transfers.index')->with('success', 'Transfer berhasil diperbarui.');
    }
 
    public function destroy(Request $request, WalletTransfer $transfer)
    {
        DB::transaction(function () use ($request, $transfer) {
            $currentTransfer = WalletTransfer::query()
                ->lockForUpdate()
                ->findOrFail($transfer->id);
 
            $walletIds = collect([$currentTransfer->from_wallet_id, $currentTransfer->to_wallet_id])->sort()->values();
            $wallets = Wallet::query()
                ->whereIn('id', $walletIds)
                ->lockForUpdate()
                ->orderBy('id')
                ->get()
                ->keyBy('id');
 
            foreach ($wallets as $wallet) {
                $this->authorizeWallet($wallet, $request);
            }
 
            $wallets->get($currentTransfer->from_wallet_id)->increment('balance', $currentTransfer->amount);
            $wallets->get($currentTransfer->to_wallet_id)->decrement('balance', $currentTransfer->amount);
 
            $currentTransfer->delete();
        });
 
        return redirect()->route('transfers.index')->with('success', 'Transfer berhasil dihapus.');
    }
 
    private function authorizeWallet(Wallet $wallet, Request $request)
    {
        if ($wallet->user_id !== $request->user()->id) {
            abort(403);
        }
    }
}
