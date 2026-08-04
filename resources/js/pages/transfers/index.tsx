import { Head, router, useForm } from '@inertiajs/react';
import { ArrowRightLeft, Pencil, Plus, Trash2 } from 'lucide-react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useMemo, useState } from 'react';
import InputError from '@/components/input-error';
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
import { destroy, index, store } from '@/routes/transfers';
import type { Wallet, WalletTransfer } from '@/types';

type Props = {
    transfers: WalletTransfer[];
    wallets: Pick<Wallet, 'id' | 'title' | 'balance' | 'currency' | 'status'>[];
};

type TransferForm = {
    from_wallet_id: string;
    to_wallet_id: string;
    amount: string;
    exchange_rate: string;
    description: string;
    transferred_at: string;
};

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

function initialTransferForm(): TransferForm {
    return {
        from_wallet_id: '',
        to_wallet_id: '',
        amount: '',
        exchange_rate: '1',
        description: '',
        transferred_at: localDateTime(),
    };
}

export default function Transfers({ transfers, wallets }: Props) {
    const { t } = useLaravelReactI18n();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTransfer, setEditingTransfer] =
        useState<WalletTransfer | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingTransfer, setDeletingTransfer] =
        useState<WalletTransfer | null>(null);
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm<TransferForm>(initialTransferForm());

    const activeWallets = wallets.filter((wallet) => wallet.status);
    const canCreateTransfer = activeWallets.length > 1;

    const walletsById = useMemo(
        () => new Map(wallets.map((w) => [String(w.id), w])),
        [wallets],
    );
    const fromWallet = walletsById.get(data.from_wallet_id);
    const toWallet = walletsById.get(data.to_wallet_id);
    const isCrossCurrency =
        !!fromWallet && !!toWallet && fromWallet.currency !== toWallet.currency;
    const convertedPreview =
        isCrossCurrency &&
        Number(data.amount) > 0 &&
        Number(data.exchange_rate) > 0
            ? Number(data.amount) * Number(data.exchange_rate)
            : null;

    function openCreateDialog() {
        if (!canCreateTransfer) return;
        setEditingTransfer(null);
        clearErrors();
        reset();
        setData(initialTransferForm());
        setIsDialogOpen(true);
    }

    function openEditDialog(transfer: WalletTransfer) {
        setEditingTransfer(transfer);
        clearErrors();
        setData({
            from_wallet_id: String(transfer.from_wallet_id),
            to_wallet_id: String(transfer.to_wallet_id),
            amount: String(transfer.amount),
            exchange_rate: String(transfer.exchange_rate),
            description: transfer.description ?? '',
            transferred_at: transfer.transferred_at
                .replace(' ', 'T')
                .slice(0, 16),
        });
        setIsDialogOpen(true);
    }

    function closeDialog() {
        if (processing) return;
        setIsDialogOpen(false);
        setEditingTransfer(null);
        clearErrors();
    }

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const options = { onSuccess: closeDialog };

        post(store.url(), options);
    }

    function deleteTransfer(transfer: WalletTransfer) {
        setDeletingTransfer(transfer);
        setIsDeleteDialogOpen(true);
    }

    function closeDeleteDialog() {
        if (processing) return;
        setIsDeleteDialogOpen(false);
        setDeletingTransfer(null);
    }

    function confirmDelete() {
        if (!deletingTransfer) return;
        router.delete(destroy.url(deletingTransfer), {
            onSuccess: closeDeleteDialog,
        });
    }

    return (
        <>
            <Head title={t('Transfer')} />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {t('Transfer')}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Pindahkan saldo antar dompet Anda sendiri, termasuk
                            antar mata uang berbeda.
                        </p>
                    </div>
                    <Button
                        onClick={openCreateDialog}
                        disabled={!canCreateTransfer}
                    >
                        <Plus /> {t('Tambah transfer')}
                    </Button>
                </div>

                {!canCreateTransfer && (
                    <Card className="border-dashed">
                        <CardContent className="py-5 text-sm text-muted-foreground">
                            Buat minimal dua dompet untuk bisa melakukan
                            transfer antar dompet.
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>{t('Riwayat transfer')}</CardTitle>
                        <CardDescription>
                            Saldo dompet asal dan tujuan diperbarui otomatis
                            untuk setiap transfer.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {transfers.length === 0 ? (
                            <div className="flex min-h-56 flex-col items-center justify-center rounded-lg border border-dashed px-4 text-center">
                                <ArrowRightLeft className="mb-3 size-8 text-muted-foreground" />
                                <p className="font-medium">
                                    {t('Belum ada transfer')}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Catat transfer pertama Anda untuk
                                    memindahkan saldo antar dompet.
                                </p>
                                {canCreateTransfer && (
                                    <Button
                                        className="mt-4"
                                        onClick={openCreateDialog}
                                    >
                                        <Plus />
                                        {t('Tambah transfer')}
                                    </Button>
                                )}
                            </div>
                        ) : (
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
                                                {t('Dari')}
                                            </th>
                                            <th className="pb-3 font-medium">
                                                {t('Ke')}
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
                                        {transfers.map((transfer) => {
                                            const fromCurrency =
                                                transfer.from_wallet
                                                    ?.currency ?? 'IDR';
                                            const toCurrency =
                                                transfer.to_wallet?.currency ??
                                                'IDR';
                                            const crossCurrency =
                                                fromCurrency !== toCurrency;
                                            return (
                                                <tr
                                                    key={transfer.id}
                                                    className="border-b last:border-0"
                                                >
                                                    <td className="py-4 whitespace-nowrap text-muted-foreground">
                                                        {dateFormatter.format(
                                                            new Date(
                                                                transfer.transferred_at,
                                                            ),
                                                        )}
                                                    </td>
                                                    <td className="max-w-60 truncate py-4 font-medium">
                                                        {transfer.description ||
                                                            '—'}
                                                    </td>
                                                    <td className="py-4 text-muted-foreground">
                                                        {
                                                            transfer.from_wallet
                                                                ?.title
                                                        }
                                                    </td>
                                                    <td className="py-4 text-muted-foreground">
                                                        {
                                                            transfer.to_wallet
                                                                ?.title
                                                        }
                                                    </td>
                                                    <td className="py-4 text-right font-medium tabular-nums">
                                                        {formatCurrency(
                                                            Number(
                                                                transfer.amount,
                                                            ),
                                                            fromCurrency,
                                                        )}
                                                        {crossCurrency && (
                                                            <div className="text-xs font-normal text-muted-foreground">
                                                                →{' '}
                                                                {formatCurrency(
                                                                    Number(
                                                                        transfer.converted_amount,
                                                                    ),
                                                                    toCurrency,
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="py-4">
                                                        <div className="flex justify-end gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() =>
                                                                    openEditDialog(
                                                                        transfer,
                                                                    )
                                                                }
                                                                aria-label={t('Ubah transfer')}
                                                            >
                                                                <Pencil />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-destructive hover:text-destructive"
                                                                onClick={() =>
                                                                    deleteTransfer(
                                                                        transfer,
                                                                    )
                                                                }
                                                                aria-label={t('Hapus transfer')}
                                                            >
                                                                <Trash2 />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
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
                            {editingTransfer
                                ? t('Ubah transfer')
                                : t('Tambah transfer')}
                        </DialogTitle>
                        <DialogDescription>
                            Pilih dompet asal dan tujuan untuk memindahkan
                            saldo.
                        </DialogDescription>
                    </DialogHeader>
                    <form className="grid gap-4" onSubmit={submit}>
                        <div className="grid gap-2">
                            <Label htmlFor="transfer-from-wallet">
                                {t('Dari dompet')}
                            </Label>
                            <Select
                                value={data.from_wallet_id}
                                onValueChange={(value) =>
                                    setData((prev) => ({
                                        ...prev,
                                        from_wallet_id: value,
                                        exchange_rate: '1',
                                    }))
                                }
                            >
                                <SelectTrigger
                                    id="transfer-from-wallet"
                                    className="w-full"
                                >
                                    <SelectValue placeholder={t('Pilih dompet asal')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {activeWallets.map((wallet) => (
                                        <SelectItem
                                            key={wallet.id}
                                            value={String(wallet.id)}
                                        >
                                            {wallet.title} ·{' '}
                                            {formatCurrency(
                                                Number(wallet.balance),
                                                wallet.currency,
                                            )}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.from_wallet_id} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="transfer-to-wallet">
                                {t('Ke dompet')}
                            </Label>
                            <Select
                                value={data.to_wallet_id}
                                onValueChange={(value) =>
                                    setData((prev) => ({
                                        ...prev,
                                        to_wallet_id: value,
                                        exchange_rate: '1',
                                    }))
                                }
                            >
                                <SelectTrigger
                                    id="transfer-to-wallet"
                                    className="w-full"
                                >
                                    <SelectValue placeholder={t('Pilih dompet tujuan')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {activeWallets
                                        .filter(
                                            (wallet) =>
                                                String(wallet.id) !==
                                                data.from_wallet_id,
                                        )
                                        .map((wallet) => (
                                            <SelectItem
                                                key={wallet.id}
                                                value={String(wallet.id)}
                                            >
                                                {wallet.title} ·{' '}
                                                {formatCurrency(
                                                    Number(wallet.balance),
                                                    wallet.currency,
                                                )}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.to_wallet_id} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="transfer-amount">
                                {t('Nominal')}{' '}
                                {fromWallet && (
                                    <span className="text-muted-foreground">
                                        ({fromWallet.currency})
                                    </span>
                                )}
                            </Label>
                            <Input
                                id="transfer-amount"
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
                        {isCrossCurrency && (
                            <div className="grid gap-2">
                                <Label htmlFor="transfer-rate">
                                    Kurs ({fromWallet!.currency} →{' '}
                                    {toWallet!.currency})
                                </Label>
                                <Input
                                    id="transfer-rate"
                                    type="number"
                                    min="0.000001"
                                    step="0.000001"
                                    value={data.exchange_rate}
                                    onChange={(event) =>
                                        setData(
                                            'exchange_rate',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="1"
                                />
                                {convertedPreview !== null && (
                                    <p className="text-xs text-muted-foreground">
                                        Dompet tujuan akan bertambah{' '}
                                        {formatCurrency(
                                            convertedPreview,
                                            toWallet!.currency,
                                        )}
                                    </p>
                                )}
                                <InputError message={errors.exchange_rate} />
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="transfer-date">
                                {t('Tanggal transfer')}
                            </Label>
                            <Input
                                id="transfer-date"
                                type="datetime-local"
                                value={data.transferred_at}
                                onChange={(event) =>
                                    setData(
                                        'transferred_at',
                                        event.target.value,
                                    )
                                }
                            />
                            <InputError message={errors.transferred_at} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="transfer-description">
                                {t('Keterangan')}{' '}
                                <span className="text-muted-foreground">
                                    ({t('opsional')})
                                </span>
                            </Label>
                            <Textarea
                                id="transfer-description"
                                rows={3}
                                value={data.description}
                                onChange={(event) =>
                                    setData('description', event.target.value)
                                }
                                placeholder={t('Contoh: Pindah dana ke tabungan')}
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
                                {editingTransfer
                                    ? t('Simpan perubahan')
                                    : t('Simpan transfer')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

Transfers.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Transfer', href: index() },
    ],
};
