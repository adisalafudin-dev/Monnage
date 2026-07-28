export type * from './auth';
export type * from './navigation';
export type * from './ui';

export interface Wallet {
    id: number;
    user_id: number;
    title: string;
    description: string | null;
    balance: number;
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
    wallet?: Pick<Wallet, 'id' | 'title'>;
    category?: Pick<Category, 'id' | 'name' | 'type'>;
}

export interface Budget {
    id: number;
    user_id: number;
    category_id: number;
    amount: number;
    month: number;
    year: number;
    spent: number;
    remaining: number;
    percentage: number;
    category: Pick<Category, 'id' | 'name' | 'type'>;
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
