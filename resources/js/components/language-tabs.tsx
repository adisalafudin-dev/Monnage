import { router } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export default function LanguageTabs({
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    const { currentLocale } = useLaravelReactI18n();

    const activeLocale = currentLocale();

    const languages = [
        { value: 'id', flag: '🇮🇩', label: 'Bahasa Indonesia' },
        { value: 'en', flag: '🇬🇧', label: 'English' },
    ];

    const handleSwitch = (newLocale: string) => {
        if (newLocale === activeLocale) return;

        router.patch(
            '/locale',
            { locale: newLocale },
            { preserveScroll: true, preserveState: false },
        );
    };

    return (
        <div
            className={cn(
                'inline-flex gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800',
                className,
            )}
            {...props}
        >
            {languages.map(({ value, flag, label }) => (
                <button
                    key={value}
                    type="button"
                    onClick={() => handleSwitch(value)}
                    className={cn(
                        'flex items-center rounded-md px-3.5 py-1.5 transition-colors text-sm font-medium',
                        activeLocale === value
                            ? 'bg-white shadow-xs text-neutral-900 dark:bg-neutral-700 dark:text-neutral-100'
                            : 'text-neutral-500 hover:bg-neutral-200/60 hover:text-black dark:text-neutral-400 dark:hover:bg-neutral-700/60',
                    )}
                >
                    <span className="mr-2 text-base">{flag}</span>
                    <span>{label}</span>
                </button>
            ))}
        </div>
    );
}
