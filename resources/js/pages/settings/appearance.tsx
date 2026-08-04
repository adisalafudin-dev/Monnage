import { Head } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import AppearanceTabs from '@/components/appearance-tabs';
import Heading from '@/components/heading';
import { edit as editAppearance } from '@/routes/appearance';

export default function Appearance() {
    const { t } = useLaravelReactI18n();

    return (
        <>
            <Head title={t('Pengaturan tampilan')} />

            <h1 className="sr-only">{t('Pengaturan tampilan')}</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Pengaturan tampilan"
                    description="Perbarui pengaturan tampilan untuk akun Anda"
                />
                <AppearanceTabs />
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
