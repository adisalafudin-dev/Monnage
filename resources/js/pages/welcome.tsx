import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowDownRight,
    ArrowRight,
    ArrowUpRight,
    ChartNoAxesCombined,
    Check,
    CreditCard,
    PiggyBank,
    ReceiptText,
    ShieldCheck,
    Tags,
    WalletCards,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { dashboard, login, register } from '@/routes';

const rupiah = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
});

const features = [
    {
        icon: WalletCards,
        title: 'Semua dompet, satu tempat',
        description: 'Pantau saldo rekening, uang tunai, dan e-wallet tanpa berpindah aplikasi.',
    },
    {
        icon: ReceiptText,
        title: 'Transaksi yang mudah dicatat',
        description: 'Catat pemasukan dan pengeluaran dalam hitungan detik, lalu lihat riwayatnya kapan saja.',
    },
    {
        icon: Tags,
        title: 'Kategori yang lebih rapi',
        description: 'Kelompokkan setiap transaksi agar Anda tahu ke mana uang Anda digunakan.',
    },
    {
        icon: PiggyBank,
        title: 'Budget lebih terarah',
        description: 'Tetapkan batas pengeluaran dan lihat progresnya sebelum melewati rencana.',
    },
];

export default function Welcome() {
    const { auth } = usePage().props;
    const dashboardHref = dashboard();

    return (
        <>
            <Head title="Kelola keuangan dengan lebih tenang" />

            <div className="min-h-svh bg-background text-foreground">
                <header className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link href={dashboardHref} className="flex items-center gap-2 font-semibold">
                        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <WalletCards className="size-4" />
                        </span>
                        <span>Monnage</span>
                    </Link>

                    <nav className="flex items-center gap-2">
                        {auth.user ? (
                            <Button asChild size="sm">
                                <Link href={dashboardHref}>Buka dashboard</Link>
                            </Button>
                        ) : (
                            <>
                                <Button asChild variant="ghost" size="sm">
                                    <Link href={login()}>Masuk</Link>
                                </Button>
                                <Button asChild size="sm">
                                    <Link href={register()}>Mulai sekarang</Link>
                                </Button>
                            </>
                        )}
                    </nav>
                </header>

                <main>
                    <section className="relative overflow-hidden">
                        <div className="absolute inset-x-0 top-0 -z-10 h-112 bg-[radial-gradient(ellipse_70%_50%_at_50%_-20%,color-mix(in_oklab,var(--primary)_18%,transparent),transparent)]" />
                        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-16 pb-20 sm:px-6 sm:pt-24 lg:grid-cols-[1fr_0.9fr] lg:px-8 lg:pt-28 lg:pb-28">
                            <div className="max-w-2xl">
                                <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
                                    <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                                    Keuangan pribadi yang lebih teratur
                                </div>
                                <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                                    Pahami uang Anda, lalu arahkan ke tujuan yang lebih berarti.
                                </h1>
                                <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                                    Monnage membantu Anda memantau saldo, mencatat transaksi, dan mengelola budget dalam satu ruang yang sederhana.
                                </p>

                                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                    <Button asChild size="lg" className="group">
                                        <Link href={auth.user ? dashboardHref : register()}>
                                            {auth.user ? 'Buka dashboard' : 'Mulai kelola keuangan'}
                                            <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
                                        </Link>
                                    </Button>
                                    {!auth.user && (
                                        <Button asChild size="lg" variant="outline">
                                            <Link href={login()}>Saya sudah punya akun</Link>
                                        </Button>
                                    )}
                                </div>

                                <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1.5"><Check className="size-4 text-emerald-600 dark:text-emerald-400" /> Catat transaksi dengan cepat</span>
                                    <span className="flex items-center gap-1.5"><Check className="size-4 text-emerald-600 dark:text-emerald-400" /> Pantau setiap dompet</span>
                                </div>
                            </div>

                            <DashboardPreview />
                        </div>
                    </section>

                    <section className="border-y bg-muted/30">
                        <div className="mx-auto max-w-6xl px-4 py-18 sm:px-6 lg:px-8">
                            <div className="max-w-2xl">
                                <p className="text-sm font-medium text-primary">Dibuat untuk kebiasaan finansial yang lebih baik</p>
                                <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Semua yang Anda perlukan untuk melihat gambaran keuangan secara utuh.</h2>
                            </div>

                            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                {features.map(({ icon: Icon, title, description }) => (
                                    <div key={title} className="rounded-xl border bg-card p-5 shadow-sm">
                                        <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <Icon className="size-4" />
                                        </span>
                                        <h3 className="mt-4 font-semibold">{title}</h3>
                                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
                        <div className="rounded-2xl border bg-card px-6 py-10 text-center shadow-sm sm:px-12">
                            <ChartNoAxesCombined className="mx-auto size-8 text-primary" />
                            <h2 className="mt-4 text-3xl font-semibold tracking-tight">Mulai dari satu transaksi hari ini.</h2>
                            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">Kebiasaan kecil yang dicatat konsisten memberi Anda gambaran yang jauh lebih jelas tentang keuangan.</p>
                            <Button asChild className="mt-7">
                                <Link href={auth.user ? dashboardHref : register()}>
                                    {auth.user ? 'Kembali ke dashboard' : 'Buat akun gratis'}
                                    <ArrowRight />
                                </Link>
                            </Button>
                        </div>
                    </section>
                </main>

                <footer className="border-t">
                    <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                        <span>© {new Date().getFullYear()} Monnage</span>
                        <span>Kelola uang Anda dengan lebih sadar.</span>
                    </div>
                </footer>
            </div>
        </>
    );
}

function DashboardPreview() {
    const monthlyBars = [38, 55, 43, 70, 61, 84, 67];

    return (
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="absolute -inset-5 -z-10 rounded-[2rem] bg-primary/8 blur-2xl" />
            <div className="overflow-hidden rounded-2xl border bg-card shadow-2xl shadow-primary/10">
                <div className="flex items-center justify-between border-b px-5 py-4">
                    <div className="flex items-center gap-2">
                        <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground"><WalletCards className="size-3.5" /></span>
                        <span className="text-sm font-semibold">Ringkasan keuangan</span>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-medium text-emerald-700 dark:text-emerald-400">Bulan ini</span>
                </div>
                <div className="p-5">
                    <p className="text-xs text-muted-foreground">Total saldo</p>
                    <p className="mt-1 text-2xl font-bold tracking-tight">{rupiah.format(12450000)}</p>
                    <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="rounded-lg border bg-muted/30 p-3"><div className="flex items-center gap-1 text-xs text-muted-foreground"><ArrowUpRight className="size-3 text-emerald-600" /> Pemasukan</div><p className="mt-1 text-sm font-semibold">{rupiah.format(8500000)}</p></div>
                        <div className="rounded-lg border bg-muted/30 p-3"><div className="flex items-center gap-1 text-xs text-muted-foreground"><ArrowDownRight className="size-3 text-rose-600" /> Pengeluaran</div><p className="mt-1 text-sm font-semibold">{rupiah.format(4250000)}</p></div>
                    </div>
                    <div className="mt-5 rounded-lg border p-4">
                        <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Arus kas</p><p className="text-xs text-muted-foreground">7 hari terakhir</p></div><span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">+12,4%</span></div>
                        <div className="mt-5 flex h-24 items-end gap-2">
                            {monthlyBars.map((height, index) => <span key={index} style={{ height: `${height}%` }} className="flex-1 rounded-t-sm bg-primary/20 last:bg-primary" />)}
                        </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2.5 text-xs"><span className="flex items-center gap-2"><CreditCard className="size-3.5 text-muted-foreground" /> Belanja & kebutuhan</span><span className="font-medium">{rupiah.format(1250000)}</span></div>
                </div>
            </div>
        </div>
    );
}
