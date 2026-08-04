<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Transaction;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TransactionController extends Controller
{
   public function index(Request $request)
    {
        $request->validate([
            'wallet_id' => 'nullable|exists:wallets,id',
            'category_id' => 'nullable|exists:categories,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
        ]);

        $filteredQuery = $this->filteredTransactionsQuery($request);

        $transactions = $filteredQuery()
            ->with(['wallet:id,title,currency', 'category:id,name,type'])
            ->latest('transacted_at')
            ->paginate(20)
            ->withQueryString();

        $totals = $filteredQuery()
            ->join('wallets', 'wallets.id', '=', 'transactions.wallet_id')
            ->join('categories', 'categories.id', '=', 'transactions.category_id')
            ->groupBy('wallets.currency')
            ->select('wallets.currency as currency')
            ->selectRaw("SUM(CASE WHEN categories.type = 'income' THEN transactions.amount ELSE 0 END) as income")
            ->selectRaw("SUM(CASE WHEN categories.type = 'expense' THEN transactions.amount ELSE 0 END) as expense")
            ->selectRaw('COUNT(*) as count')
            ->get();

        $wallets = $request->user()->wallets()->get(['id', 'title', 'currency', 'status']);
        $categories = $request->user()->categories()->get(['id', 'name', 'type']);

        return Inertia::render('transactions/index', [
            'transactions' => $transactions,
            'totals' => $totals,
            'wallets' => $wallets,
            'categories' => $categories,
            'filters' => $request->only(['wallet_id', 'category_id', 'start_date', 'end_date']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'wallet_id' => [
                'required',
                Rule::exists("wallets", 'id')
                ->where("user_id", $request->user()->id)
                ->where('status', Wallet::STATUS_ACTIVE)
            ],
            'category_id' => 'required|exists:categories,id',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'nullable|string',
            'transacted_at' => 'required|date',
        ]);

        DB::transaction(function () use ($request, $validated) {
            $wallet = Wallet::query()
                ->lockForUpdate()
                ->findOrFail($validated['wallet_id']);
            $this->authorizeWallet($wallet, $request);

            $category = $request->user()->categories()
                ->findOrFail($validated['category_id']);
            $transaction = $wallet->transactions()->create($validated);

            $this->adjustBalance($wallet, $category, $transaction->amount, 1);
        });

        return redirect()->route('transactions.index')->with('success', __('Transaksi berhasil dicatat.'));
    }

    public function update(Request $request, Transaction $transaction)
    {
        $validated = $request->validate([
            'wallet_id' => [
                'required',
                Rule::exists("wallets", 'id')
                ->where("user_id", $request->user()->id)
            ],
            'category_id' => 'required|exists:categories,id',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'nullable|string',
            'transacted_at' => 'required|date',
        ]);



        DB::transaction(function () use ($request, $transaction, $validated) {
            $currentTransaction = Transaction::query()
                ->with(['wallet', 'category'])
                ->lockForUpdate()
                ->findOrFail($transaction->id);
            $this->authorizeWallet($currentTransaction->wallet, $request);

            $movingToDifferentWallet = (int) $validated['wallet_id'] !== $currentTransaction->wallet_id;
            if ($movingToDifferentWallet) {
                $newWallet = Wallet::query()->lockForUpdate()->findOrFail($validated['wallet_id']);
                $this->authorizeWallet($newWallet, $request);
                abort_if(! $newWallet->status, 422, __('Dompet tujuan sudah diarsipkan.'));
            }

            $wallet = Wallet::query()
                ->lockForUpdate()
                ->findOrFail($validated['wallet_id']);
            $this->authorizeWallet($wallet, $request);
            $category = $request->user()->categories()
                ->findOrFail($validated['category_id']);

            $this->adjustBalance(
                $currentTransaction->wallet,
                $currentTransaction->category,
                $currentTransaction->amount,
                -1,
            );

            $currentTransaction->update($validated);
            $this->adjustBalance($wallet, $category, $validated['amount'], 1);
        });

        return redirect()->route('transactions.index')->with('success', __('Transaksi berhasil diperbarui.'));
    }

    public function destroy(Request $request, Transaction $transaction)
    {
        DB::transaction(function () use ($request, $transaction) {
            $currentTransaction = Transaction::query()
                ->with(['wallet', 'category'])
                ->lockForUpdate()
                ->findOrFail($transaction->id);
            $this->authorizeWallet($currentTransaction->wallet, $request);

            $this->adjustBalance(
                $currentTransaction->wallet,
                $currentTransaction->category,
                $currentTransaction->amount,
                -1,
            );
            $currentTransaction->delete();
        });

        return redirect()->route('transactions.index')->with('success', __('Transaksi berhasil dihapus.'));
    }

      public function export(Request $request): StreamedResponse
    {
        $request->validate([
            'wallet_id' => 'nullable|exists:wallets,id',
            'category_id' => 'nullable|exists:categories,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
        ]);

        $filteredQuery = $this->filteredTransactionsQuery($request);

        $filename = 'monnage-transaksi-'.now()->format('Y-m-d_His').'.csv';

        $callback = function () use ($filteredQuery) {
            $handle = fopen('php://output', 'w');

            // UTF-8 BOM so Excel opens IDR/currency symbols and non-ASCII
            // descriptions correctly instead of mangling the encoding.
            fwrite($handle, "\xEF\xBB\xBF");

            fputcsv($handle, ['Tanggal', 'Dompet', 'Mata Uang', 'Kategori', 'Tipe', 'Nominal', 'Keterangan']);

            $filteredQuery()
                ->with(['wallet:id,title,currency', 'category:id,name,type'])
                ->orderBy('transacted_at')
                ->cursor()
                ->each(function (Transaction $transaction) use ($handle) {
                    fputcsv($handle, [
                        $transaction->transacted_at->format('Y-m-d H:i'),
                        $transaction->wallet->title,
                        $transaction->wallet->currency,
                        $transaction->category->name,
                        $transaction->category->type === 'income' ? 'Pemasukan' : 'Pengeluaran',
                        (string) $transaction->amount,
                        $transaction->description ?? '',
                    ]);
                });

            fclose($handle);
        };

        return response()->streamDownload($callback, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }


    private function filteredTransactionsQuery(Request $request): \Closure
    {
        $userId = $request->user()->id;

        return fn () => Transaction::query()
            ->whereHas('wallet', fn ($q) => $q->where('user_id', $userId))
            ->when($request->wallet_id, fn ($q) => $q->where('wallet_id', $request->wallet_id))
            ->when($request->category_id, fn ($q) => $q->where('category_id', $request->category_id))
            ->when($request->start_date, fn ($q) => $q->whereDate('transacted_at', '>=', $request->start_date))
            ->when($request->end_date, fn ($q) => $q->whereDate('transacted_at', '<=', $request->end_date));
    }

    private function adjustBalance(Wallet $wallet, Category $category, $amount, int $direction)
    {
        $sign = $category->type === 'income' ? 1 : -1;
        $wallet->increment('balance', $sign * $direction * $amount);
    }

    private function authorizeWallet(Wallet $wallet, Request $request)
    {
        if ($wallet->user_id !== $request->user()->id) {
            abort(403);
        }
    }
}
