import { Link } from '@inertiajs/react';
import { ArrowLeft, ArrowUpRight, ShieldCheck, WalletCards } from 'lucide-react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="min-h-svh bg-muted/30 p-4 sm:p-6 lg:flex lg:items-center lg:justify-center">
            <div className="grid min-h-[calc(100svh-2rem)] w-full max-w-6xl overflow-hidden rounded-2xl border bg-card shadow-sm sm:min-h-[calc(100svh-3rem)] lg:min-h-170 lg:grid-cols-[0.95fr_1.05fr]">
                <aside className="relative hidden overflow-hidden bg-white p-10 text-slate-600 lg:flex lg:flex-col">
                    <div className="absolute -top-24 -right-20 size-80 rounded-full bg-slate-100 blur-3xl" />
                    <div className="absolute -bottom-28 -left-24 size-96 rounded-full bg-slate-100 blur-3xl" />
                    <Link href={home()} className="relative flex items-center gap-2 text-lg font-semibold text-black">
                        <span className="flex size-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                            <WalletCards className="size-4" />
                        </span>
                        Monnage
                    </Link>

                    <div className="relative my-auto max-w-sm">
                        <p className="text-sm font-medium text-slate-600">
                            Keuangan yang lebih terarah
                        </p>
                        <h2 className="mt-3 text-4xl font-semibold tracking-tight text-black">
                            Setiap catatan kecil membawa Anda lebih dekat pada tujuan.
                        </h2>
                        <p className="mt-5 leading-7 text-slate-600">
                            Pantau saldo, pahami kebiasaan belanja, dan kelola budget Anda dalam satu tempat.
                        </p>
                    </div>

                    <div className="relative rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between text-sm text-slate-600">
                            <span>Saldo bulan ini</span>
                            <ArrowUpRight className="size-4" />
                        </div>
                        <p className="mt-2 text-2xl font-semibold text-black">Rp12.450.000</p>
                        <div className="mt-4 flex items-center gap-2 text-xs text-slate-600">
                            <ShieldCheck className="size-3.5" /> Data Anda tersimpan dengan aman
                        </div>
                    </div>
                </aside>

                <main className="flex flex-col px-6 py-8 sm:px-10 sm:py-10 lg:px-16 lg:py-12">
                    <Link href={home()} className="flex items-center gap-2 self-start font-semibold lg:hidden">
                        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <WalletCards className="size-4" />
                        </span>
                        Monnage
                    </Link>

                    <Link
                        href={home()}
                        className="mt-6 inline-flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground lg:mt-0"
                    >
                        <ArrowLeft className="size-4" />
                        Kembali ke beranda
                    </Link>

                    <div className="my-auto w-full max-w-sm lg:mx-auto">
                        <div className="mb-8 mt-14 lg:mt-0">
                            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                            {description && (
                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                    {description}
                                </p>
                            )}
                        </div>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
