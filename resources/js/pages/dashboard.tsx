import { Head } from '@inertiajs/react';
import { ArrowDownRight, ArrowUpRight, Landmark } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes';

type MonthlySummary = {
    month: string;
    income: number | string;
    expense: number | string;
};

type Props = {
    summary: {
        totalBalance: number;
        totalIncome: number;
        totalExpense: number;
    };
    monthlySummary: MonthlySummary[];
};

const currencyFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
});

const monthFormatter = new Intl.DateTimeFormat('id-ID', {
    month: 'short',
    year: 'numeric',
});

function formatMonth(month: string) {
    const [year, monthNumber] = month.split('-').map(Number);

    return monthFormatter.format(new Date(year, monthNumber - 1, 1));
}

function SummaryCard({
    title,
    amount,
    description,
    icon: Icon,
    iconClassName,
}: {
    title: string;
    amount: number;
    description: string;
    icon: typeof Landmark;
    iconClassName: string;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className={`size-4 ${iconClassName}`} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold tracking-tight">
                    {currencyFormatter.format(amount)}
                </div>
                <CardDescription className="mt-1 text-xs">
                    {description}
                </CardDescription>
            </CardContent>
        </Card>
    );
}

export default function Dashboard({ summary, monthlySummary }: Props) {
    const chartData = monthlySummary.map((item) => ({
        ...item,
        income: Number(item.income),
        expense: Number(item.expense),
    }));
    const highestValue = Math.max(
        1,
        ...chartData.flatMap((item) => [item.income, item.expense]),
    );

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Ringkasan kondisi keuangan Anda.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <SummaryCard
                        title="Total saldo"
                        amount={summary.totalBalance}
                        description="Akumulasi saldo seluruh dompet"
                        icon={Landmark}
                        iconClassName="text-muted-foreground"
                    />
                    <SummaryCard
                        title="Total pemasukan"
                        amount={summary.totalIncome}
                        description="Seluruh transaksi pemasukan"
                        icon={ArrowUpRight}
                        iconClassName="text-emerald-600 dark:text-emerald-400"
                    />
                    <SummaryCard
                        title="Total pengeluaran"
                        amount={summary.totalExpense}
                        description="Seluruh transaksi pengeluaran"
                        icon={ArrowDownRight}
                        iconClassName="text-rose-600 dark:text-rose-400"
                    />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Arus kas bulanan</CardTitle>
                        <CardDescription>
                            Perbandingan pemasukan dan pengeluaran dalam enam bulan terakhir.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {chartData.length === 0 ? (
                            <div className="flex h-72 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                                Belum ada transaksi untuk ditampilkan.
                            </div>
                        ) : (
                            <>
                                <div className="mb-5 flex items-center gap-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1.5">
                                        <span className="size-2 rounded-sm bg-emerald-500" />
                                        Pemasukan
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <span className="size-2 rounded-sm bg-rose-500" />
                                        Pengeluaran
                                    </span>
                                </div>
                                <div className="grid h-72 grid-cols-1 gap-5 border-b border-l pl-3 sm:grid-cols-2 lg:grid-cols-6">
                                    {chartData.map((item) => (
                                        <div
                                            key={item.month}
                                            className="flex min-w-0 flex-col justify-end gap-2 pt-4"
                                        >
                                            <div className="flex h-52 items-end justify-center gap-2">
                                                <div
                                                    className="w-7 rounded-t-sm bg-emerald-500 transition-all"
                                                    style={{
                                                        height: `${Math.max((item.income / highestValue) * 100, item.income > 0 ? 2 : 0)}%`,
                                                    }}
                                                    title={`Pemasukan: ${currencyFormatter.format(item.income)}`}
                                                />
                                                <div
                                                    className="w-7 rounded-t-sm bg-rose-500 transition-all"
                                                    style={{
                                                        height: `${Math.max((item.expense / highestValue) * 100, item.expense > 0 ? 2 : 0)}%`,
                                                    }}
                                                    title={`Pengeluaran: ${currencyFormatter.format(item.expense)}`}
                                                />
                                            </div>
                                            <div className="truncate text-center text-xs text-muted-foreground">
                                                {formatMonth(item.month)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
