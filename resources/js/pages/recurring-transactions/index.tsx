import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Repeat, Trash2 } from 'lucide-react';
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

import { Textarea } from '@/components/ui/textarea';
import { formatCurrency } from '@/lib/currency';
import { dashboard } from '@/routes';
import { destroy, index, store, update } from '@/routes/recurring-transactions';
import type { Category, RecurringTransaction, Wallet } from '@/types';
import { Switch } from '@/components/ui/switch';

type Props = {
    recurringTransactions: RecurringTransaction[];
    wallets: Pick<Wallet, 'id' | 'title' | 'currency'>[];
    categories: Pick<Category, 'id' | 'name' | 'type'>[];
    frequencies: RecurringTransaction['frequency'][];
};

type CreateForm = {
    wallet_id: string;
    category_id: string;
    amount: string;
    description: string;
    frequency: string;
    interval: string;
    start_date: string;
    end_date: string;
};

type EditForm = {
    amount: string;
    description: string;
    end_date: string;
    is_active: boolean;
};

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
});

const frequencyLabels: Record<string, string> = {
    daily: 'Harian',
    weekly: 'Mingguan',
    monthly: 'Bulanan',
    yearly: 'Tahunan',
};

function today() {
    return new Date().toISOString().slice(0, 10);
}

function initialCreateForm(): CreateForm {
    return {
        wallet_id: '',
        category_id: '',
        amount: '',
        description: '',
        frequency: 'monthly',
        interval: '1',
        start_date: today(),
        end_date: '',
    };
}

function describeSchedule(rule: RecurringTransaction) {
    const unit = {
        daily: 'hari',
        weekly: 'minggu',
        monthly: 'bulan',
        yearly: 'tahun',
    }[rule.frequency];
    return rule.interval === 1
        ? frequencyLabels[rule.frequency]
        : `Setiap ${rule.interval} ${unit}`;
}

export default function RecurringTransactions({
    recurringTransactions,
    wallets,
    categories,
    frequencies,
}: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<RecurringTransaction | null>(
        null,
    );
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deletingRule, setDeletingRule] =
        useState<RecurringTransaction | null>(null);

    const createForm = useForm<CreateForm>(initialCreateForm());
    const editForm = useForm<EditForm>({
        amount: '',
        description: '',
        end_date: '',
        is_active: true,
    });

    const canCreate = wallets.length > 0 && categories.length > 0;

    function openCreateDialog() {
        if (!canCreate) return;
        createForm.clearErrors();
        createForm.reset();
        createForm.setData(initialCreateForm());
        setIsCreateOpen(true);
    }

    function closeCreateDialog() {
        if (createForm.processing) return;
        setIsCreateOpen(false);
    }

    function submitCreate(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        createForm.post(store.url(), { onSuccess: closeCreateDialog });
    }

    function openEditDialog(rule: RecurringTransaction) {
        setEditingRule(rule);
        editForm.clearErrors();
        editForm.setData({
            amount: String(rule.amount),
            description: rule.description ?? '',
            end_date: rule.end_date ?? '',
            is_active: rule.is_active,
        });
    }

    function closeEditDialog() {
        if (editForm.processing) return;
        setEditingRule(null);
    }

    function submitEdit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!editingRule) return;
        editForm.put(update.url(editingRule), { onSuccess: closeEditDialog });
    }

    function toggleActive(rule: RecurringTransaction) {
        router.put(
            update.url(rule),
            {
                amount: rule.amount,
                description: rule.description ?? '',
                end_date: rule.end_date ?? '',
                is_active: !rule.is_active,
            },
            { preserveScroll: true },
        );
    }

    function askDelete(rule: RecurringTransaction) {
        setDeletingRule(rule);
        setIsDeleteOpen(true);
    }

    function closeDeleteDialog() {
        setIsDeleteOpen(false);
        setDeletingRule(null);
    }

    function confirmDelete() {
        if (!deletingRule) return;
        router.delete(destroy.url(deletingRule), {
            onSuccess: closeDeleteDialog,
        });
    }

    return (
        <>
            <Head title="Transaksi Berulang" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Rencanakan Transaksi Rutin Anda
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Otomatis catat transaksi rutin seperti gaji, sewa,
                            atau langganan.
                        </p>
                    </div>
                    <Button onClick={openCreateDialog} disabled={!canCreate}>
                        <Plus /> Buat aturan
                    </Button>
                </div>

                {!canCreate && (
                    <Card className="border-dashed">
                        <CardContent className="py-5 text-sm text-muted-foreground">
                            Buat minimal satu dompet aktif dan satu kategori
                            sebelum membuat transaksi berulang.
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar aturan</CardTitle>
                        <CardDescription>
                            Transaksi baru dibuat otomatis pada jadwalnya.
                            Menghapus aturan tidak menghapus riwayat transaksi
                            yang sudah tercatat.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recurringTransactions.length === 0 ? (
                            <div className="flex min-h-56 flex-col items-center justify-center rounded-lg border border-dashed px-4 text-center">
                                <Repeat className="mb-3 size-8 text-muted-foreground" />
                                <p className="font-medium">
                                    Belum ada transaksi berulang
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Buat aturan pertama Anda untuk transaksi
                                    rutin.
                                </p>
                                {canCreate && (
                                    <Button
                                        className="mt-4"
                                        onClick={openCreateDialog}
                                    >
                                        <Plus />
                                        Buat aturan
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {recurringTransactions.map((rule) => {
                                    const isIncome =
                                        rule.category?.type === 'income';
                                    const currency =
                                        rule.wallet?.currency ?? 'IDR';
                                    return (
                                        <div
                                            key={rule.id}
                                            className={`rounded-lg border p-4 ${!rule.is_active ? 'opacity-60' : ''}`}
                                        >
                                            <div className="flex flex-wrap items-start justify-between gap-3">
                                                <div>
                                                    <div className="flex items-center gap-2 font-medium">
                                                        {rule.description ||
                                                            rule.category?.name}
                                                        <Badge variant="outline">
                                                            {describeSchedule(
                                                                rule,
                                                            )}
                                                        </Badge>
                                                        {!rule.is_active && (
                                                            <Badge variant="secondary">
                                                                Nonaktif
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        {rule.wallet?.title} ·{' '}
                                                        {rule.category?.name}
                                                    </p>
                                                    <p
                                                        className={`mt-1 text-sm font-medium ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}
                                                    >
                                                        {isIncome ? '+' : '−'}
                                                        {formatCurrency(
                                                            Number(rule.amount),
                                                            currency,
                                                        )}
                                                    </p>
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        Jadwal berikutnya:{' '}
                                                        {dateFormatter.format(
                                                            new Date(
                                                                rule.next_due_date,
                                                            ),
                                                        )}
                                                        {rule.end_date &&
                                                            ` · berakhir ${dateFormatter.format(new Date(rule.end_date))}`}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Switch
                                                        checked={rule.is_active}
                                                        onCheckedChange={() =>
                                                            toggleActive(rule)
                                                        }
                                                        aria-label={
                                                            rule.is_active
                                                                ? 'Nonaktifkan aturan'
                                                                : 'Aktifkan aturan'
                                                        }
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            openEditDialog(rule)
                                                        }
                                                        aria-label="Ubah aturan"
                                                    >
                                                        <Pencil />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() =>
                                                            askDelete(rule)
                                                        }
                                                        aria-label="Hapus aturan"
                                                    >
                                                        <Trash2 />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Create dialog */}
            <Dialog
                open={isCreateOpen}
                onOpenChange={(open) => !open && closeCreateDialog()}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Buat transaksi berulang</DialogTitle>
                        <DialogDescription>
                            Dompet, kategori, dan jadwal tidak bisa diubah lagi
                            setelah dibuat.
                        </DialogDescription>
                    </DialogHeader>
                    <form className="grid gap-4" onSubmit={submitCreate}>
                        <div className="grid gap-2">
                            <Label htmlFor="rt-wallet">Dompet</Label>
                            <Select
                                value={createForm.data.wallet_id}
                                onValueChange={(value) =>
                                    createForm.setData('wallet_id', value)
                                }
                            >
                                <SelectTrigger
                                    id="rt-wallet"
                                    className="w-full"
                                >
                                    <SelectValue placeholder="Pilih dompet" />
                                </SelectTrigger>
                                <SelectContent>
                                    {wallets.map((wallet) => (
                                        <SelectItem
                                            key={wallet.id}
                                            value={String(wallet.id)}
                                        >
                                            {wallet.title} · {wallet.currency}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={createForm.errors.wallet_id} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="rt-category">Kategori</Label>
                            <Select
                                value={createForm.data.category_id}
                                onValueChange={(value) =>
                                    createForm.setData('category_id', value)
                                }
                            >
                                <SelectTrigger
                                    id="rt-category"
                                    className="w-full"
                                >
                                    <SelectValue placeholder="Pilih kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem
                                            key={category.id}
                                            value={String(category.id)}
                                        >
                                            {category.name} (
                                            {category.type === 'income'
                                                ? 'Pemasukan'
                                                : 'Pengeluaran'}
                                            )
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError
                                message={createForm.errors.category_id}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="rt-amount">Nominal</Label>
                            <Input
                                id="rt-amount"
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={createForm.data.amount}
                                onChange={(event) =>
                                    createForm.setData(
                                        'amount',
                                        event.target.value,
                                    )
                                }
                                placeholder="0"
                            />
                            <InputError message={createForm.errors.amount} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="rt-frequency">Frekuensi</Label>
                                <Select
                                    value={createForm.data.frequency}
                                    onValueChange={(value) =>
                                        createForm.setData('frequency', value)
                                    }
                                >
                                    <SelectTrigger
                                        id="rt-frequency"
                                        className="w-full"
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {frequencies.map((freq) => (
                                            <SelectItem key={freq} value={freq}>
                                                {frequencyLabels[freq]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError
                                    message={createForm.errors.frequency}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="rt-interval">Setiap</Label>
                                <Input
                                    id="rt-interval"
                                    type="number"
                                    min="1"
                                    max="365"
                                    value={createForm.data.interval}
                                    onChange={(event) =>
                                        createForm.setData(
                                            'interval',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    message={createForm.errors.interval}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="rt-start">Mulai</Label>
                                <Input
                                    id="rt-start"
                                    type="date"
                                    value={createForm.data.start_date}
                                    onChange={(event) =>
                                        createForm.setData(
                                            'start_date',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    message={createForm.errors.start_date}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="rt-end">
                                    Berakhir{' '}
                                    <span className="text-muted-foreground">
                                        (opsional)
                                    </span>
                                </Label>
                                <Input
                                    id="rt-end"
                                    type="date"
                                    value={createForm.data.end_date}
                                    onChange={(event) =>
                                        createForm.setData(
                                            'end_date',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    message={createForm.errors.end_date}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="rt-description">
                                Keterangan{' '}
                                <span className="text-muted-foreground">
                                    (opsional)
                                </span>
                            </Label>
                            <Textarea
                                id="rt-description"
                                rows={2}
                                value={createForm.data.description}
                                onChange={(event) =>
                                    createForm.setData(
                                        'description',
                                        event.target.value,
                                    )
                                }
                                placeholder="Contoh: Sewa kos bulanan"
                            />
                            <InputError
                                message={createForm.errors.description}
                            />
                        </div>
                        <DialogFooter className="mt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeCreateDialog}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={createForm.processing}
                            >
                                Buat aturan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit dialog */}
            <Dialog
                open={!!editingRule}
                onOpenChange={(open) => !open && closeEditDialog()}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ubah transaksi berulang</DialogTitle>
                        <DialogDescription>
                            {editingRule &&
                                `${editingRule.wallet?.title} · ${editingRule.category?.name} · ${describeSchedule(editingRule)}`}
                        </DialogDescription>
                    </DialogHeader>
                    <form className="grid gap-4" onSubmit={submitEdit}>
                        <div className="grid gap-2">
                            <Label htmlFor="rt-edit-amount">Nominal</Label>
                            <Input
                                id="rt-edit-amount"
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={editForm.data.amount}
                                onChange={(event) =>
                                    editForm.setData(
                                        'amount',
                                        event.target.value,
                                    )
                                }
                            />
                            <InputError message={editForm.errors.amount} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="rt-edit-end">
                                Berakhir{' '}
                                <span className="text-muted-foreground">
                                    (opsional)
                                </span>
                            </Label>
                            <Input
                                id="rt-edit-end"
                                type="date"
                                value={editForm.data.end_date}
                                onChange={(event) =>
                                    editForm.setData(
                                        'end_date',
                                        event.target.value,
                                    )
                                }
                            />
                            <InputError message={editForm.errors.end_date} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="rt-edit-description">
                                Keterangan{' '}
                                <span className="text-muted-foreground">
                                    (opsional)
                                </span>
                            </Label>
                            <Textarea
                                id="rt-edit-description"
                                rows={2}
                                value={editForm.data.description}
                                onChange={(event) =>
                                    editForm.setData(
                                        'description',
                                        event.target.value,
                                    )
                                }
                            />
                            <InputError message={editForm.errors.description} />
                        </div>
                        <DialogFooter className="mt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeEditDialog}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={editForm.processing}
                            >
                                Simpan perubahan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete confirm dialog */}
            <Dialog
                open={isDeleteOpen}
                onOpenChange={(open) => !open && closeDeleteDialog()}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus aturan</DialogTitle>
                        <DialogDescription>
                            Hapus transaksi berulang “
                            {deletingRule?.description ||
                                deletingRule?.category?.name}
                            ”? Riwayat transaksi yang sudah tercatat tidak akan
                            terhapus.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={closeDeleteDialog}
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            onClick={confirmDelete}
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

RecurringTransactions.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Transaksi Berulang', href: index() },
    ],
};
