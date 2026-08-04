import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2, WalletCards } from 'lucide-react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useState } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { CURRENCY_CODES, formatCurrency } from '@/lib/currency';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

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
import { Textarea } from '@/components/ui/textarea';
import { dashboard } from '@/routes';
import { destroy, index, store, update } from '@/routes/wallets';
import type { Wallet } from '@/types';

type Props = {
    wallets: Wallet[];
};

type WalletForm = {
    title: string;
    description: string;
    balance: string;
    currency: string;
    status: boolean;
};

const initialForm: WalletForm = {
    title: '',
    description: '',
    balance: '0',
    currency: 'IDR',
    status: true,
};
export default function Wallets({ wallets }: Props) {
    const { t } = useLaravelReactI18n();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingWallet, setDeletingWallet] = useState<Wallet | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm<WalletForm>(initialForm);

    const totalsByCurrency = wallets.reduce<Record<string, number>>(
        (totals, wallet) => {
            totals[wallet.currency] =
                (totals[wallet.currency] ?? 0) + Number(wallet.balance);

            return totals;
        },
        {},
    );

    function openCreateDialog() {
        setEditingWallet(null);
        clearErrors();
        reset();
        setIsDialogOpen(true);
    }

    function openEditDialog(wallet: Wallet) {
        setEditingWallet(wallet);
        clearErrors();
        setData({
            title: wallet.title,
            description: wallet.description ?? '',
            balance: String(wallet.balance),
            currency: wallet.currency,
            status: wallet.status,
        });
        setIsDialogOpen(true);
    }

    function closeDialog() {
        if (processing) {
            return;
        }

        setIsDialogOpen(false);
        setEditingWallet(null);
        clearErrors();
    }

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const options = {
            onSuccess() {
                if (!editingWallet) {
                    reset();
                }
                closeDialog();
                toast.success(
                    t(
                        editingWallet
                            ? 'Perubahan dompet disimpan.'
                            : 'Dompet berhasil dibuat.',
                    ),
                );
            },
        };

        if (editingWallet) {
            put(update.url(editingWallet), options);

            return;
        }

        post(store.url(), options);
    }

    function openDeleteDialog(wallet: Wallet) {
        setDeleteError(null);
        setDeletingWallet(wallet);
        setIsDeleteDialogOpen(true);
    }

    function closeDeleteDialog() {
        if (processing) {
            return;
        }

        setIsDeleteDialogOpen(false);
        setDeletingWallet(null);
    }

    function confirmDelete() {
        if (!deletingWallet) {
            return;
        }

        setDeleteError(null);

        router.delete(destroy.url(deletingWallet), {
            onSuccess: closeDeleteDialog,
            onError: (errors) =>
                setDeleteError(errors.wallet ?? t('Dompet tidak dapat dihapus.')),
        });
    }

    return (
        <>
            <Head title={t('Dompet')} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {t('Dompet')}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {t('Kelola saldo dan sumber dana Anda.')}
                        </p>
                    </div>
                    <Button onClick={openCreateDialog}>
                        <Plus />
                        {t('Tambah dompet')}
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {t('Total saldo')}
                            </CardTitle>
                            <WalletCards className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tracking-tight">
                                <div className="space-y-1">
                                    {Object.entries(totalsByCurrency).map(
                                        ([currency, total]) => (
                                            <div
                                                key={currency}
                                                className="text-2xl font-bold tracking-tight"
                                            >
                                                {formatCurrency(
                                                    total > 0 ? total : 0,
                                                    currency,
                                                )}
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                            <CardDescription className="mt-1 text-xs">
                                {t('Dari :count dompet terdaftar', {
                                    count: wallets.length,
                                })}
                            </CardDescription>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                {t('Dompet aktif')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tracking-tight">
                                {
                                    wallets.filter((wallet) => wallet.status)
                                        .length
                                }
                            </div>
                            <CardDescription className="mt-1 text-xs">
                                {t('Bisa dipakai untuk transaksi dan transfer baru')}
                            </CardDescription>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('Daftar dompet')}</CardTitle>
                        <CardDescription>
                            {t(
                                'Dompet diarsipkan tetap menyimpan riwayat, tetapi tidak dapat dipakai untuk transaksi atau transfer baru.',
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {wallets.length === 0 ? (
                            <div className="flex min-h-56 flex-col items-center justify-center rounded-lg border border-dashed px-4 text-center">
                                <WalletCards className="mb-3 size-8 text-muted-foreground" />
                                <p className="font-medium">{t('Belum ada dompet')}</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {t(
                                        'Buat dompet pertama Anda untuk mulai mencatat transaksi.',
                                    )}
                                </p>
                                <Button
                                    className="mt-4"
                                    onClick={openCreateDialog}
                                >
                                    <Plus />
                                    {t('Tambah dompet')}
                                </Button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-150 text-sm">
                                    <thead className="border-b text-left text-muted-foreground">
                                        <tr>
                                            <th className="pb-3 font-medium">
                                                {t('Dompet')}
                                            </th>
                                            <th className="pb-3 font-medium">
                                                {t('Deskripsi')}
                                            </th>
                                            <th className="pb-3 font-medium">
                                                {t('Status')}
                                            </th>
                                            <th className="pb-3 text-right font-medium">
                                                {t('Saldo')}
                                            </th>
                                            <th className="w-24 pb-3 text-right font-medium">
                                                {t('Aksi')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {wallets.map((wallet) => (
                                            <tr
                                                key={wallet.id}
                                                className="border-b last:border-0"
                                            >
                                                <td className="py-4 font-medium">
                                                    {wallet.title}
                                                </td>
                                                <td className="max-w-72 truncate py-4 text-muted-foreground">
                                                    {wallet.description || '—'}
                                                </td>
                                                <td className="py-4">
                                                    <Badge
                                                        variant={
                                                            wallet.status
                                                                ? 'secondary'
                                                                : 'outline'
                                                        }
                                                    >
                                                        {wallet.status
                                                            ? t('Aktif')
                                                            : t('Diarsipkan')}
                                                    </Badge>
                                                </td>
                                                <td className="py-4 text-right font-medium tabular-nums">
                                                    {formatCurrency(
                                                        Number(wallet.balance),
                                                        wallet.currency,
                                                    )}
                                                </td>
                                                <td className="py-4">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                openEditDialog(
                                                                    wallet,
                                                                )
                                                            }
                                                            aria-label={`${t('Ubah')} ${wallet.title}`}
                                                        >
                                                            <Pencil />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-destructive hover:text-destructive"
                                                            onClick={() =>
                                                                openDeleteDialog(
                                                                    wallet,
                                                                )
                                                            }
                                                            aria-label={`${t('Hapus')} ${wallet.title}`}
                                                        >
                                                            <Trash2 />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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
                            {editingWallet ? t('Ubah dompet') : t('Tambah dompet')}
                        </DialogTitle>
                        <DialogDescription>
                            {editingWallet
                                ? t('Perbarui informasi dompet Anda.')
                                : t('Masukkan detail dompet dan saldo awalnya.')}
                        </DialogDescription>
                    </DialogHeader>

                    <form className="grid gap-4" onSubmit={submit}>
                        <div className="grid gap-2">
                            <Label htmlFor="wallet-title">{t('Nama dompet')}</Label>
                            <Input
                                id="wallet-title"
                                value={data.title}
                                onChange={(event) =>
                                    setData('title', event.target.value)
                                }
                                placeholder={t('Contoh: Rekening utama')}
                                autoFocus
                            />
                            <InputError message={errors.title} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="wallet-description">
                                {t('Deskripsi')}{' '}
                                <span className="text-muted-foreground">
                                    ({t('opsional')})
                                </span>
                            </Label>
                            <Textarea
                                id="wallet-description"
                                value={data.description}
                                onChange={(event) =>
                                    setData('description', event.target.value)
                                }
                                placeholder={t('Keterangan singkat untuk dompet ini')}
                                rows={3}
                            />
                            <InputError message={errors.description} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="wallet-balance">{t('Saldo awal')}</Label>
                            <Input
                                id="wallet-balance"
                                type="number"
                                min="0"
                                step="0.01"
                                value={data.balance}
                                onChange={(event) =>
                                    setData('balance', event.target.value)
                                }
                            />
                            <InputError message={errors.balance} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="wallet-currency">{t('Mata uang')}</Label>
                            <Select
                                value={data.currency}
                                onValueChange={(value) =>
                                    setData('currency', value)
                                }
                            >
                                <SelectTrigger
                                    id="wallet-currency"
                                    className="w-full"
                                >
                                    <SelectValue placeholder={t('Pilih mata uang')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {CURRENCY_CODES.map((code) => (
                                        <SelectItem key={code} value={code}>
                                            {code}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.currency} />
                        </div>
                        <div className="grid gap-1.5">
                            <label className="flex items-center gap-2 text-sm font-medium">
                                <Checkbox
                                    checked={data.status}
                                    onCheckedChange={(checked) =>
                                        setData('status', checked === true)
                                    }
                                />
                                {t('Dompet aktif')}
                            </label>
                            <p className="pl-6 text-xs leading-5 text-muted-foreground">
                                {t(
                                    'Nonaktifkan untuk mengarsipkan dompet. Riwayat tetap tersedia, tetapi transaksi dan transfer baru tidak dapat dibuat.',
                                )}
                            </p>
                        </div>
                        {deleteError && (
                            <p className="text-sm text-destructive">
                                {deleteError}
                            </p>
                        )}
                        <DialogFooter className="mt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeDialog}
                            >
                                {t('Batal')}
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {editingWallet
                                    ? t('Simpan perubahan')
                                    : t('Buat dompet')}
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
                        <DialogTitle>{t('Hapus dompet')}</DialogTitle>
                        <DialogDescription>
                            {t('Hapus dompet “:title”?', {
                                title: deletingWallet?.title ?? '',
                            })}
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

Wallets.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Dompet', href: index() },
    ],
};
