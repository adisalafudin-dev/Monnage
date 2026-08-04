import { Head, useForm } from '@inertiajs/react';
import { RefreshCw } from 'lucide-react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SettingsLayout from '@/layouts/settings/layout';
import {
    destroy,
    redirect as connectGoogle,
    sync,
    update,
} from '@/routes/integrations/google-sheets';

type Props = {
    googleSheetsConnected: boolean;
    spreadsheetUrl: string | null;
    lastSyncedAt: string | null;
};

export default function Integrations({
    googleSheetsConnected,
    spreadsheetUrl,
    lastSyncedAt,
}: Props) {
    const { data, setData, put, processing, errors } = useForm({
        spreadsheet_url: spreadsheetUrl ?? '',
    });

    function saveSpreadsheet(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        put(update.url());
    }

    return (
        <SettingsLayout>
            <Head title="Integrasi" />

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Google Sheets"
                    description="Sinkronkan transaksi dan ringkasan dompet Anda ke Google Sheets kapan saja."
                />

                {!googleSheetsConnected ? (
                    <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">
                            Hubungkan akun Google untuk memberi izin akses tulis
                            ke Google Sheets.
                        </p>
                        <Button className="mt-3" asChild>
                            <a href={connectGoogle.url()}>
                                Hubungkan Google Sheets
                            </a>
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <form onSubmit={saveSpreadsheet} className="grid gap-2">
                            <Label htmlFor="spreadsheet-url">
                                Link Google Sheets
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    id="spreadsheet-url"
                                    value={data.spreadsheet_url}
                                    onChange={(e) =>
                                        setData(
                                            'spreadsheet_url',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="https://docs.google.com/spreadsheets/d/..."
                                />
                                <Button type="submit" disabled={processing}>
                                    Simpan
                                </Button>
                            </div>
                            {errors.spreadsheet_url && (
                                <p className="text-sm text-destructive">
                                    {errors.spreadsheet_url}
                                </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Pastikan akun Google yang terhubung punya akses
                                edit ke spreadsheet ini.
                            </p>
                        </form>

                        {spreadsheetUrl && (
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div>
                                    <p className="text-sm font-medium">
                                        Status sinkron
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {lastSyncedAt
                                            ? `Terakhir sinkron: ${new Date(lastSyncedAt).toLocaleString('id-ID')}`
                                            : 'Belum pernah disinkron'}
                                    </p>
                                </div>
                                <form action={sync.url()} method="post">
                                    <input
                                        type="hidden"
                                        name="_token"
                                        value={
                                            document.querySelector<HTMLMetaElement>(
                                                'meta[name="csrf-token"]',
                                            )?.content
                                        }
                                    />
                                    <Button type="submit" variant="outline">
                                        <RefreshCw className="size-4" /> Sync
                                        sekarang
                                    </Button>
                                </form>
                            </div>
                        )}

                        <form action={destroy.url()} method="post">
                            <input
                                type="hidden"
                                name="_method"
                                value="DELETE"
                            />
                            <input
                                type="hidden"
                                name="_token"
                                value={
                                    document.querySelector<HTMLMetaElement>(
                                        'meta[name="csrf-token"]',
                                    )?.content
                                }
                            />
                            <Button
                                type="submit"
                                variant="ghost"
                                className="text-destructive"
                            >
                                Putuskan Google Sheets
                            </Button>
                        </form>
                    </div>
                )}
            </div>
        </SettingsLayout>
    );
}
