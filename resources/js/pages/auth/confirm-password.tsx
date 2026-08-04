import { Form, Head } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import {
    index as confirmOptions,
    store as confirmStore,
} from '@/actions/Laravel/Passkeys/Http/Controllers/PasskeyConfirmationController';
import InputError from '@/components/input-error';
import PasskeyVerify from '@/components/passkey-verify';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/password/confirm';

export default function ConfirmPassword() {
    const { t } = useLaravelReactI18n();

    return (
        <>
            <Head title={t('Konfirmasi kata sandi')} />

            <PasskeyVerify
                routes={{
                    options: confirmOptions(),
                    submit: confirmStore(),
                }}
                label={t('Konfirmasi dengan passkey')}
                loadingLabel={t('Mengonfirmasi...')}
                separator={t('Atau konfirmasi dengan kata sandi')}
            />

            <Form {...store.form()} resetOnSuccess={['password']}>
                {({ processing, errors }) => (
                    <div className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="password">{t('Kata sandi')}</Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                placeholder={t('Kata sandi')}
                                autoComplete="current-password"
                                autoFocus
                            />

                            <InputError message={errors.password} />
                        </div>

                        <div className="flex items-center">
                            <Button
                                className="w-full"
                                disabled={processing}
                                data-test="confirm-password-button"
                            >
                                {processing && <Spinner />}
                                {t('Konfirmasi kata sandi')}
                            </Button>
                        </div>
                    </div>
                )}
            </Form>
        </>
    );
}

ConfirmPassword.layout = {
    title: 'Konfirmasi kata sandi',
    description:
        'Ini adalah area aman aplikasi. Harap konfirmasi kata sandi Anda sebelum melanjutkan.',
};
