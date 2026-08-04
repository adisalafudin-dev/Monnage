<?php

namespace App\Http\Controllers;

use App\Models\RecurringTransaction;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class RecurringTransactionController extends Controller
{
    public function index(Request $request)
    {
        $recurringTransactions = $request->user()->recurringTransactions()
            ->with(['wallet:id,title,currency', 'category:id,name,type'])
            ->orderBy('next_due_date')
            ->get();

        $wallets = $request->user()->wallets()->active()->get(['id', 'title', 'currency']);
        $categories = $request->user()->categories()->get(['id', 'name', 'type']);

        return Inertia::render('recurring-transactions/index', [
            'recurringTransactions' => $recurringTransactions,
            'wallets' => $wallets,
            'categories' => $categories,
            'frequencies' => RecurringTransaction::FREQUENCIES,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'wallet_id' => [
                'required',
                Rule::exists('wallets', 'id')
                    ->where('user_id', $request->user()->id)
                    ->where('status', Wallet::STATUS_ACTIVE),
            ],
            'category_id' => [
                'required',
                Rule::exists('categories', 'id')->where('user_id', $request->user()->id),
            ],
            'amount' => 'required|numeric|min:0.01',
            'description' => 'nullable|string|max:5000',
            'frequency' => ['required', Rule::in(RecurringTransaction::FREQUENCIES)],
            'interval' => 'required|integer|min:1|max:365',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $wallet = Wallet::findOrFail($validated['wallet_id']);
        $this->authorizeWallet($wallet, $request);

        $category = $request->user()->categories()->findOrFail($validated['category_id']);

        $request->user()->recurringTransactions()->create([
            ...$validated,
            'next_due_date' => $validated['start_date'],
            'is_active' => true,
        ]);

        return redirect()->route('recurring-transactions.index')
            ->with('success', __('Transaksi berulang berhasil dibuat.'));
    }

    public function update(Request $request, RecurringTransaction $recurringTransaction)
    {
        $this->authorizeRule($recurringTransaction, $request);

        // Schedule shape (wallet, category, frequency, interval, start date) is
        // locked after creation to avoid ambiguity about what should have
        // already happened. Only these fields remain editable.
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'description' => 'nullable|string|max:5000',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_active' => 'boolean',
        ]);

        $recurringTransaction->update($validated);

        return redirect()->route('recurring-transactions.index')
            ->with('success', __('Transaksi berulang berhasil diperbarui.'));
    }

    public function destroy(Request $request, RecurringTransaction $recurringTransaction)
    {
        $this->authorizeRule($recurringTransaction, $request);

        $recurringTransaction->delete();

        return redirect()->route('recurring-transactions.index')
            ->with('success', __('Transaksi berulang berhasil dihapus. Riwayat transaksi yang sudah dibuat tidak ikut terhapus.'));
    }

    private function authorizeWallet(Wallet $wallet, Request $request)
    {
        if ($wallet->user_id !== $request->user()->id) {
            abort(403);
        }
    }

    private function authorizeRule(RecurringTransaction $rule, Request $request)
    {
        if ($rule->user_id !== $request->user()->id) {
            abort(403);
        }
    }
}
