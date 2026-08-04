<?php

namespace App\Http\Controllers;

use App\Models\WalletTransfer;
use App\Http\Requests\StoreWalletTransferRequest;
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
            ->with(['fromWallet:id,title,currency', 'toWallet:id,title,currency'])
            ->latest('transferred_at')
            ->get();
 
        $wallets = $request->user()->wallets()->get([
            'id', 'title', 'balance', 'currency', 'status',
        ]);
 
        return Inertia::render('transfers/index', [
            'transfers' => $transfers,
            'wallets' => $wallets,
        ]);
    }
 
public function store(StoreWalletTransferRequest $request)
{
    $validated = $request->validated();

    DB::transaction(function () use ($request, $validated) {
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
                'amount' => __('Saldo dompet asal tidak mencukupi.'),
            ]);
        }

        
        abort_if(! $fromWallet->status || ! $toWallet->status, 422, __('Dompet yang diarsipkan tidak bisa digunakan untuk transfer.'));


        // Same-currency transfers always use rate 1, regardless of what was sent.
        $rate = $fromWallet->currency === $toWallet->currency ? 1 : (float) $validated['exchange_rate'];
        $convertedAmount = round($validated['amount'] * $rate, 2);

        WalletTransfer::create([
            ...$validated,
            'exchange_rate' => $rate,
            'converted_amount' => $convertedAmount,
        ]);

        $fromWallet->decrement('balance', $validated['amount']);
        $toWallet->increment('balance', $convertedAmount);
    });

    return redirect()->route('transfers.index')->with('success', __('Transfer berhasil dicatat.'));
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
            $wallets->get($currentTransfer->to_wallet_id)->decrement('balance', $currentTransfer->converted_amount);
            
            $currentTransfer->delete();
        });
 
        return redirect()->route('transfers.index')->with('success', __('Transfer berhasil dihapus.'));
    }
 
    private function authorizeWallet(Wallet $wallet, Request $request)
    {
        if ($wallet->user_id !== $request->user()->id) {
            abort(403);
        }
    }
}
