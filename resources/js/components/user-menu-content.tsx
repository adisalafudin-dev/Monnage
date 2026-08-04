import { Link, router } from '@inertiajs/react';
import { Globe, LogOut, Settings } from 'lucide-react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';
import type { User } from '@/types';

type Props = {
    user: User;
};

export function UserMenuContent({ user }: Props) {
    const cleanup = useMobileNavigation();
    const { t, currentLocale } = useLaravelReactI18n();

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    const handleLocaleSwitch = () => {
        const nextLocale = currentLocale() === 'id' ? 'en' : 'id';
        cleanup();
        router.patch(
            '/locale',
            { locale: nextLocale },
            { preserveScroll: true, preserveState: false },
        );
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full cursor-pointer"
                        href={edit()}
                        prefetch
                        onClick={cleanup}
                    >
                        <Settings className="mr-2" />
                        {t('Pengaturan')}
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleLocaleSwitch}>
                    <Globe className="mr-2" />
                    {currentLocale() === 'id' ? 'English' : 'Bahasa Indonesia'}
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link
                    className="block w-full cursor-pointer"
                    href={logout()}
                    as="button"
                    onClick={handleLogout}
                    data-test="logout-button"
                >
                    <LogOut className="mr-2" />
                    {t('Keluar')}
                </Link>
            </DropdownMenuItem>
        </>
    );
}
