<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Support\Currency;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
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

        // Spending grouped by (category, currency) — a category can be funded
        // from wallets in different currencies, so totals must stay separated
        // instead of being summed together into a meaningless number.
        $spending = DB::table('transactions')
            ->join('wallets', 'wallets.id', '=', 'transactions.wallet_id')
            ->where('wallets.user_id', $request->user()->id)
            ->whereMonth('transacted_at', $month)
            ->whereYear('transacted_at', $year)
            ->groupBy('category_id', 'wallets.currency')
            ->select('category_id', 'wallets.currency as currency', DB::raw('SUM(amount) as spent'))
            ->get()
            ->keyBy(fn ($row) => $row->category_id.'|'.$row->currency);

        $budgets = $budgets->map(function ($budget) use ($spending) {
            $key = $budget->category_id.'|'.$budget->currency;
            $budget->spent = (float) ($spending[$key]->spent ?? 0);
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
            'currencies' => Currency::codes(),
            'filters' => ['month' => $month, 'year' => $year],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'amount' => 'required|numeric|min:0.01',
            'currency' => ['required', 'string', 'size:3', Rule::in(Currency::codes())],
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
                'currency' => $validated['currency'],
            ],
            ['amount' => $validated['amount']]
        );

        return redirect()->route('budgets.index', ['month' => $validated['month'], 'year' => $validated['year']])
            ->with('success', 'Budget berhasil disimpan.');
    }

    public function destroy(Budget $budget)
    {
        if ($budget->user_id !== auth()->id()) {
            abort(403);
        }

        $budget->delete();

        return redirect()->back()->with('success', 'Budget berhasil dihapus.');
    }
}