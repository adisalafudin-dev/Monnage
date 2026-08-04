import { Head } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import AppearanceTabs from '@/components/appearance-tabs';
import LanguageTabs from '@/components/language-tabs';
import Heading from '@/components/heading';
import { edit as editAppearance } from '@/routes/appearance';

export default function Appearance() {
    const { t } = useLaravelReactI18n();

    return (
        <>
            <Head title={t('Pengaturan tampilan')} />

            <h1 className="sr-only">{t('Pengaturan tampilan')}</h1>

            <div className="space-y-8">
                <div className="space-y-4">
                    <Heading
                        variant="small"
                        title={t('Pengaturan tampilan')}
                        description={t('Perbarui pengaturan tampilan untuk akun Anda')}
                    />
                    <AppearanceTabs />
                </div>

                <div className="space-y-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                    <Heading
                        variant="small"
                        title={t('Bahasa')}
                        description={t('Pilih bahasa antarmuka aplikasi')}
                    />
                    <LanguageTabs />
                </div>
            </div>
        </>
    );
}

Appearance.layout = {
    breadcrumbs: [
        {
            title: 'Pengaturan tampilan',
            href: editAppearance(),
        },
    ],
};
