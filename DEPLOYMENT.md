# Panduan Deploy Monnage — CloudPanel + Server Sendiri (via Cloudflare Tunnel)

Berdasarkan audit kode di commit `2c77397`. Baca `SEBELUM DEPLOY` dulu — ada satu fix wajib yang harus masuk kode sebelum langkah CloudPanel di bawah dijalankan.

---

## SEBELUM DEPLOY — fix wajib di kode

### 1. Tambahkan `TrustProxies` (wajib, karena kamu pakai Cloudflare Tunnel)

Cloudflare Tunnel meneruskan request sebagai HTTP biasa ke server lokal kamu, walau user aslinya akses via HTTPS. Tanpa konfigurasi ini, Laravel bisa salah baca skema (HTTP bukan HTTPS), salah baca IP asli client (pengaruh ke rate limiter login/2FA Fortify), dan cookie secure flag bisa tidak konsisten.

Di `bootstrap/app.php`, tambahkan di dalam `->withMiddleware(function (Middleware $middleware) {...})`:
```php
$middleware->trustProxies(at: '*'); // aman karena Cloudflare Tunnel adalah satu-satunya jalur masuk ke server ini
```
> Kalau server kamu punya jalur akses lain selain lewat tunnel (misal port terbuka langsung ke internet), jangan pakai `'*'` — ganti dengan IP range Cloudflare yang sebenarnya dari https://www.cloudflare.com/ips/.

### 2. (Opsional tapi direkomendasikan) Guard wallet delete terhadap recurring transaction aktif
Di `WalletController@destroy`, tambahkan cek `recurringTransactions()->exists()` sejajar dengan cek transaksi/transfer yang sudah ada, supaya wallet dengan recurring rule aktif tidak bisa dihapus begitu saja.

### 3. Idealnya sebelum live: tes manual menyeluruh
Karena belum ada automated test untuk Wallet/Category/Transaction/Budget/Transfer/RecurringTransaction, lakukan minimal satu kali uji manual end-to-end untuk tiap fitur inti sebelum mengumumkan app live ke pengguna nyata: buat wallet → transaksi income/expense → cek saldo benar → transfer antar wallet → budget → recurring transaction → hapus/edit masing-masing.

---

## Langkah 1 — Setup Site di CloudPanel

1. **Add Site → PHP** (bukan Node.js — Vite build cuma langkah build, runtime-nya tetap PHP/Laravel).
2. Pilih **PHP 8.3** (sesuai `composer.json`: `"php": "^8.3"`).
3. Domain: masukkan domain/subdomain kamu (yang nanti diarahkan lewat Cloudflare Tunnel).
4. **Document root harus diarahkan ke folder `public/`**, bukan root repo — ini kesalahan paling umum saat deploy Laravel manual. Kalau CloudPanel generate document root default di `htdocs/<domain>/`, pastikan repo di-clone satu level di atasnya dan document root site di-set ke `htdocs/<domain>/public`, atau clone langsung ke situ lalu arahkan `public/` sebagai webroot via vhost template CloudPanel.

## Langkah 2 — Clone & install dependencies

Via SSH sebagai site user yang dibuat CloudPanel:
```bash
cd ~/htdocs/<domain>
git clone https://github.com/adisalafudin-dev/Monnage.git .
composer install --no-dev --optimize-autoloader
npm ci
npm run build
```
`npm run build` menghasilkan asset production di `public/build/` — ini yang dipakai Vite/Inertia saat request masuk, bukan `npm run dev`.

## Langkah 3 — Environment

```bash
cp .env.example .env
php artisan key:generate --force   # HANYA SEKALI — backup APP_KEY setelah ini
```

Edit `.env`, minimal wajib diubah dari default:
```env
APP_NAME=Monnage
APP_ENV=production
APP_DEBUG=false
APP_URL=https://domainmu.com          # https, bukan http, walau tunnel-nya internal HTTP

DB_CONNECTION=mysql                    # atau pgsql — pilih sesuai DB yang dipasang di server, JANGAN pakai sqlite default untuk production
DB_HOST=127.0.0.1
DB_DATABASE=monnage
DB_USERNAME=...
DB_PASSWORD=...

SESSION_SECURE_COOKIE=true             # wajib — tidak ada default, kalau dibiarkan kosong cookie session tidak Secure
SESSION_DOMAIN=.domainmu.com

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI="${APP_URL}/auth/google/callback"   # daftarkan persis URL ini di Google Cloud Console
```

> **Catatan DB:** `DashboardController` memakai `TO_CHAR()` (sintaks PostgreSQL) untuk grouping bulanan. Kalau kamu pakai MySQL di production, ini akan error. Pastikan `DB_CONNECTION` di atas memang PostgreSQL, atau kabari saya untuk dibuatkan versi query yang portable.

## Langkah 4 — Migrate & cache

```bash
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```
Jalankan ulang 3 baris `*:cache` ini **setiap kali deploy update baru** — kalau lupa, perubahan `.env` atau route tidak akan kepakai karena cache lama masih aktif.

## Langkah 5 — Permission

```bash
chmod -R 775 storage bootstrap/cache
```
CloudPanel biasanya sudah set ownership site user dengan benar; kalau masih error "permission denied" di log, cek `chown` folder `storage/` dan `bootstrap/cache/` ke user PHP-FPM site tersebut.

## Langkah 6 — Cron untuk scheduler (wajib — recurring transaction tidak akan jalan tanpa ini)

`recurring-transactions:process` di-schedule `dailyAt('00:05')`, tapi scheduler Laravel butuh satu entry cron yang jalan tiap menit untuk mengeceknya. CloudPanel punya UI **Cron Jobs** di panel site kamu — tambahkan:
```
* * * * * php /home/<site-user>/htdocs/<domain>/artisan schedule:run >> /dev/null 2>&1
```
Sesuaikan path PHP kalau CloudPanel pakai versioned binary (misal `/usr/bin/php8.3`).

## Langkah 7 — Cloudflare Tunnel

- Arahkan tunnel ke `http://localhost:<port CloudPanel site>` (bukan https — TLS sudah di-terminate di sisi Cloudflare).
- Set SSL/TLS mode di Cloudflare ke **Full** (bukan Flexible) kalau CloudPanel site juga punya sertifikat lokal; kalau tidak, **Flexible** juga jalan karena tunnel yang jadi jalur amannya — tapi pastikan `APP_URL` tetap `https://` (langkah 3) supaya Laravel generate URL/redirect yang benar meski koneksi internal ke PHP-FPM itu HTTP.

## Langkah 8 — Verifikasi akhir sebelum umumkan live

- [ ] Buka `APP_URL` — pastikan halaman welcome/login muncul, bukan error 500.
- [ ] Login via email/password DAN via Google — dua-duanya.
- [ ] Cek `storage/logs/laravel.log` kosong dari error setelah smoke test di atas.
- [ ] Cek `<html lang="...">` menampilkan `en` di kunjungan pertama (default locale sekarang English, sesuai perubahan yang kita buat).
- [ ] Cek cron scheduler benar-benar terdaftar: `php artisan schedule:list` di server.
- [ ] **Backup `APP_KEY` dan database di luar server ini** (password manager / secret vault) — sebelum ada user pertama mendaftar, bukan sesudah.

---

## Setelah live — prioritas berikutnya
Ikuti urutan yang sudah kita bahas sebelumnya: tulis feature test untuk 6 controller inti (paling penting, karena ini yang jaga integritas saldo user di production), baru lanjut item lain di `TODO.md`.