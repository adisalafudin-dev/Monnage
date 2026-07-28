<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BudgetController extends Controller
{
    public function index(Request $request)
    {
        $month = $request->integer('month', now()->month);
        $year = $request->integer('year', now()->year);

        $budgets = $request->user()->budgets()
            ->with('category:id,name,type')
            ->where('month', $month)
            ->where('year', $year)
            ->get();

        $spending = DB::table('transactions')
            ->join('wallets', 'wallets.id', '=', 'transactions.wallet_id')
            ->where('wallets.user_id', $request->user()->id)
            ->whereMonth('transacted_at', $month)
            ->whereYear('transacted_at', $year)
            ->groupBy('category_id')
            ->select('category_id', DB::raw('SUM(amount) as spent'))
            ->pluck('spent', 'category_id');

        $budgets = $budgets->map(function ($budget) use ($spending) {
            $budget->spent = (float) ($spending[$budget->category_id] ?? 0);
            $budget->remaining = (float) $budget->amount - $budget->spent;
            $budget->percentage = $budget->amount > 0
                ? round(($budget->spent / $budget->amount) * 100, 1)
                : 0;
            return $budget;
        });

        $expenseCategories = $request->user()->categories()
            ->where('type', 'expense')
            ->get(['id', 'name']);

        return Inertia::render('budgets/index', [
            'budgets' => $budgets,
            'expenseCategories' => $expenseCategories,
            'filters' => ['month' => $month, 'year' => $year],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'amount' => 'required|numeric|min:0.01',
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2000',
        ]);

        $category = $request->user()->categories()->findOrFail($validated['category_id']);

        if ($category->type !== 'expense') {
            return back()->withErrors(['category_id' => 'Budget hanya berlaku untuk kategori pengeluaran.']);
        }

        $request->user()->budgets()->updateOrCreate(
            [
                'category_id' => $validated['category_id'],
                'month' => $validated['month'],
                'year' => $validated['year'],
            ],
            ['amount' => $validated['amount']]
        );

        return redirect()->route('budgets.index', ['month' => $validated['month'], 'year' => $validated['year']])
            ->with('success', 'Budget berhasil disimpan.');
    }

    public function destroy(Budget $budget)
    {
        if ($budget->user_id !== auth()->id) {
            abort(403);
        }

        $budget->delete();

        return redirect()->back()->with('success', 'Budget berhasil dihapus.');
    }
}