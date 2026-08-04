import { Link } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type PaginationLink = { url: string | null; label: string; active: boolean };

type Props = {
    links: PaginationLink[];
    from: number | null;
    to: number | null;
    total: number;
    itemLabel?: string;
};

export default function Pagination({
    links,
    from,
    to,
    total,
    itemLabel = 'item',
}: Props) {
    const { t } = useLaravelReactI18n();

    if (total === 0 || links.length <= 3) {
        return null;
    }

    return (
        <div className="flex flex-col items-center justify-between gap-3 border-t pt-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
                {t('Menampilkan :from–:to dari :total :item', {
                    from: from ?? 0,
                    to: to ?? 0,
                    total,
                    item: t(itemLabel),
                })}
            </p>
            <div className="flex items-center gap-1">
                {links.map((link, index) => {
                    const isPrev = index === 0;
                    const isNext = index === links.length - 1;
                    const content = isPrev ? (
                        <ChevronLeft className="size-4" />
                    ) : isNext ? (
                        <ChevronRight className="size-4" />
                    ) : (
                        link.label
                    );

                    if (!link.url) {
                        return (
                            <span
                                key={index}
                                className="flex size-9 items-center justify-center rounded-md text-sm text-muted-foreground opacity-40"
                            >
                                {content}
                            </span>
                        );
                    }

                    return (
                        <Link
                            key={index}
                            href={link.url}
                            preserveState
                            preserveScroll
                            className={cn(
                                'flex size-9 items-center justify-center rounded-md text-sm transition-colors hover:bg-accent',
                                link.active &&
                                    'bg-primary text-primary-foreground hover:bg-primary',
                            )}
                        >
                            {content}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
