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

        $totalBalance = $request->user()->wallets()->sum('balance');

        $totalIncome = DB::table('transactions')
            ->join('wallets', 'wallets.id', '=', 'transactions.wallet_id')
            ->join('categories', 'categories.id', '=', 'transactions.category_id')
            ->where('wallets.user_id', $userId)
            ->where('categories.type', 'income')
            ->sum('transactions.amount');

        $totalExpense = DB::table('transactions')
            ->join('wallets', 'wallets.id', '=', 'transactions.wallet_id')
            ->join('categories', 'categories.id', '=', 'transactions.category_id')
            ->where('wallets.user_id', $userId)
            ->where('categories.type', 'expense')
            ->sum('transactions.amount');

        $monthlySummary = DB::table('transactions')
            ->join('wallets', 'wallets.id', '=', 'transactions.wallet_id')
            ->join('categories', 'categories.id', '=', 'transactions.category_id')
            ->where('wallets.user_id', $userId)
            ->selectRaw("DATE_FORMAT(transacted_at, '%Y-%m') as month")
            ->selectRaw("SUM(CASE WHEN categories.type = 'income' THEN transactions.amount ELSE 0 END) as income")
            ->selectRaw("SUM(CASE WHEN categories.type = 'expense' THEN transactions.amount ELSE 0 END) as expense")
            ->groupBy('month')
            ->orderBy('month')
            ->limit(6)
            ->get();

        return Inertia::render('dashboard', [
            'summary' => [
                'totalBalance' => (float) $totalBalance,
                'totalIncome' => (float) $totalIncome,
                'totalExpense' => (float) $totalExpense,
            ],
            'monthlySummary' => $monthlySummary,
        ]);
    }
}