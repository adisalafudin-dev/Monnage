import { Head } from '@inertiajs/react';
import { ArrowDownRight, ArrowUpRight, Landmark } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { formatCurrency } from '@/lib/currency';
import { dashboard } from '@/routes';

type MonthlyPoint = {
    month: string;
    income: number | string;
    expense: number | string;
};

type CurrencySummary = {
    currency: string;
    totalBalance: number | string;
    totalIncome: number | string;
    totalExpense: number | string;
};

type MonthlySummaryGroup = {
    currency: string;
    data: MonthlyPoint[];
};

type Props = {
    summary: CurrencySummary[];
    monthlySummary: MonthlySummaryGroup[];
};

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
    currency,
    description,
    icon: Icon,
    iconClassName,
}: {
    title: string;
    amount: number;
    currency: string;
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
                    {formatCurrency(amount, currency)}
                </div>
                <CardDescription className="mt-1 text-xs">
                    {description}
                </CardDescription>
            </CardContent>
        </Card>
    );
}

function CurrencyCashFlowChart({
    currency,
    data,
}: {
    currency: string;
    data: MonthlyPoint[];
}) {
    const chartData = data.map((item) => ({
        ...item,
        income: Number(item.income),
        expense: Number(item.expense),
    }));
    const highestValue = Math.max(
        1,
        ...chartData.flatMap((item) => [item.income, item.expense]),
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Arus kas bulanan · {currency}</CardTitle>
                <CardDescription>
                    Perbandingan pemasukan dan pengeluaran dalam beberapa bulan
                    terakhir untuk dompet {currency}.
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
                                            title={`Pemasukan: ${formatCurrency(item.income, currency)}`}
                                        />
                                        <div
                                            className="w-7 rounded-t-sm bg-rose-500 transition-all"
                                            style={{
                                                height: `${Math.max((item.expense / highestValue) * 100, item.expense > 0 ? 2 : 0)}%`,
                                            }}
                                            title={`Pengeluaran: ${formatCurrency(item.expense, currency)}`}
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
    );
}

export default function Dashboard({ summary, monthlySummary }: Props) {
    return (
        <>
            <Head title="Dashboard" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Ringkasan kondisi keuangan Anda.
                    </p>
                </div>

                {summary.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="py-8 text-center text-sm text-muted-foreground">
                            Belum ada dompet atau transaksi untuk ditampilkan.
                        </CardContent>
                    </Card>
                ) : (
                    summary.map((currencySummary) => (
                        <div
                            key={currencySummary.currency}
                            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                        >
                            <SummaryCard
                                title={`Total saldo (${currencySummary.currency})`}
                                amount={Number(currencySummary.totalBalance)}
                                currency={currencySummary.currency}
                                description="Akumulasi saldo dompet mata uang ini"
                                icon={Landmark}
                                iconClassName="text-muted-foreground"
                            />
                            <SummaryCard
                                title={`Total pemasukan (${currencySummary.currency})`}
                                amount={Number(currencySummary.totalIncome)}
                                currency={currencySummary.currency}
                                description="Seluruh transaksi pemasukan"
                                icon={ArrowUpRight}
                                iconClassName="text-emerald-600 dark:text-emerald-400"
                            />
                            <SummaryCard
                                title={`Total pengeluaran (${currencySummary.currency})`}
                                amount={Number(currencySummary.totalExpense)}
                                currency={currencySummary.currency}
                                description="Seluruh transaksi pengeluaran"
                                icon={ArrowDownRight}
                                iconClassName="text-rose-600 dark:text-rose-400"
                            />
                        </div>
                    ))
                )}

                {monthlySummary.length > 0 ? (
                    monthlySummary.map((group) => (
                        <CurrencyCashFlowChart
                            key={group.currency}
                            currency={group.currency}
                            data={group.data}
                        />
                    ))
                ) : (
                    <div className="flex h-72 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                        Belum ada transaksi untuk ditampilkan.
                    </div>
                )}
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
