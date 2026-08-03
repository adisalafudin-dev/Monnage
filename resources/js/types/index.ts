export type * from './auth';
export type * from './navigation';
export type * from './ui';

export interface Wallet {
    id: number;
    user_id: number;
    title: string;
    description: string | null;
    balance: number;
    currency: string;
    status: boolean;
    created_at: string;
    updated_at: string;
}

export interface Category {
    id: number;
    user_id: number;
    name: string;
    type: 'income' | 'expense';
    created_at: string;
    updated_at: string;
}

export interface Transaction {
    id: number;
    wallet_id: number;
    category_id: number;
    amount: number;
    description: string | null;
    transacted_at: string;
    created_at: string;
    updated_at: string;
    wallet?: Pick<Wallet, 'id' | 'title' | 'currency'>;
    category?: Pick<Category, 'id' | 'name' | 'type'>;
}

export interface Budget {
    id: number;
    category_id: number;
    amount: number;
    currency: string;
    rollover: boolean;
    rolled_in: number;
    available: number;
    month: number;
    year: number;
    spent: number;
    remaining: number;
    percentage: number;
    category: Pick<Category, 'id' | 'name' | 'type'>;
}

export interface OverallBudget {
    id: number | null;
    currency: string;
    amount: number | null;
    spent: number;
    remaining: number | null;
    percentage: number | null;
}

export interface TransactionFilters {
    wallet_id?: string;
    category_id?: string;
    start_date?: string;
    end_date?: string;
}

export interface BudgetFilters {
    month: number;
    year: number;
}

export interface WalletTransfer {
    id: number;
    from_wallet_id: number;
    to_wallet_id: number;
    amount: number;
    exchange_rate: number;
    converted_amount: number;
    description: string | null;
    transferred_at: string;
    created_at: string;
    updated_at: string;
    from_wallet?: Pick<Wallet, 'id' | 'title' | 'currency'>;
    to_wallet?: Pick<Wallet, 'id' | 'title' | 'currency'>;
}

export interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: { url: string | null; label: string; active: boolean }[];
}

export interface TransactionTotals {
    currency: string;
    income: number;
    expense: number;
    count: number;
}

export interface RecurringTransaction {
    id: number;
    wallet_id: number;
    category_id: number;
    amount: number;
    description: string | null;
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    start_date: string;
    end_date: string | null;
    next_due_date: string;
    last_generated_at: string | null;
    is_active: boolean;
    wallet?: Pick<Wallet, 'id' | 'title' | 'currency'>;
    category?: Pick<Category, 'id' | 'name' | 'type'>;
}
