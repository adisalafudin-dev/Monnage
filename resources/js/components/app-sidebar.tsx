import { Link } from '@inertiajs/react';
import {
    LayoutGrid,
    ReceiptText,
    Tags,
    WalletCards,
    PiggyBank,
    ArrowRightLeft,
    Repeat,
} from 'lucide-react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';

import { index as budgetsIndex } from '@/routes/budgets';
import { index as categoriesIndex } from '@/routes/categories';
import { index as transactionsIndex } from '@/routes/transactions';
import { index as transfersIndex } from '@/routes/transfers';
import { index as walletsIndex } from '@/routes/wallets';
import { index as recurringTransactionsIndex } from '@/routes/recurring-transactions';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const { t } = useLaravelReactI18n();

    const mainNavItems: NavItem[] = [
        {
            title: t('Dashboard'),
            href: dashboard(),
            icon: LayoutGrid,
        },
        {
            title: t('Dompet'),
            href: walletsIndex(),
            icon: WalletCards,
        },
        {
            title: t('Kategori'),
            href: categoriesIndex(),
            icon: Tags,
        },

        {
            title: t('Transfer'),
            href: transfersIndex(),
            icon: ArrowRightLeft,
        },
        {
            title: t('Budget'),
            href: budgetsIndex(),
            icon: PiggyBank,
        },

        {
            title: t('Transaksi'),
            href: transactionsIndex(),
            icon: ReceiptText,
        },
        {
            title: t('Planning'),
            href: recurringTransactionsIndex(),
            icon: Repeat,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

