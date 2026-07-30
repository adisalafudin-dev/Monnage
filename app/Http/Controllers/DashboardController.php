<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
public function index(Request $request)
    {
        $userId = $request->user()->id;

        $balancesByCurrency = $request->user()->wallets()
            ->selectRaw('currency, SUM(balance) as total')
            ->groupBy('currency')
            ->pluck('total', 'currency');

        $totalsByCurrency = DB::table('transactions')
            ->join('wallets', 'wallets.id', '=', 'transactions.wallet_id')
            ->join('categories', 'categories.id', '=', 'transactions.category_id')
            ->where('wallets.user_id', $userId)
            ->selectRaw('wallets.currency as currency')
            ->selectRaw("SUM(CASE WHEN categories.type = 'income' THEN transactions.amount ELSE 0 END) as income")
            ->selectRaw("SUM(CASE WHEN categories.type = 'expense' THEN transactions.amount ELSE 0 END) as expense")
            ->groupBy('wallets.currency')
            ->get()
            ->keyBy('currency');

        $currencies = $balancesByCurrency->keys()->merge($totalsByCurrency->keys())->unique();

        $summary = $currencies->map(fn ($currency) => [
            'currency' => $currency,
            'totalBalance' => (float) ($balancesByCurrency[$currency] ?? 0),
            'totalIncome' => (float) ($totalsByCurrency[$currency]->income ?? 0),
            'totalExpense' => (float) ($totalsByCurrency[$currency]->expense ?? 0),
        ])->values();

        $monthlySummaryRows = DB::table('transactions')
            ->join('wallets', 'wallets.id', '=', 'transactions.wallet_id')
            ->join('categories', 'categories.id', '=', 'transactions.category_id')
            ->where('wallets.user_id', $userId)
            ->selectRaw("TO_CHAR(transacted_at, 'YYYY-MM') as month")
            ->selectRaw('wallets.currency as currency')
            ->selectRaw("SUM(CASE WHEN categories.type = 'income' THEN transactions.amount ELSE 0 END) as income")
            ->selectRaw("SUM(CASE WHEN categories.type = 'expense' THEN transactions.amount ELSE 0 END) as expense")
            ->groupBy('month', 'wallets.currency')
            ->orderBy('month')
            ->get();

        $monthlySummary = $monthlySummaryRows
            ->groupBy('currency')
            ->map(fn ($rows, $currency) => [
                'currency' => $currency,
                'data' => $rows->map(fn ($row) => [
                    'month' => $row->month,
                    'income' => (float) $row->income,
                    'expense' => (float) $row->expense,
                ])->values(),
            ])
            ->values();

        return Inertia::render('dashboard', [
            'summary' => $summary,
            'monthlySummary' => $monthlySummary,
        ]);
    }
}
