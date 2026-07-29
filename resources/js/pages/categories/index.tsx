import { Head, router, useForm } from '@inertiajs/react';
import {
    ArrowDownRight,
    ArrowUpRight,
    FolderTree,
    Pencil,
    Plus,
    Trash2,
} from 'lucide-react';
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
import { dashboard } from '@/routes';
import { destroy, index, store, update } from '@/routes/categories';
import type { Category } from '@/types';

type CategoryWithUsage = Category & {
    transactions_count: number;
    budgets_count: number;
};

type Props = {
    categories: CategoryWithUsage[];
};

type CategoryForm = {
    name: string;
    type: 'income' | 'expense';
};

const initialForm: CategoryForm = {
    name: '',
    type: 'expense',
};

export default function Categories({ categories }: Props) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] =
        useState<CategoryWithUsage | null>(null);
    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm<CategoryForm>(initialForm);

    const incomeCount = categories.filter(
        (category) => category.type === 'income',
    ).length;
    const expenseCount = categories.filter(
        (category) => category.type === 'expense',
    ).length;
    const isTypeLocked = Boolean(
        editingCategory &&
        (editingCategory.transactions_count > 0 ||
            editingCategory.budgets_count > 0),
    );

    function openCreateDialog() {
        setEditingCategory(null);
        clearErrors();
        reset();
        setIsDialogOpen(true);
    }

    function openEditDialog(category: CategoryWithUsage) {
        setEditingCategory(category);
        clearErrors();
        setData({ name: category.name, type: category.type });
        setIsDialogOpen(true);
    }

    function closeDialog() {
        if (processing) return;

        setIsDialogOpen(false);
        setEditingCategory(null);
        clearErrors();
    }

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const options = { onSuccess: closeDialog };

        if (editingCategory) {
            put(update.url(editingCategory), options);
            return;
        }

        post(store.url(), options);
    }

    function deleteCategory(category: CategoryWithUsage) {
        if (category.transactions_count > 0 || category.budgets_count > 0)
            return;
        if (!window.confirm(`Hapus kategori “${category.name}”?`)) return;

        router.delete(destroy.url(category));
    }

    return (
        <>
            <Head title="Kategori" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Kategori
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Kelompokkan transaksi pemasukan dan pengeluaran
                            Anda.
                        </p>
                    </div>
                    <Button onClick={openCreateDialog}>
                        <Plus />
                        Tambah kategori
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total kategori
                            </CardTitle>
                            <FolderTree className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {categories.length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Pemasukan
                            </CardTitle>
                            <ArrowUpRight className="size-4 text-emerald-600 dark:text-emerald-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {incomeCount}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Pengeluaran
                            </CardTitle>
                            <ArrowDownRight className="size-4 text-rose-600 dark:text-rose-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {expenseCount}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar kategori</CardTitle>
                        <CardDescription>
                            Kategori yang sudah digunakan transaksi atau budget
                            tidak dapat dihapus.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {categories.length === 0 ? (
                            <div className="flex min-h-56 flex-col items-center justify-center rounded-lg border border-dashed px-4 text-center">
                                <FolderTree className="mb-3 size-8 text-muted-foreground" />
                                <p className="font-medium">
                                    Belum ada kategori
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Buat kategori agar transaksi dapat
                                    dikelompokkan.
                                </p>
                                <Button
                                    className="mt-4"
                                    onClick={openCreateDialog}
                                >
                                    <Plus />
                                    Tambah kategori
                                </Button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-150 text-sm">
                                    <thead className="border-b text-left text-muted-foreground">
                                        <tr>
                                            <th className="pb-3 font-medium">
                                                Nama
                                            </th>
                                            <th className="pb-3 font-medium">
                                                Jenis
                                            </th>
                                            <th className="pb-3 text-right font-medium">
                                                Dipakai transaksi
                                            </th>
                                            <th className="w-24 pb-3 text-right font-medium">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {categories.map((category) => {
                                            const isUsed =
                                                category.transactions_count >
                                                    0 ||
                                                category.budgets_count > 0;
                                            return (
                                                <tr
                                                    key={category.id}
                                                    className="border-b last:border-0"
                                                >
                                                    <td className="py-4 font-medium">
                                                        {category.name}
                                                    </td>
                                                    <td className="py-4">
                                                        <Badge
                                                            variant={
                                                                category.type ===
                                                                'income'
                                                                    ? 'secondary'
                                                                    : 'outline'
                                                            }
                                                        >
                                                            {category.type ===
                                                            'income'
                                                                ? 'Pemasukan'
                                                                : 'Pengeluaran'}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-4 text-right text-muted-foreground tabular-nums">
                                                        {
                                                            category.transactions_count
                                                        }
                                                    </td>
                                                    <td className="py-4">
                                                        <div className="flex justify-end gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() =>
                                                                    openEditDialog(
                                                                        category,
                                                                    )
                                                                }
                                                                aria-label={`Ubah ${category.name}`}
                                                            >
                                                                <Pencil />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-destructive hover:text-destructive"
                                                                onClick={() =>
                                                                    deleteCategory(
                                                                        category,
                                                                    )
                                                                }
                                                                disabled={
                                                                    isUsed
                                                                }
                                                                aria-label={`Hapus ${category.name}`}
                                                                title={
                                                                    isUsed
                                                                        ? 'Kategori sudah digunakan'
                                                                        : undefined
                                                                }
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
                            {editingCategory
                                ? 'Ubah kategori'
                                : 'Tambah kategori'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingCategory
                                ? 'Perbarui nama atau jenis kategori.'
                                : 'Tentukan kategori untuk transaksi Anda.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form className="grid gap-4" onSubmit={submit}>
                        <div className="grid gap-2">
                            <Label htmlFor="category-name">Nama kategori</Label>
                            <Input
                                id="category-name"
                                value={data.name}
                                onChange={(event) =>
                                    setData('name', event.target.value)
                                }
                                placeholder="Contoh: Makan & minum"
                                autoFocus
                            />
                            <InputError message={errors.name} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="category-type">Jenis</Label>
                            <Select
                                value={data.type}
                                onValueChange={(value: CategoryForm['type']) =>
                                    setData('type', value)
                                }
                                disabled={isTypeLocked}
                            >
                                <SelectTrigger
                                    id="category-type"
                                    className="w-full"
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="income">
                                        Pemasukan
                                    </SelectItem>
                                    <SelectItem value="expense">
                                        Pengeluaran
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {isTypeLocked && (
                                <p className="text-xs text-muted-foreground">
                                    Jenis tidak dapat diubah karena kategori
                                    sudah digunakan.
                                </p>
                            )}
                            <InputError message={errors.type} />
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
                                {editingCategory
                                    ? 'Simpan perubahan'
                                    : 'Buat kategori'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

Categories.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Kategori', href: index() },
    ],
};
