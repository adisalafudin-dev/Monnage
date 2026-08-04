# Monnage

A personal finance tracker built with Laravel and React (Inertia). Track wallets across multiple currencies, log transactions, move money between wallets, set category budgets with rollover, automate recurring transactions, and sign in with passkeys, 2FA, or Google.

## Features

- **Wallets** — multiple wallets per user, each with its own currency and an active/archived status. Archived wallets keep their history but can't receive new activity.
- **Multi-currency** — wallets, transactions, transfers, and budgets are all currency-aware. Totals are grouped by currency rather than summed together across currencies.
- **Transactions** — income/expense tracking per wallet and category, with filtering and pagination.
- **Wallet-to-wallet transfers** — including cross-currency transfers with an exchange rate.
- **Recurring transactions** — define a rule once (amount, wallet, category, frequency) and the scheduler generates the actual transactions automatically, catching up on any missed occurrences.
- **Budgets** — per-category monthly budgets with optional rollover (unused or overspent amounts carry into the next month), plus an overall cross-category monthly cap.
- **Authentication** — email/password via Laravel Fortify, with 2FA, passkeys, and Google OAuth login/sign-up. Google can also be linked to an existing account from Settings.

## Tech stack

- **Backend:** Laravel 13, Fortify (auth), Laravel Socialite (Google OAuth)
- **Frontend:** React 19 + TypeScript, Inertia.js 3, Tailwind CSS v4, shadcn/ui
- **Routing:** Laravel Wayfinder (typed route/action helpers generated from PHP routes)
- **Database:** SQLite by default (see `.env`), portable to MySQL/Postgres

## Prerequisites

- PHP ^8.3, Composer
- Node.js + npm (or pnpm — a `pnpm-lock.yaml` is present)
- A database (SQLite works out of the box, no setup needed)

## Setup

```bash
git clone https://github.com/adisalafudin-dev/Monnage.git
cd Monnage

composer install
npm install   # or: pnpm install

cp .env.example .env
php artisan key:generate

# SQLite is the default — create the database file:
touch database/database.sqlite

php artisan migrate
```

### Google login (optional)

To enable "Sign in with Google", create OAuth credentials in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials) and add to `.env`: