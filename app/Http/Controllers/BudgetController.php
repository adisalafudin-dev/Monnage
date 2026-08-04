<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\MonthlyBudget;
use App\Support\Currency;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class BudgetController extends Controller
{
    /** Hard cap on how many months a rollover chain will walk backward. */
    private const MAX_ROLLOVER_LOOKBACK = 12;

    public function index(Request $request)
    {
        $userId = $request->user()->id;
        $month = $request->integer('month', now()->month);
        $year = $request->integer('year', now()->year);

        $budgets = $request->user()->budgets()
            ->with('category:id,name,type')
            ->where('month', $month)
            ->where('year', $year)
            ->get();

        $spending = $this->spendingByCategory($userId, $month, $year);

        $budgets = $budgets->map(function ($budget) use ($spending, $userId) {
            $key = $budget->category_id.'|'.$budget->currency;
            $budget->spent = (float) ($spending[$key]->spent ?? 0);

            $budget->rolled_in = 0.0;
            if ($budget->rollover) {
                [$prevMonth, $prevYear] = $this->previousPeriod($budget->month, $budget->year);
                $budget->rolled_in = $this->resolveRolledIn(
                    $userId,
                    $budget->category_id,
                    $budget->currency,
                    $prevMonth,
                    $prevYear,
                    self::MAX_ROLLOVER_LOOKBACK - 1,
                );
            }

            $budget->available = (float) $budget->amount + $budget->rolled_in;
            $budget->remaining = $budget->available - $budget->spent;
            $budget->percentage = $budget->available > 0
                ? round(($budget->spent / $budget->available) * 100, 1)
                : 0;

            return $budget;
        });

        $overallBudgets = $this->overallBudgetSummary($request, $month, $year, $budgets);

        $expenseCategories = $request->user()->categories()
            ->where('type', 'expense')
            ->get(['id', 'name']);

        return Inertia::render('budgets/index', [
            'budgets' => $budgets,
            'overallBudgets' => $overallBudgets,
            'expenseCategories' => $expenseCategories,
            'currencies' => Currency::codes(),
            'filters' => ['month' => $month, 'year' => $year],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => [
                'required',
                Rule::exists('categories', 'id')->where('user_id', $request->user()->id),
            ],
            'amount' => 'required|numeric|min:0.01',
            'currency' => ['required', 'string', 'size:3', Rule::in(Currency::codes())],
            'rollover' => 'boolean',
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2000',
        ]);

        $category = $request->user()->categories()->findOrFail($validated['category_id']);

        if ($category->type !== 'expense') {
            return back()->withErrors(['category_id' => __('Budget hanya berlaku untuk kategori pengeluaran.')]);
        }

        $request->user()->budgets()->updateOrCreate(
            [
                'category_id' => $validated['category_id'],
                'month' => $validated['month'],
                'year' => $validated['year'],
                'currency' => $validated['currency'],
            ],
            [
                'amount' => $validated['amount'],
                'rollover' => $validated['rollover'] ?? false,
            ]
        );

        return redirect()->route('budgets.index', ['month' => $validated['month'], 'year' => $validated['year']])
            ->with('success', __('Budget berhasil disimpan.'));
    }

    public function destroy(Budget $budget)
    {
        if ($budget->user_id !== auth()->id()) {
            abort(403);
        }

        $budget->delete();

        return redirect()->back()->with('success', __('Budget berhasil dihapus.'));
    }

    public function storeOverall(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'currency' => ['required', 'string', 'size:3', Rule::in(Currency::codes())],
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2000',
        ]);

        $request->user()->monthlyBudgets()->updateOrCreate(
            [
                'month' => $validated['month'],
                'year' => $validated['year'],
                'currency' => $validated['currency'],
            ],
            ['amount' => $validated['amount']]
        );

        return redirect()->route('budgets.index', ['month' => $validated['month'], 'year' => $validated['year']])
            ->with('success', __('Total budget bulanan berhasil disimpan.'));
    }

    public function destroyOverall(MonthlyBudget $monthlyBudget)
    {
        if ($monthlyBudget->user_id !== auth()->id()) {
            abort(403);
        }

        $monthlyBudget->delete();

        return redirect()->back()->with('success', __('Total budget bulanan berhasil dihapus.'));
    }

    /**
     * Spending grouped by (category, currency) for a single period —
     * one query shared across every budget row shown for that period.
     */
    private function spendingByCategory(int $userId, int $month, int $year)
    {
        return DB::table('transactions')
            ->join('wallets', 'wallets.id', '=', 'transactions.wallet_id')
            ->where('wallets.user_id', $userId)
            ->whereMonth('transacted_at', $month)
            ->whereYear('transacted_at', $year)
            ->groupBy('category_id', 'wallets.currency')
            ->select('category_id', 'wallets.currency as currency', DB::raw('SUM(amount) as spent'))
            ->get()
            ->keyBy(fn ($row) => $row->category_id.'|'.$row->currency);
    }

    private function spentFor(int $userId, int $categoryId, string $currency, int $month, int $year): float
    {
        return (float) DB::table('transactions')
            ->join('wallets', 'wallets.id', '=', 'transactions.wallet_id')
            ->where('wallets.user_id', $userId)
            ->where('wallets.currency', $currency)
            ->where('transactions.category_id', $categoryId)
            ->whereMonth('transacted_at', $month)
            ->whereYear('transacted_at', $year)
            ->sum('transactions.amount');
    }

    /**
     * Walks backward through consecutive rollover-enabled months to work out
     * how much leftover (or deficit) carries into the requested period.
     * Recomputed on read rather than stored, so editing an old transaction
     * is reflected immediately instead of leaving a stale snapshot.
     */
    private function resolveRolledIn(
        int $userId,
        int $categoryId,
        string $currency,
        int $month,
        int $year,
        int $depthRemaining,
    ): float {
        if ($depthRemaining <= 0) {
            return 0.0;
        }

        $budget = Budget::query()
            ->where('user_id', $userId)
            ->where('category_id', $categoryId)
            ->where('currency', $currency)
            ->where('month', $month)
            ->where('year', $year)
            ->first();

        if (! $budget) {
            return 0.0;
        }

        $spent = $this->spentFor($userId, $categoryId, $currency, $month, $year);

        $rolledIn = 0.0;
        if ($budget->rollover) {
            [$prevMonth, $prevYear] = $this->previousPeriod($month, $year);
            $rolledIn = $this->resolveRolledIn($userId, $categoryId, $currency, $prevMonth, $prevYear, $depthRemaining - 1);
        }

        return ((float) $budget->amount + $rolledIn) - $spent;
    }

    private function previousPeriod(int $month, int $year): array
    {
        return $month === 1 ? [12, $year - 1] : [$month - 1, $year];
    }

    /**
     * Overall cross-category cap per currency, compared against total
     * expense spending for the period (not just spending inside a
     * category that already has its own budget).
     */
    private function overallBudgetSummary(Request $request, int $month, int $year, $budgets)
    {
        $userId = $request->user()->id;

        $caps = $request->user()->monthlyBudgets()
            ->where('month', $month)
            ->where('year', $year)
            ->get()
            ->keyBy('currency');

        $totalSpending = DB::table('transactions')
            ->join('wallets', 'wallets.id', '=', 'transactions.wallet_id')
            ->join('categories', 'categories.id', '=', 'transactions.category_id')
            ->where('wallets.user_id', $userId)
            ->where('categories.type', 'expense')
            ->whereMonth('transacted_at', $month)
            ->whereYear('transacted_at', $year)
            ->groupBy('wallets.currency')
            ->select('wallets.currency as currency', DB::raw('SUM(transactions.amount) as spent'))
            ->get()
            ->keyBy('currency');

        $currencies = $caps->keys()
            ->merge($totalSpending->keys())
            ->merge($budgets->pluck('currency'))
            ->unique()
            ->values();

        return $currencies->map(function ($currency) use ($caps, $totalSpending) {
            $cap = $caps->get($currency);
            $spent = (float) ($totalSpending[$currency]->spent ?? 0);
            $amount = $cap ? (float) $cap->amount : null;

            return [
                'id' => $cap?->id,
                'currency' => $currency,
                'amount' => $amount,
                'spent' => $spent,
                'remaining' => $amount !== null ? $amount - $spent : null,
                'percentage' => $amount ? round(($spent / $amount) * 100, 1) : null,
            ];
        })->values();
    }
}
