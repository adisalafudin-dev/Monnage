import { router } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import type { SVGProps } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    redirect as googleRedirect,
    destroy as googleDisconnect,
} from '@/routes/google';

function GoogleLogo(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
            <path
                d="M21.6 12.23c0-.78-.07-1.53-.2-2.25H12v4.26h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.98-4.33 2.98-7.53Z"
                fill="#4285F4"
            />
            <path
                d="M12 22c2.7 0 4.96-.9 6.62-2.43l-3.24-2.5c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.75-5.59-4.11H3.07v2.58A10 10 0 0 0 12 22Z"
                fill="#34A853"
            />
            <path
                d="M6.41 13.92A5.98 5.98 0 0 1 6.41 10.08V7.5H3.07a10 10 0 0 0 0 12.84l3.34-2.42Z"
                fill="#FBBC05"
            />
            <path
                d="M12 6.04c1.47 0 2.79.5 3.83 1.49l2.87-2.87A9.96 9.96 0 0 0 12 2a10 10 0 0 0-8.93 5.5l3.34 2.58C7.2 7.79 9.4 6.04 12 6.04Z"
                fill="#EA4335"
            />
        </svg>
    );
}

export type Props = {
    googleConnected?: boolean;
    hasPassword?: boolean;
};

export default function ManageGoogleAccount({
    googleConnected,
    hasPassword,
}: Props) {
    const { t } = useLaravelReactI18n();

    function disconnect() {
        router.delete(googleDisconnect.url(), { preserveScroll: true });
    }

    return (
        <div className="space-y-6">
            <Heading
                variant="small"
                title="Akun Google"
                description="Masuk lebih cepat dengan menghubungkan akun Google Anda"
            />

            <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <GoogleLogo className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="font-medium">Google</p>
                        <p className="text-sm text-muted-foreground">
                            {googleConnected ? t('Terhubung') : t('Belum terhubung')}
                        </p>
                    </div>
                </div>

                {googleConnected ? (
                    <Button
                        variant="outline"
                        onClick={disconnect}
                        disabled={!hasPassword}
                        title={
                            !hasPassword
                                ? t('Atur kata sandi terlebih dahulu agar Anda tidak kehilangan akses ke akun Anda')
                                : undefined
                        }
                    >
                        {t('Putuskan koneksi')}
                    </Button>
                ) : (
                    <Button variant="outline" asChild>
                        <a href={googleRedirect.url()}>{t('Hubungkan')}</a>
                    </Button>
                )}
            </div>

            {googleConnected && !hasPassword && (
                <p className="text-sm text-muted-foreground">
                    {t('Akun ini tidak memiliki kata sandi. Tambahkan kata sandi di atas sebelum memutuskan koneksi Google, atau Anda akan kehilangan akses.')}
                </p>
            )}
        </div>
    );
}
