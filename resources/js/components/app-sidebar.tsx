import { Link } from '@inertiajs/react';
import {
    LayoutGrid,
    ReceiptText,
    Tags,
    WalletCards,
    PiggyBank,
    ArrowRightLeft,
} from 'lucide-react';
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
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Dompet',
        href: walletsIndex(),
        icon: WalletCards,
    },
    {
        title: 'Kategori',
        href: categoriesIndex(),
        icon: Tags,
    },
    {
        title: 'Transaksi',
        href: transactionsIndex(),
        icon: ReceiptText,
    },

    {
        title: 'Transfer',
        href: transfersIndex(),
        icon: ArrowRightLeft,
    },
    {
        title: 'Budget',
        href: budgetsIndex(),
        icon: PiggyBank,
    },
];

export function AppSidebar() {
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
