import { Head, router, useForm } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import {
    ArrowDownRight,
    ArrowUpRight,
    Filter,
    Pencil,
    Plus,
    ReceiptText,
    Trash2,
    X,
    Download,
} from 'lucide-react';

import { useState } from 'react';
import InputError from '@/components/input-error';
import Pagination from '@/components/pagination';
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
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency } from '@/lib/currency';
import { dashboard } from '@/routes';
import transactionsRoutes from '@/routes/transactions';
import type {
    Category,
    Paginated,
    Transaction,
    TransactionFilters,
    TransactionTotals,
    Wallet,
} from '@/types';

const {
    destroy,
    export: exportTransactions,
    index,
    store,
    update,
} = transactionsRoutes;

type Props = {
    transactions: Paginated<Transaction>;
    wallets: Pick<Wallet, 'id' | 'title' | 'currency' | 'status'>[];
    categories: Pick<Category, 'id' | 'name' | 'type'>[];
    filters: TransactionFilters;
    totals: TransactionTotals[];
};

type TransactionForm = {
    wallet_id: string;
    category_id: string;
    amount: string;
    description: string;
    transacted_at: string;
};

type FilterForm = Required<TransactionFilters>;

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
});

function localDateTime() {
    const date = new Date();
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());

    return date.toISOString().slice(0, 16);
}

function initialTransactionForm(): TransactionForm {
    return {
        wallet_id: '',
        category_id: '',
        amount: '',
        description: '',
        transacted_at: localDateTime(),
    };
}

export default function Transactions({
    transactions,
    wallets,
    categories,
    filters,
    totals,
}: Props) {
    const { t } = useLaravelReactI18n();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] =
        useState<Transaction | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingTransaction, setDeletingTransaction] =
        useState<Transaction | null>(null);
    const [filterData, setFilterData] = useState<FilterForm>({
        wallet_id: filters.wallet_id ?? '',
        category_id: filters.category_id ?? '',
        start_date: filters.start_date ?? '',
        end_date: filters.end_date ?? '',
    });
    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm<TransactionForm>(initialTransactionForm());

    // Totals grouped by currency — summing amounts across different
    // currencies directly would produce a meaningless number.

    const currencies = totals.map((t) => t.currency);
    const totalsByCurrency = Object.fromEntries(
        totals.map((t) => [t.currency, t]),
    );

    const activeWallets = wallets.filter((wallet) => wallet.status);
    const selectableWallets = editingTransaction
        ? wallets.filter(
              (wallet) =>
                  wallet.status || wallet.id === editingTransaction.wallet_id,
          )
        : activeWallets;
    const canCreateTransaction =
        activeWallets.length > 0 && categories.length > 0;

    function openCreateDialog() {
        if (!canCreateTransaction) {
            return;
        }

        setEditingTransaction(null);
        clearErrors();
        reset();
        setData(initialTransactionForm());
        setIsDialogOpen(true);
    }

    function openEditDialog(transaction: Transaction) {
        setEditingTransaction(transaction);
        clearErrors();
        setData({
            wallet_id: String(transaction.wallet_id),
            category_id: String(transaction.category_id),
            amount: String(transaction.amount),
            description: transaction.description ?? '',
            transacted_at: transaction.transacted_at
                .replace(' ', 'T')
                .slice(0, 16),
        });
        setIsDialogOpen(true);
    }

    function closeDialog() {
        if (processing) {
            return;
        }

        setIsDialogOpen(false);
        setEditingTransaction(null);
        clearErrors();
    }

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const options = { onSuccess: closeDialog };

        if (editingTransaction) {
            put(update.url(editingTransaction), options);

            return;
        }

        post(store.url(), options);
    }

    function applyFilters(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        router.get(index.url(), filterData, {
            preserveState: true,
            replace: true,
        });
    }

    function clearFilters() {
        const emptyFilters: FilterForm = {
            wallet_id: '',
            category_id: '',
            start_date: '',
            end_date: '',
        };
        setFilterData(emptyFilters);
        router.get(index.url(), {}, { preserveState: true, replace: true });
    }

    function deleteTransaction(transaction: Transaction) {
        setDeletingTransaction(transaction);
        setIsDeleteDialogOpen(true);
    }

    function closeDeleteDialog() {
        if (processing) {
            return;
        }

        setIsDeleteDialogOpen(false);
        setDeletingTransaction(null);
    }

    function confirmDelete() {
        if (!deletingTransaction) {
            return;
        }

        router.delete(destroy.url(deletingTransaction), {
            onSuccess: closeDeleteDialog,
        });
    }

    return (
        <>
            <Head title={t('Transaksi')} />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {t('Transaksi')}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {t('Catat semua pemasukan dan pengeluaran Anda.')}
                        </p>
                    </div>
                    {/* <Button
                        onClick={openCreateDialog}
                        disabled={!canCreateTransaction}
                    >
                        <Plus /> {t('Tambah transaksi')}
                    </Button> */}

                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <a
                                href={exportTransactions.url({
                                    query: filterData,
                                })}
                            >
                                <Download /> Export CSV
                            </a>
                        </Button>
                        <Button
                            onClick={openCreateDialog}
                            disabled={!canCreateTransaction}
                        >
                            <Plus /> Tambah transaksi
                        </Button>
                    </div>
                </div>

                {!canCreateTransaction && (
                    <Card className="border-dashed">
                        <CardContent className="py-5 text-sm text-muted-foreground">
                            {t(
                                'Buat minimal satu dompet aktif dan satu kategori sebelum mencatat transaksi.',
                            )}
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-4 md:grid-cols-3">
                    <SummaryCard
                        title={t('Transaksi ditampilkan')}
                        amount={String(transactions.data.length)}
                        icon={ReceiptText}
                    />
                    {currencies.length <= 1 ? (
                        <>
                            <SummaryCard
                                title={t('Pemasukan')}
                                amount={formatCurrency(
                                    totalsByCurrency[currencies[0]]?.income ??
                                        0,
                                    currencies[0] ?? 'IDR',
                                )}
                                icon={ArrowUpRight}
                                iconClassName="text-emerald-600 dark:text-emerald-400"
                            />
                            <SummaryCard
                                title={t('Pengeluaran')}
                                amount={formatCurrency(
                                    totalsByCurrency[currencies[0]]?.expense ??
                                        0,
                                    currencies[0] ?? 'IDR',
                                )}
                                icon={ArrowDownRight}
                                iconClassName="text-rose-600 dark:text-rose-400"
                            />
                        </>
                    ) : (
                        <div className="col-span-2 grid gap-2 rounded-lg border p-4 text-sm">
                            {currencies.map((currency) => (
                                <div
                                    key={currency}
                                    className="flex items-center justify-between gap-4"
                                >
                                    <span className="font-medium text-muted-foreground">
                                        {currency}
                                    </span>
                                    <span className="text-emerald-600 dark:text-emerald-400">
                                        +
                                        {formatCurrency(
                                            totalsByCurrency[currency].income,
                                            currency,
                                        )}
                                    </span>
                                    <span className="text-rose-600 dark:text-rose-400">
                                        −
                                        {formatCurrency(
                                            totalsByCurrency[currency].expense,
                                            currency,
                                        )}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="size-4" />
                            {t('Filter transaksi')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form
                            className="grid gap-4 md:grid-cols-2 lg:grid-cols-5"
                            onSubmit={applyFilters}
                        >
                            <FilterSelect
                                label={t('Dompet')}
                                value={filterData.wallet_id}
                                placeholder={t('Semua dompet')}
                                items={wallets.map((wallet) => ({
                                    value: String(wallet.id),
                                    label: wallet.status
                                        ? wallet.title
                                        : `${wallet.title} (${t('diarsipkan')})`,
                                }))}
                                onChange={(value) =>
                                    setFilterData((current) => ({
                                        ...current,
                                        wallet_id: value,
                                    }))
                                }
                            />
                            <FilterSelect
                                label={t('Kategori')}
                                value={filterData.category_id}
                                placeholder={t('Semua kategori')}
                                items={categories.map((category) => ({
                                    value: String(category.id),
                                    label: category.name,
                                }))}
                                onChange={(value) =>
                                    setFilterData((current) => ({
                                        ...current,
                                        category_id: value,
                                    }))
                                }
                            />
                            <div className="grid gap-2">
                                <Label htmlFor="start-date">
                                    {t('Dari tanggal')}
                                </Label>
                                <Input
                                    id="start-date"
                                    type="date"
                                    value={filterData.start_date}
                                    onChange={(event) =>
                                        setFilterData((current) => ({
                                            ...current,
                                            start_date: event.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="end-date">
                                    {t('Sampai tanggal')}
                                </Label>
                                <Input
                                    id="end-date"
                                    type="date"
                                    value={filterData.end_date}
                                    onChange={(event) =>
                                        setFilterData((current) => ({
                                            ...current,
                                            end_date: event.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="flex items-end gap-2">
                                <Button type="submit" className="flex-1">
                                    {t('Terapkan')}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={clearFilters}
                                    aria-label={t('Hapus filter')}
                                >
                                    <X />
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('Riwayat transaksi')}</CardTitle>
                        <CardDescription>
                            {t(
                                'Saldo dompet diperbarui otomatis untuk setiap transaksi.',
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {transactions.data.length === 0 ? (
                            <div className="flex min-h-56 flex-col items-center justify-center rounded-lg border border-dashed px-4 text-center">
                                <ReceiptText className="mb-3 size-8 text-muted-foreground" />
                                <p className="font-medium">
                                    {t('Belum ada transaksi')}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {t(
                                        'Catat transaksi pertama Anda untuk melihat riwayat di sini.',
                                    )}
                                </p>
                                {canCreateTransaction && (
                                    <Button
                                        className="mt-4"
                                        onClick={openCreateDialog}
                                    >
                                        <Plus />
                                        {t('Tambah transaksi')}
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-200 text-sm">
                                        <thead className="border-b text-left text-muted-foreground">
                                            <tr>
                                                <th className="pb-3 font-medium">
                                                    {t('Tanggal')}
                                                </th>
                                                <th className="pb-3 font-medium">
                                                    {t('Keterangan')}
                                                </th>
                                                <th className="pb-3 font-medium">
                                                    {t('Dompet')}
                                                </th>
                                                <th className="pb-3 font-medium">
                                                    {t('Kategori')}
                                                </th>
                                                <th className="pb-3 text-right font-medium">
                                                    {t('Nominal')}
                                                </th>
                                                <th className="w-24 pb-3 text-right font-medium">
                                                    {t('Aksi')}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {transactions.data.map(
                                                (transaction) => {
                                                    const isIncome =
                                                        transaction.category
                                                            ?.type === 'income';
                                                    const currency =
                                                        transaction.wallet
                                                            ?.currency ?? 'IDR';

                                                    return (
                                                        <tr
                                                            key={transaction.id}
                                                            className="border-b last:border-0"
                                                        >
                                                            <td className="py-4 whitespace-nowrap text-muted-foreground">
                                                                {dateFormatter.format(
                                                                    new Date(
                                                                        transaction.transacted_at,
                                                                    ),
                                                                )}
                                                            </td>
                                                            <td className="max-w-60 truncate py-4 font-medium">
                                                                {transaction.description ||
                                                                    '—'}
                                                            </td>
                                                            <td className="py-4 text-muted-foreground">
                                                                {
                                                                    transaction
                                                                        .wallet
                                                                        ?.title
                                                                }
                                                            </td>
                                                            <td className="py-4">
                                                                <Badge
                                                                    variant={
                                                                        isIncome
                                                                            ? 'secondary'
                                                                            : 'outline'
                                                                    }
                                                                >
                                                                    {
                                                                        transaction
                                                                            .category
                                                                            ?.name
                                                                    }
                                                                </Badge>
                                                            </td>
                                                            <td
                                                                className={`py-4 text-right font-medium tabular-nums ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}
                                                            >
                                                                {isIncome
                                                                    ? '+'
                                                                    : '−'}
                                                                {formatCurrency(
                                                                    Number(
                                                                        transaction.amount,
                                                                    ),
                                                                    currency,
                                                                )}
                                                            </td>
                                                            <td className="py-4">
                                                                <div className="flex justify-end gap-1">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() =>
                                                                            openEditDialog(
                                                                                transaction,
                                                                            )
                                                                        }
                                                                        aria-label={t(
                                                                            'Ubah transaksi',
                                                                        )}
                                                                    >
                                                                        <Pencil />
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="text-destructive hover:text-destructive"
                                                                        onClick={() =>
                                                                            deleteTransaction(
                                                                                transaction,
                                                                            )
                                                                        }
                                                                        aria-label={t(
                                                                            'Hapus transaksi',
                                                                        )}
                                                                    >
                                                                        <Trash2 />
                                                                    </Button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                },
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <Pagination
                                    links={transactions.links}
                                    from={transactions.from}
                                    to={transactions.to}
                                    total={transactions.total}
                                    itemLabel={t('transaksi')}
                                />
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
                            {editingTransaction
                                ? t('Ubah transaksi')
                                : t('Tambah transaksi')}
                        </DialogTitle>
                        <DialogDescription>
                            {t(
                                'Pilih dompet dan kategori untuk mencatat transaksi.',
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <form className="grid gap-4" onSubmit={submit}>
                        <div className="grid gap-2">
                            <Label htmlFor="transaction-wallet">
                                {t('Dompet')}
                            </Label>
                            <Select
                                value={data.wallet_id}
                                onValueChange={(value) =>
                                    setData('wallet_id', value)
                                }
                            >
                                <SelectTrigger
                                    id="transaction-wallet"
                                    className="w-full"
                                >
                                    <SelectValue
                                        placeholder={t('Pilih dompet')}
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {selectableWallets.map((wallet) => (
                                        <SelectItem
                                            key={wallet.id}
                                            value={String(wallet.id)}
                                        >
                                            {wallet.title} - {wallet.currency}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.wallet_id} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="transaction-category">
                                {t('Kategori')}
                            </Label>
                            <Select
                                value={data.category_id}
                                onValueChange={(value) =>
                                    setData('category_id', value)
                                }
                            >
                                <SelectTrigger
                                    id="transaction-category"
                                    className="w-full"
                                >
                                    <SelectValue
                                        placeholder={t('Pilih kategori')}
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem
                                            key={category.id}
                                            value={String(category.id)}
                                        >
                                            {category.name} (
                                            {category.type === 'income'
                                                ? t('Pemasukan')
                                                : t('Pengeluaran')}
                                            )
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.category_id} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="transaction-amount">
                                {t('Nominal')}
                            </Label>
                            <Input
                                id="transaction-amount"
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={data.amount}
                                onChange={(event) =>
                                    setData('amount', event.target.value)
                                }
                                placeholder="0"
                            />
                            <InputError message={errors.amount} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="transaction-date">
                                {t('Tanggal transaksi')}
                            </Label>
                            <Input
                                id="transaction-date"
                                type="datetime-local"
                                value={data.transacted_at}
                                onChange={(event) =>
                                    setData('transacted_at', event.target.value)
                                }
                            />
                            <InputError message={errors.transacted_at} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="transaction-description">
                                {t('Keterangan')}{' '}
                                <span className="text-muted-foreground">
                                    ({t('opsional')})
                                </span>
                            </Label>
                            <Textarea
                                id="transaction-description"
                                rows={3}
                                value={data.description}
                                onChange={(event) =>
                                    setData('description', event.target.value)
                                }
                                placeholder={t(
                                    'Contoh: Belanja kebutuhan mingguan',
                                )}
                            />
                            <InputError message={errors.description} />
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
                                {editingTransaction
                                    ? t('Simpan perubahan')
                                    : t('Simpan transaksi')}
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
                        <DialogTitle>{t('Hapus transaksi')}</DialogTitle>
                        <DialogDescription>
                            {t(
                                'Hapus transaksi ini? Saldo dompet akan disesuaikan.',
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
        </>
    );
}

function SummaryCard({
    title,
    amount,
    icon: Icon,
    iconClassName = 'text-muted-foreground',
}: {
    title: string;
    amount: string;
    icon: typeof ReceiptText;
    iconClassName?: string;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className={`size-4 ${iconClassName}`} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold tracking-tight">
                    {amount}
                </div>
            </CardContent>
        </Card>
    );
}

function FilterSelect({
    label,
    value,
    placeholder,
    items,
    onChange,
}: {
    label: string;
    value: string;
    placeholder: string;
    items: { value: string; label: string }[];
    onChange: (value: string) => void;
}) {
    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            <Select value={value || undefined} onValueChange={onChange}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {items.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                            {item.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}

Transactions.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Transaksi', href: index() },
    ],
};
