import { Head, router, useForm } from '@inertiajs/react';
import { PiggyBank, Plus, Trash2, TrendingDown, Wallet2 } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { formatCurrency } from '@/lib/currency';
import { dashboard } from '@/routes';
import { destroy, index, store } from '@/routes/budgets';
import type { Budget, BudgetFilters, Category } from '@/types';

type Props = {
    budgets: Budget[];
    expenseCategories: Pick<Category, 'id' | 'name'>[];
    currencies: string[];
    filters: BudgetFilters;
};

type BudgetForm = {
    category_id: string;
    amount: string;
    currency: string;
    month: number;
    year: number;
};

const monthNames = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
];

function initialBudgetForm(
    filters: BudgetFilters,
    defaultCurrency: string,
): BudgetForm {
    return {
        category_id: '',
        amount: '',
        currency: defaultCurrency,
        month: filters.month,
        year: filters.year,
    };
}

type CurrencyTotals = Record<
    string,
    { budgeted: number; spent: number; overCount: number; count: number }
>;

export default function Budgets({
    budgets,
    expenseCategories,
    currencies,
    filters,
}: Props) {
    const defaultCurrency = currencies[0] ?? 'IDR';
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingBudget, setDeletingBudget] = useState<Budget | null>(null);
    const [periodFilter, setPeriodFilter] = useState({
        month: filters.month,
        year: filters.year,
    });
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm<BudgetForm>(initialBudgetForm(filters, defaultCurrency));

    // Totals grouped by currency — a budget's amount, spent, and remaining
    // only make sense compared against other budgets in the same currency.
    const totalsByCurrency = budgets.reduce<CurrencyTotals>(
        (totals, budget) => {
            const currency = budget.currency;
            totals[currency] ??= {
                budgeted: 0,
                spent: 0,
                overCount: 0,
                count: 0,
            };
            totals[currency].budgeted += Number(budget.amount);
            totals[currency].spent += Number(budget.spent);
            totals[currency].count += 1;
            if (budget.percentage > 100) totals[currency].overCount += 1;
            return totals;
        },
        {},
    );
    const budgetCurrencies = Object.keys(totalsByCurrency);
    const overBudgetCount = budgets.filter(
        (budget) => budget.percentage > 100,
    ).length;

    // Keyed by "categoryId-currency" since a category can now have a
    // separate budget per currency it's spent in.
    const budgetedKeys = new Set(
        budgets.map((budget) => `${budget.category_id}-${budget.currency}`),
    );
    const canCreateBudget = expenseCategories.length > 0;

    function openCreateDialog() {
        if (!canCreateBudget) return;
        setEditingBudget(null);
        clearErrors();
        reset();
        setData(initialBudgetForm(filters, defaultCurrency));
        setIsDialogOpen(true);
    }

    function openEditDialog(budget: Budget) {
        setEditingBudget(budget);
        clearErrors();
        setData({
            category_id: String(budget.category_id),
            amount: String(budget.amount),
            currency: budget.currency,
            month: budget.month,
            year: budget.year,
        });
        setIsDialogOpen(true);
    }

    function closeDialog() {
        if (processing) return;
        setIsDialogOpen(false);
        setEditingBudget(null);
        clearErrors();
    }

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        // store() upserts by category + month + year + currency, so create and edit both post here.
        post(store.url(), { onSuccess: closeDialog });
    }

    function applyPeriodFilter(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        router.get(index.url(), periodFilter, {
            preserveState: true,
            replace: true,
        });
    }

    function deleteBudget(budget: Budget) {
        setDeletingBudget(budget);
        setIsDeleteDialogOpen(true);
    }

    function closeDeleteDialog() {
        if (processing) return;
        setIsDeleteDialogOpen(false);
        setDeletingBudget(null);
    }

    function confirmDelete() {
        if (!deletingBudget) return;
        router.delete(destroy.url(deletingBudget), {
            onSuccess: closeDeleteDialog,
        });
    }

    return (
        <>
            <Head title="Budget" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Budget
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Atur batas pengeluaran per kategori tiap bulan.
                        </p>
                    </div>
                    <Button
                        onClick={openCreateDialog}
                        disabled={!canCreateBudget}
                    >
                        <Plus />
                        Tambah budget
                    </Button>
                </div>

                {!canCreateBudget && (
                    <Card className="border-dashed">
                        <CardContent className="py-5 text-sm text-muted-foreground">
                            Buat minimal satu kategori pengeluaran sebelum
                            menetapkan budget.
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Periode</CardTitle>
                        <CardDescription>
                            Pilih bulan dan tahun yang ingin dilihat.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form
                            className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]"
                            onSubmit={applyPeriodFilter}
                        >
                            <div className="grid gap-2">
                                <Label htmlFor="filter-month">Bulan</Label>
                                <Select
                                    value={String(periodFilter.month)}
                                    onValueChange={(value) =>
                                        setPeriodFilter((current) => ({
                                            ...current,
                                            month: Number(value),
                                        }))
                                    }
                                >
                                    <SelectTrigger
                                        id="filter-month"
                                        className="w-full"
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {monthNames.map((name, monthIndex) => (
                                            <SelectItem
                                                key={name}
                                                value={String(monthIndex + 1)}
                                            >
                                                {name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="filter-year">Tahun</Label>
                                <Input
                                    id="filter-year"
                                    type="number"
                                    min="2000"
                                    value={periodFilter.year}
                                    onChange={(event) =>
                                        setPeriodFilter((current) => ({
                                            ...current,
                                            year: Number(event.target.value),
                                        }))
                                    }
                                />
                            </div>
                            <div className="flex items-end">
                                <Button
                                    type="submit"
                                    className="w-full sm:w-auto"
                                >
                                    Tampilkan
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {budgetCurrencies.length <= 1 ? (
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total budget
                                </CardTitle>
                                <PiggyBank className="size-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold tracking-tight">
                                    {formatCurrency(
                                        totalsByCurrency[budgetCurrencies[0]]
                                            ?.budgeted ?? 0,
                                        budgetCurrencies[0] ?? defaultCurrency,
                                    )}
                                </div>
                                <CardDescription className="mt-1 text-xs">
                                    {monthNames[filters.month - 1]}{' '}
                                    {filters.year}
                                </CardDescription>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total terpakai
                                </CardTitle>
                                <Wallet2 className="size-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold tracking-tight">
                                    {formatCurrency(
                                        totalsByCurrency[budgetCurrencies[0]]
                                            ?.spent ?? 0,
                                        budgetCurrencies[0] ?? defaultCurrency,
                                    )}
                                </div>
                                <CardDescription className="mt-1 text-xs">
                                    Sisa{' '}
                                    {formatCurrency(
                                        Math.max(
                                            (totalsByCurrency[
                                                budgetCurrencies[0]
                                            ]?.budgeted ?? 0) -
                                                (totalsByCurrency[
                                                    budgetCurrencies[0]
                                                ]?.spent ?? 0),
                                            0,
                                        ),
                                        budgetCurrencies[0] ?? defaultCurrency,
                                    )}
                                </CardDescription>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Melebihi budget
                                </CardTitle>
                                <TrendingDown className="size-4 text-rose-600 dark:text-rose-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold tracking-tight">
                                    {overBudgetCount}
                                </div>
                                <CardDescription className="mt-1 text-xs">
                                    dari {budgets.length} kategori berbudget
                                </CardDescription>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Ringkasan per mata uang</CardTitle>
                            <CardDescription>
                                Total budget dipisah per mata uang —{' '}
                                {overBudgetCount} dari {budgets.length} kategori
                                melebihi budget.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-3 sm:grid-cols-2">
                            {budgetCurrencies.map((currency) => {
                                const totals = totalsByCurrency[currency];
                                return (
                                    <div
                                        key={currency}
                                        className="rounded-lg border p-4"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">
                                                {currency}
                                            </span>
                                            {totals.overCount > 0 && (
                                                <Badge variant="destructive">
                                                    {totals.overCount} melebihi
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {formatCurrency(
                                                totals.spent,
                                                currency,
                                            )}{' '}
                                            dari{' '}
                                            {formatCurrency(
                                                totals.budgeted,
                                                currency,
                                            )}
                                        </p>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Rincian budget</CardTitle>
                        <CardDescription>
                            Progres pengeluaran dibandingkan batas budget per
                            kategori.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {budgets.length === 0 ? (
                            <div className="flex min-h-56 flex-col items-center justify-center rounded-lg border border-dashed px-4 text-center">
                                <PiggyBank className="mb-3 size-8 text-muted-foreground" />
                                <p className="font-medium">
                                    Belum ada budget untuk periode ini
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Tetapkan budget per kategori pengeluaran
                                    untuk memantau pengeluaran Anda.
                                </p>
                                {canCreateBudget && (
                                    <Button
                                        className="mt-4"
                                        onClick={openCreateDialog}
                                    >
                                        <Plus />
                                        Tambah budget
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {budgets.map((budget) => {
                                    const isOverBudget =
                                        budget.percentage > 100;
                                    const barWidth = Math.min(
                                        budget.percentage,
                                        100,
                                    );

                                    return (
                                        <div
                                            key={budget.id}
                                            className="rounded-lg border p-4"
                                        >
                                            <div className="flex flex-wrap items-start justify-between gap-2">
                                                <div>
                                                    <div className="flex items-center gap-2 font-medium">
                                                        {budget.category.name}
                                                        <Badge variant="outline">
                                                            {budget.currency}
                                                        </Badge>
                                                        {isOverBudget && (
                                                            <Badge variant="destructive">
                                                                Melebihi budget
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        {formatCurrency(
                                                            Number(
                                                                budget.spent,
                                                            ),
                                                            budget.currency,
                                                        )}{' '}
                                                        dari{' '}
                                                        {formatCurrency(
                                                            Number(
                                                                budget.amount,
                                                            ),
                                                            budget.currency,
                                                        )}
                                                        {' · '}
                                                        {budget.percentage}%
                                                        terpakai
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            openEditDialog(
                                                                budget,
                                                            )
                                                        }
                                                    >
                                                        Ubah
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() =>
                                                            deleteBudget(budget)
                                                        }
                                                        aria-label={`Hapus budget ${budget.category.name}`}
                                                    >
                                                        <Trash2 />
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                                                <div
                                                    className={`h-full rounded-full transition-all ${
                                                        isOverBudget
                                                            ? 'bg-rose-500'
                                                            : 'bg-emerald-500'
                                                    }`}
                                                    style={{
                                                        width: `${barWidth}%`,
                                                    }}
                                                />
                                            </div>

                                            <p className="mt-2 text-xs text-muted-foreground">
                                                Sisa:{' '}
                                                {formatCurrency(
                                                    Math.max(
                                                        Number(
                                                            budget.remaining,
                                                        ),
                                                        0,
                                                    ),
                                                    budget.currency,
                                                )}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog
                open={isDialogOpen}
                onOpenChange={(open) => !open && closeDialog()}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingBudget ? 'Ubah budget' : 'Tambah budget'}
                        </DialogTitle>
                        <DialogDescription>
                            Budget berlaku untuk {monthNames[data.month - 1]}{' '}
                            {data.year}.
                        </DialogDescription>
                    </DialogHeader>

                    <form className="grid gap-4" onSubmit={submit}>
                        <div className="grid gap-2">
                            <Label htmlFor="budget-category">Kategori</Label>
                            <Select
                                value={data.category_id}
                                onValueChange={(value) =>
                                    setData('category_id', value)
                                }
                                disabled={Boolean(editingBudget)}
                            >
                                <SelectTrigger
                                    id="budget-category"
                                    className="w-full"
                                >
                                    <SelectValue placeholder="Pilih kategori pengeluaran" />
                                </SelectTrigger>
                                <SelectContent>
                                    {expenseCategories.map((category) => (
                                        <SelectItem
                                            key={category.id}
                                            value={String(category.id)}
                                        >
                                            {category.name}
                                            {budgetedKeys.has(
                                                `${category.id}-${data.currency}`,
                                            ) && !editingBudget
                                                ? ` (sudah ada budget ${data.currency})`
                                                : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.category_id} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="budget-currency">Mata uang</Label>
                            <Select
                                value={data.currency}
                                onValueChange={(value) =>
                                    setData('currency', value)
                                }
                                disabled={Boolean(editingBudget)}
                            >
                                <SelectTrigger
                                    id="budget-currency"
                                    className="w-full"
                                >
                                    <SelectValue placeholder="Pilih mata uang" />
                                </SelectTrigger>
                                <SelectContent>
                                    {currencies.map((code) => (
                                        <SelectItem key={code} value={code}>
                                            {code}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.currency} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="budget-amount">Jumlah budget</Label>
                            <Input
                                id="budget-amount"
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={data.amount}
                                onChange={(event) =>
                                    setData('amount', event.target.value)
                                }
                                placeholder="0"
                                autoFocus
                            />
                            <InputError message={errors.amount} />
                        </div>

                        <DialogFooter className="mt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeDialog}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {editingBudget
                                    ? 'Simpan perubahan'
                                    : 'Buat budget'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            <Dialog
                open={isDeleteDialogOpen}
                onOpenChange={(open) => !open && closeDeleteDialog()}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus budget</DialogTitle>
                        <DialogDescription>
                            Hapus budget untuk “{deletingBudget?.category.name}”
                            ({deletingBudget?.currency})?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={closeDeleteDialog}
                            disabled={processing}
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            onClick={confirmDelete}
                            disabled={processing}
                            className="text-destructive"
                        >
                            Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

Budgets.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Budget', href: index() },
    ],
};
