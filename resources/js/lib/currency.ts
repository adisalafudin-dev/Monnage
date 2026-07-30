/** Mirrors app/Support/Currency.php — keep in sync if the backend list changes. */
export const CURRENCIES = {
    IDR: { name: 'Rupiah Indonesia', symbol: 'Rp', decimals: 0 },
    USD: { name: 'US Dollar', symbol: '$', decimals: 2 },
    EUR: { name: 'Euro', symbol: '€', decimals: 2 },
    SGD: { name: 'Singapore Dollar', symbol: 'S$', decimals: 2 },
    MYR: { name: 'Ringgit Malaysia', symbol: 'RM', decimals: 2 },
    JPY: { name: 'Yen Jepang', symbol: '¥', decimals: 0 },
    GBP: { name: 'Pound Sterling', symbol: '£', decimals: 2 },
    AUD: { name: 'Dolar Australia', symbol: 'A$', decimals: 2 },
    CNY: { name: 'Yuan Tiongkok', symbol: '¥', decimals: 2 },
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

export const CURRENCY_CODES = Object.keys(CURRENCIES) as CurrencyCode[];

const formatterCache = new Map<CurrencyCode, Intl.NumberFormat>();

function getFormatter(currency: CurrencyCode) {
    let formatter = formatterCache.get(currency);

    if (!formatter) {
        formatter = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency,
            maximumFractionDigits: CURRENCIES[currency]?.decimals ?? 2,
        });
        formatterCache.set(currency, formatter);
    }

    return formatter;
}

export function formatCurrency(amount: number, currency: string) {
    const code = (currency in CURRENCIES ? currency : 'IDR') as CurrencyCode;

    return getFormatter(code).format(amount);
}
