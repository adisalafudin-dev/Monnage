# Product Requirements Document — Monnage

**Status:** Active build, core loop nearly complete (Auth, Wallets, Categories, Transactions, Dashboard shipped; Budgets is backend-only)
**Based on:** commit `5a19ae5` of `adisalafudin-dev/Monnage`. No existing README/PRD was found in the repo, so this is reverse-engineered from the code — sections marked _(assumed)_ should be confirmed.

## 1. Summary

Monnage is a personal finance / wallet-tracking web app. A user manages one or more **wallets** (cash, bank account, e-wallet, etc.), categorizes **transactions** (income or expense) against those wallets, and sets monthly **budgets** per expense category. A dashboard summarizes overall balance, income, and expense trends. The product UI is in Indonesian.

## 2. Problem statement _(assumed)_

Individuals who use multiple money-holding places (cash, several bank accounts, e-wallets like GoPay/OVO) struggle to see a single, accurate picture of how much money they have and where it's going each month. Spreadsheets are manual and don't enforce structure (consistent categories, per-wallet balances that auto-update). Monnage aims to be a lightweight, self-hosted-friendly alternative.

## 3. Target users _(assumed)_

- Primary: the developer themself and similar individuals wanting personal expense tracking (Indonesian-language UI and validation strings).
- Single-tenant per account — every model is scoped to `user_id`; there is no household/shared-wallet or multi-user collaboration concept in the current schema.

## 4. Goals

- Track balances across multiple wallets accurately and automatically as transactions are recorded, including under concurrent writes.
- Categorize every transaction as income or expense.
- Let users set and monitor per-category monthly budgets, with clear over/under status.
- Provide a dashboard view of net worth and income/expense trend over time.
- Secure, single-user account system with strong auth (password + optional 2FA + passkeys), fully delegated to Laravel Fortify.

## 5. Non-goals (for this version)

- Multi-currency support.
- Multi-user / shared household wallets.
- Bank/e-wallet API integrations or automatic transaction import.
- Recurring/scheduled transactions.
- Wallet-to-wallet transfers as a distinct transaction type.
- Mobile native app (web-only, Inertia/React SPA-style).

## 6. Core features & requirements

### 6.1 Authentication & account (Laravel Fortify) — **shipped**

- Email + password registration (username auto-generated from name), login, email verification, password reset.
- Optional TOTP 2FA with recovery codes.
- Optional Passkey (WebAuthn) registration/login — backed by a dedicated `Passkey` model with its own DB table.
- Profile settings: username, profile info, password/security management, appearance (theme) preference.
- Auth routing is fully delegated to Fortify's own built-in routes/actions (no custom auth controllers in the app).

### 6.2 Wallets — **shipped**

- A user can create multiple named wallets: title, optional description, starting balance, and an active/inactive status flag.
- Wallet balance is maintained automatically: incremented/decremented whenever a transaction against it is created, edited, or deleted, inside a DB transaction with row locking for concurrency safety.
- A user can edit or delete a wallet from `resources/js/pages/wallets/index.tsx` (dialog-based create/edit/delete UI).
- Deleting a wallet still cascades and permanently removes all of that wallet's transaction history — no soft-delete or in-use guard yet (unlike categories, see below).

### 6.3 Categories — **shipped**

- A user can create custom categories, each typed as `income` or `expense`.
- Categories can be edited or deleted from `resources/js/pages/categories/index.tsx`, which shows transaction/budget counts per category.
- Categories in use (has transactions or budgets) are protected from deletion, and — _in intent, though currently buggy in implementation_ — from having their type changed, to avoid corrupting historical income/expense totals.

### 6.4 Transactions — **shipped**

- A transaction belongs to exactly one wallet and one category, has an amount, an optional text description, and a `transacted_at` date/time.
- Creating/editing/deleting a transaction correctly adjusts wallet balance, wrapped in a DB transaction with row-level locking; both the transaction's wallet _and_ category ownership are re-validated on every write, closing an earlier ownership-bypass gap.
- List view (`resources/js/pages/transactions/index.tsx`) supports filtering by wallet, category, and date range.

### 6.5 Budgets — **backend only, no UI yet**

- A user can set a monthly budget amount per expense-type category (one budget per category+month+year, enforced by a DB unique constraint).
- `BudgetController@index` already computes, per category: budgeted amount, spent so far, remaining, and percentage used, and Fortify-style auth is scoped to expense categories only.
- **Gap:** no `resources/js/pages/budgets/index.tsx` exists, and there's no sidebar link to it — this is the one feature area still invisible to end users despite the backend being ready.

### 6.6 Dashboard — **shipped**

- Shows total balance across all wallets, total income, total expense (all-time), and a 6-month income-vs-expense bar comparison.
- Fully wired end-to-end: controller computes it, `dashboard.tsx` renders it with currency formatting (`Intl.NumberFormat('id-ID', { currency: 'IDR' })`) and a lightweight custom bar chart (no external charting library).

## 7. Data model (current schema)

| Model         | Key fields                                                | Relationships                                                           |
| ------------- | --------------------------------------------------------- | ----------------------------------------------------------------------- |
| `User`        | name, username, email, profile, password, 2FA fields      | hasMany Wallets, Categories, Budgets, Passkeys                          |
| `Passkey`     | name, credential_id, credential (json), last_used_at      | belongsTo User                                                          |
| `Wallet`      | title, description, balance (decimal 15,2), status (bool) | belongsTo User, hasMany Transactions                                    |
| `Category`    | name, type (`income`\|`expense`)                          | belongsTo User, hasMany Transactions, hasMany Budgets                   |
| `Transaction` | amount (decimal 15,2), description, transacted_at         | belongsTo Wallet, belongsTo Category                                    |
| `Budget`      | amount (decimal 15,2), month, year                        | belongsTo User, belongsTo Category — unique per (category, month, year) |

Wallets still cascade-delete their transactions on removal with no soft-delete/archival; categories are now guarded from deletion while in use.

## 8. Tech stack

- **Backend:** Laravel 13 (PHP 8.3), Laravel Fortify for auth (own routes, no custom auth controllers), Laravel Wayfinder, Inertia Laravel adapter.
- **Frontend:** React 19 + TypeScript, Inertia.js (SPA-style, no separate REST/JSON API), Tailwind CSS v4, Radix UI primitives, shadcn-style `components/ui`.
- **Tooling:** Pest (tests), Larastan/PHPStan, Laravel Pint, ESLint + Prettier, Vite 8.
- **Auth extras:** TOTP 2FA and WebAuthn passkeys via Fortify + `@laravel/passkeys`, backed by a dedicated `passkeys` table.
- **Note:** default local DB is SQLite (`.env.example`), but the dashboard's monthly-summary query currently uses PostgreSQL-only SQL (`TO_CHAR`) — worth deciding the actual target production DB and making the query portable to it (see TODO.md).

## 9. Success metrics _(assumed — not yet defined in-repo)_

- A user can complete the full loop end-to-end: register → create wallet → create categories → log transactions → see correct wallet balance → set a budget → see it reflected in a budgets view and on the dashboard. The budget-viewing step is the only part of this loop not yet buildable in the UI.
- Zero known authorization bypasses (the `BudgetController` auth bug is the one still open — see TODO.md).
- Core CRUD paths covered by automated feature tests (currently only auth/settings/dashboard-placeholder tests + one passkey relation unit test exist).

## 10. Open design questions

1. What does `Wallet.status` (boolean) represent — active vs. archived — and should an inactive wallet's balance still count toward dashboard totals?
2. Should wallet deletion get the same "block if in use" guard that categories now have, or is cascading intentional for wallets specifically?
3. Is multi-currency in scope for a later version, given wallets like "e-wallet" vs. "bank account" often differ in currency for some users?
4. What's the intended production database (SQLite/MySQL/Postgres)? This determines how to fix the current `TO_CHAR` portability bug in the dashboard query.

## 11. Suggested roadmap (see TODO.md for full detail)

1. Fix the two remaining backend bugs: `BudgetController`'s `auth()->id()` typo, and the `CategoryController@update` type-change guard ordering.
2. Fix the dashboard's DB-specific SQL so it runs on whichever database is actually deployed.
3. Build the `budgets/index.tsx` page and add it to the sidebar nav — this closes the loop on the full core product.
4. Add feature test coverage for all four domain controllers.
5. Then layer in improvement features (see below).

## 12. Improvement / feature ideas beyond current scope

- Wallet-to-wallet transfers as a first-class transaction type (rather than two offsetting income/expense entries).
- Recurring transactions (rent, subscriptions, salary) with auto-generation on schedule.
- CSV/Excel import and export of transactions.
- Budget rollover (unused budget carries to next month) and a single "total monthly budget" view across all categories.
- Category icons/colors for a more scannable transaction list and charts.
- Date-range filter on the dashboard (this month / last 3 months / custom), not just the last-6-months chart.
- Same in-use protection for wallet deletion that categories now have, or a soft-delete/archive state.
- Shared/household wallets with per-member permissions, if multi-user becomes a goal.
- Push/email budget-threshold alerts (e.g. "80% of your Food budget used").
- Attach a photo of a receipt to a transaction.
- A public API (token-based) separate from the Inertia session, for a future mobile client.
