import { Head, router, useForm } from '@inertiajs/react';
import {
    PiggyBank,
    Plus,
    RotateCcw,
    Trash2,
    TrendingDown,
    Wallet2,
} from 'lucide-react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
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
import { Checkbox } from '@/components/ui/checkbox';
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
import storeOverall from '@/routes/budgets/overall';
import type { Budget, BudgetFilters, Category, OverallBudget } from '@/types';

type Props = {
    budgets: Budget[];
    overallBudgets: OverallBudget[];
    expenseCategories: Pick<Category, 'id' | 'name'>[];
    currencies: string[];
    filters: BudgetFilters;
};

type BudgetForm = {
    category_id: string;
    amount: string;
    currency: string;
    rollover: boolean;
    month: number;
    year: number;
};

type OverallForm = {
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
        rollover: false,
        month: filters.month,
        year: filters.year,
    };
}

function initialOverallForm(
    filters: BudgetFilters,
    currency: string,
): OverallForm {
    return { amount: '', currency, month: filters.month, year: filters.year };
}

type CurrencyTotals = Record<
    string,
    { budgeted: number; spent: number; overCount: number; count: number }
>;

export default function Budgets({
    budgets,
    overallBudgets,
    expenseCategories,
    currencies,
    filters,
}: Props) {
    const { t } = useLaravelReactI18n();
    const defaultCurrency = currencies[0] ?? 'IDR';
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingBudget, setDeletingBudget] = useState<Budget | null>(null);
    const [isOverallDialogOpen, setIsOverallDialogOpen] = useState(false);
    const [deletingOverall, setDeletingOverall] =
        useState<OverallBudget | null>(null);
    const [periodFilter, setPeriodFilter] = useState({
        month: filters.month,
        year: filters.year,
    });

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm<BudgetForm>(initialBudgetForm(filters, defaultCurrency));

    const overallForm = useForm<OverallForm>(
        initialOverallForm(filters, defaultCurrency),
    );

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
            totals[currency].budgeted += Number(budget.available);
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
            rollover: budget.rollover,
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

    function openOverallDialog(currency: string) {
        const existing = overallBudgets.find((o) => o.currency === currency);
        overallForm.clearErrors();
        overallForm.setData({
            amount: existing?.amount ? String(existing.amount) : '',
            currency,
            month: filters.month,
            year: filters.year,
        });
        setIsOverallDialogOpen(true);
    }

    function closeOverallDialog() {
        if (overallForm.processing) return;
        setIsOverallDialogOpen(false);
    }

    function submitOverall(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        overallForm.post(storeOverall.url(), { onSuccess: closeOverallDialog });
    }

    function confirmDeleteOverall() {
        if (!deletingOverall?.id) return;
        router.delete(
            destroyOverall.url({ monthlyBudget: deletingOverall.id }),
            {
                onSuccess: () => setDeletingOverall(null),
            },
        );
    }

    return (
        <>
            <Head title={t('Budget')} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {t('Budget')}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {t('Atur batas pengeluaran per kategori tiap bulan.')}
                        </p>
                    </div>
                    <Button
                        onClick={openCreateDialog}
                        disabled={!canCreateBudget}
                    >
                        <Plus /> {t('Tambah budget')}
                    </Button>
                </div>

                {!canCreateBudget && (
                    <Card className="border-dashed">
                        <CardContent className="py-5 text-sm text-muted-foreground">
                            {t(
                                'Buat minimal satu kategori pengeluaran sebelum menetapkan budget.',
                            )}
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>{t('Periode')}</CardTitle>
                        <CardDescription>
                            {t('Pilih bulan dan tahun yang ingin dilihat.')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form
                            className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]"
                            onSubmit={applyPeriodFilter}
                        >
                            <div className="grid gap-2">
                                <Label htmlFor="filter-month">{t('Bulan')}</Label>
                                <Select
                                    value={String(periodFilter.month)}
                                    onValueChange={(value) =>
                                        setPeriodFilter((c) => ({
                                            ...c,
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
                                        {monthNames.map((name, i) => (
                                            <SelectItem
                                                key={name}
                                                value={String(i + 1)}
                                            >
                                                {t(name)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="filter-year">{t('Tahun')}</Label>
                                <Input
                                    id="filter-year"
                                    type="number"
                                    min="2000"
                                    value={periodFilter.year}
                                    onChange={(event) =>
                                        setPeriodFilter((c) => ({
                                            ...c,
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
                                    {t('Tampilkan')}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('Total budget bulanan')}</CardTitle>
                        <CardDescription>
                            {t(
                                'Batas keseluruhan lintas kategori, per mata uang, untuk :month :year.',
                                {
                                    month: t(monthNames[filters.month - 1]),
                                    year: filters.year,
                                },
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3 sm:grid-cols-2">
                        {overallBudgets.length === 0 ? (
                            <p className="text-sm text-muted-foreground sm:col-span-2">
                                {t(
                                    'Belum ada transaksi pengeluaran atau total budget untuk periode ini.',
                                )}
                            </p>
                        ) : (
                            overallBudgets.map((overall) => {
                                const isOver = (overall.percentage ?? 0) > 100;
                                return (
                                    <div
                                        key={overall.currency}
                                        className="rounded-lg border p-4"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">
                                                {overall.currency}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                {isOver && (
                                                    <Badge variant="destructive">
                                                        {t('Melebihi')}
                                                    </Badge>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        openOverallDialog(
                                                            overall.currency,
                                                        )
                                                    }
                                                >
                                                    {overall.amount === null
                                                        ? t('Atur')
                                                        : t('Ubah')}
                                                </Button>
                                                {overall.id && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() =>
                                                            setDeletingOverall(
                                                                overall,
                                                            )
                                                        }
                                                        aria-label={`${t('Hapus total budget')} ${overall.currency}`}
                                                    >
                                                        <Trash2 />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                        {overall.amount === null ? (
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {t('Terpakai')}{' '}
                                                {formatCurrency(
                                                    overall.spent,
                                                    overall.currency,
                                                )}{' '}
                                                · {t('belum ada batas total')}
                                            </p>
                                        ) : (
                                            <>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {formatCurrency(
                                                        overall.spent,
                                                        overall.currency,
                                                    )}{' '}
                                                    {t('dari')}{' '}
                                                    {formatCurrency(
                                                        overall.amount,
                                                        overall.currency,
                                                    )}{' '}
                                                    ({overall.percentage}%)
                                                </p>
                                                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                                                    <div
                                                        className={`h-full rounded-full transition-all ${isOver ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                                        style={{
                                                            width: `${Math.min(overall.percentage ?? 0, 100)}%`,
                                                        }}
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </CardContent>
                </Card>

                {budgetCurrencies.length <= 1 ? (
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {t('Total budget')}
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
                                    {t(monthNames[filters.month - 1])}{' '}
                                    {filters.year}
                                </CardDescription>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {t('Total terpakai')}
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
                                    {t('Sisa')}{' '}
                                    {formatCurrency(
                                        (totalsByCurrency[budgetCurrencies[0]]
                                            ?.budgeted ?? 0) -
                                            (totalsByCurrency[
                                                budgetCurrencies[0]
                                            ]?.spent ?? 0),
                                        budgetCurrencies[0] ?? defaultCurrency,
                                    )}
                                </CardDescription>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {t('Melebihi budget')}
                                </CardTitle>
                                <TrendingDown className="size-4 text-rose-600 dark:text-rose-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold tracking-tight">
                                    {overBudgetCount}
                                </div>
                                <CardDescription className="mt-1 text-xs">
                                    {t('dari :count kategori berbudget', {
                                        count: budgets.length,
                                    })}
                                </CardDescription>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('Ringkasan per mata uang')}</CardTitle>
                            <CardDescription>
                                {t(
                                    'Total budget dipisah per mata uang — :overCount dari :totalCount kategori melebihi budget.',
                                    {
                                        overCount: overBudgetCount,
                                        totalCount: budgets.length,
                                    },
                                )}
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
                                                    {t(':count melebihi', {
                                                        count: totals.overCount,
                                                    })}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {formatCurrency(
                                                totals.spent,
                                                currency,
                                            )}{' '}
                                            {t('dari')}{' '}
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
                        <CardTitle>{t('Rincian budget')}</CardTitle>
                        <CardDescription>
                            {t(
                                'Progres pengeluaran dibandingkan batas budget per kategori.',
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {budgets.length === 0 ? (
                            <div className="flex min-h-56 flex-col items-center justify-center rounded-lg border border-dashed px-4 text-center">
                                <PiggyBank className="mb-3 size-8 text-muted-foreground" />
                                <p className="font-medium">
                                    {t('Belum ada budget untuk periode ini')}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {t(
                                        'Tetapkan budget per kategori pengeluaran untuk memantau pengeluaran Anda.',
                                    )}
                                </p>
                                {canCreateBudget && (
                                    <Button
                                        className="mt-4"
                                        onClick={openCreateDialog}
                                    >
                                        <Plus />
                                        {t('Tambah budget')}
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
                                                        {budget.rollover && (
                                                            <Badge
                                                                variant="secondary"
                                                                className="gap-1"
                                                            >
                                                                <RotateCcw className="size-3" />{' '}
                                                                {t('Rollover')}
                                                            </Badge>
                                                        )}
                                                        {isOverBudget && (
                                                            <Badge variant="destructive">
                                                                {t('Melebihi budget')}
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
                                                        {t('dari')}{' '}
                                                        {formatCurrency(
                                                            Number(
                                                                budget.available,
                                                            ),
                                                            budget.currency,
                                                        )}
                                                        {' · '}
                                                        {t(':percentage% terpakai', {
                                                            percentage: budget.percentage,
                                                        })}
                                                    </p>
                                                    {budget.rollover &&
                                                        budget.rolled_in !==
                                                            0 && (
                                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                                {t(
                                                                    'Termasuk :type bulan lalu: :amount',
                                                                    {
                                                                        type:
                                                                            budget.rolled_in > 0
                                                                                ? t('sisa')
                                                                                : t('defisit'),
                                                                        amount: `${budget.rolled_in > 0 ? '+' : ''}${formatCurrency(budget.rolled_in, budget.currency)}`,
                                                                    },
                                                                )}
                                                            </p>
                                                        )}
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
                                                        {t('Ubah')}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() =>
                                                            deleteBudget(budget)
                                                        }
                                                        aria-label={`${t('Hapus budget')} ${budget.category.name}`}
                                                    >
                                                        <Trash2 />
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                                                <div
                                                    className={`h-full rounded-full transition-all ${isOverBudget ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                                    style={{
                                                        width: `${barWidth}%`,
                                                    }}
                                                />
                                            </div>

                                            <p className="mt-2 text-xs text-muted-foreground">
                                                {t('Sisa')}:{' '}
                                                {formatCurrency(
                                                    Number(budget.remaining),
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
                            {editingBudget ? t('Ubah budget') : t('Tambah budget')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('Budget berlaku untuk :month :year.', {
                                month: t(monthNames[data.month - 1]),
                                year: data.year,
                            })}
                        </DialogDescription>
                    </DialogHeader>

                    <form className="grid gap-4" onSubmit={submit}>
                        <div className="grid gap-2">
                            <Label htmlFor="budget-category">{t('Kategori')}</Label>
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
                                    <SelectValue placeholder={t('Pilih kategori pengeluaran')} />
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
                                                ? ` (${t('sudah ada budget :currency', { currency: data.currency })})`
                                                : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.category_id} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="budget-currency">{t('Mata uang')}</Label>
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
                                    <SelectValue placeholder={t('Pilih mata uang')} />
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
                            <Label htmlFor="budget-amount">{t('Jumlah budget')}</Label>
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
                        <div className="flex items-start gap-2 rounded-lg border p-3">
                            <Checkbox
                                id="budget-rollover"
                                checked={data.rollover}
                                onCheckedChange={(checked) =>
                                    setData('rollover', checked === true)
                                }
                            />
                            <div className="grid gap-1">
                                <Label
                                    htmlFor="budget-rollover"
                                    className="font-normal"
                                >
                                    {t('Rollover ke bulan berikutnya')}
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    {t(
                                        'Sisa (atau kelebihan) budget bulan ini akan ikut memengaruhi budget bulan depan untuk kategori yang sama.',
                                    )}
                                </p>
                            </div>
                        </div>

                        <DialogFooter className="mt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeDialog}
                            >
                                {t('Batal')}
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {editingBudget
                                    ? t('Simpan perubahan')
                                    : t('Buat budget')}
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
                        <DialogTitle>{t('Hapus budget')}</DialogTitle>
                        <DialogDescription>
                            {t(
                                'Hapus budget untuk “:category” (:currency)?',
                                {
                                    category:
                                        deletingBudget?.category.name || '',
                                    currency: deletingBudget?.currency || '',
                                },
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={closeDeleteDialog}
                            disabled={processing}
                        >
                            {t('Batal')}
                        </Button>
                        <Button
                            type="button"
                            onClick={confirmDelete}
                            disabled={processing}
                            className="text-destructive"
                        >
                            {t('Hapus')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={isOverallDialogOpen}
                onOpenChange={(open) => !open && closeOverallDialog()}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {t('Total budget bulanan')} · {overallForm.data.currency}
                        </DialogTitle>
                        <DialogDescription>
                            {t(
                                'Batas total lintas kategori untuk :month :year.',
                                {
                                    month: t(monthNames[filters.month - 1]),
                                    year: filters.year,
                                },
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <form className="grid gap-4" onSubmit={submitOverall}>
                        <div className="grid gap-2">
                            <Label htmlFor="overall-amount">{t('Jumlah')}</Label>
                            <Input
                                id="overall-amount"
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={overallForm.data.amount}
                                onChange={(event) =>
                                    overallForm.setData(
                                        'amount',
                                        event.target.value,
                                    )
                                }
                                placeholder="0"
                                autoFocus
                            />
                            <InputError message={overallForm.errors.amount} />
                        </div>
                        <DialogFooter className="mt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeOverallDialog}
                            >
                                {t('Batal')}
                            </Button>
                            <Button
                                type="submit"
                                disabled={overallForm.processing}
                            >
                                {t('Simpan')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog
                open={!!deletingOverall}
                onOpenChange={(open) => !open && setDeletingOverall(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('Hapus total budget')}</DialogTitle>
                        <DialogDescription>
                            {t(
                                'Hapus batas total bulanan untuk :currency?',
                                {
                                    currency: deletingOverall?.currency || '',
                                },
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDeletingOverall(null)}
                        >
                            {t('Batal')}
                        </Button>
                        <Button
                            type="button"
                            onClick={confirmDeleteOverall}
                            className="text-destructive"
                        >
                            {t('Hapus')}
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
