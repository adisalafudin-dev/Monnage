# Monnage — TODO / Audit Notes (updated for commit `5a19ae5`)

Repo: `adisalafudin-dev/Monnage`, 2 commits (`e6f69ab` initial → `5a19ae5` latest)
Stack: Laravel 13 + Inertia 3 + React 19 + TypeScript, Laravel Fortify (auth + 2FA + passkeys), Tailwind v4

Good news up front: the last commit fixed the app-boot-blocking bug and shipped real frontend pages for Wallets, Categories, and Transactions, plus a working Dashboard. The app is meaningfully closer to usable. What's below reflects the **current** state, not the previous audit.

---

## ✅ Fixed since the last audit

- **App now boots.** `routes/web.php` no longer `require`s the missing `routes/auth.php`. The two empty stub controllers (`AuthenticatedSessionController`, `RegisteredUserController`) were deleted — auth is now handled entirely by Fortify's own auto-registered routes/actions, which resolves the earlier "which auth path is canonical" ambiguity.
- **`WalletController` and `CategoryController` authorization bugs fixed** — both now correctly call `auth()->id()` instead of the property-access `auth()->id`.
- **Transaction IDOR fixed.** `TransactionController@update` now re-fetches the _new_ `wallet_id` and calls `authorizeWallet()` on it too (previously only the transaction's original wallet was checked), so a transaction can no longer be moved into another user's wallet. Category lookups are also scoped via `$request->user()->categories()->findOrFail(...)`.
- **Concurrency safety added.** `store`/`update`/`destroy` in `TransactionController` are now wrapped in `DB::transaction()` with `lockForUpdate()` on the wallet row — balance updates under concurrent requests are now much safer.
- **Wallets, Categories, Transactions pages built.** `resources/js/pages/wallets/index.tsx` (313 lines), `categories/index.tsx` (403 lines), `transactions/index.tsx` (235 lines) all exist now, with dialogs for create/edit/delete, forms via `useForm`, and proper typed props from `@/types`.
- **Dashboard is now real.** `dashboard.tsx` (186 lines) actually consumes `summary` and `monthlySummary` and renders currency-formatted summary cards plus a simple bar chart of the last 6 months.
- **Category delete/type-change guard added.** `CategoryController@destroy` and `@update` now block deleting or changing the type of a category that already has transactions/budgets attached — good data-integrity improvement (see bug note below, though).
- **Passkeys model added** (`app/Models/Passkey.php`) with a `User::passkeys()` relation, matching the passkey UI components that already existed.

---

## 🔴 P0 — Still broken

- [x] **`BudgetController` still has the `auth()->id` bug** (line 82: `if ($budget->user_id !== auth()->id)`, missing `()`). This one was _not_ touched in the latest commit. `auth()->id` (no parens) is always `null`, so `$budget->user_id !== null` is always `true` → deleting any budget always 403s, even your own. One-line fix: `auth()->id()`.
- [x] **`DashboardController`'s monthly summary query uses PostgreSQL-only SQL against a SQLite-by-default app.** It now runs `TO_CHAR(transacted_at, 'YYYY-MM')` (Postgres syntax). Your own `.env.example` sets `DB_CONNECTION=sqlite`, and SQLite has no `TO_CHAR` function — this will throw a raw SQL error the moment the dashboard route is hit on a fresh/default local setup. (The prior version used `DATE_FORMAT`, MySQL syntax — also wrong for SQLite, so this was never actually portable; it's just now pinned to a different single database engine.) Either target the DB you actually deploy on, or write the month-bucketing in PHP after pulling raw dates instead of relying on DB-specific date functions, so it works across SQLite/MySQL/Postgres.

## 🟠 P1 — Logic bug in the new code

- [x] **`CategoryController@update` runs its "can't change type if in use" check _after_ the update already happened.** Current order:
    ```php
    $category->update($validated);

    if ($category->type !== $validated['type'] && (...)) {
        return back()->withErrors([...]);
    }
    ```
    By the time the `if` runs, `$category->type` has already been mutated in memory (and saved to the DB) to `$validated['type']` by `update()`, so `$category->type !== $validated['type']` can never be true — **this guard is dead code and never fires.** Users can currently change a category's type freely even when transactions/budgets already reference it, silently corrupting the income/expense totals that depend on that type. Fix: capture the original type _before_ calling `update()`, e.g.:
    ```php
    $originalType = $category->type;

    if ($originalType !== $validated['type']
        && ($category->transactions()->exists() || $category->budgets()->exists())) {
        return back()->withErrors([...]);
    }

    $category->update($validated);
    ```

## 🟡 P1 — Missing frontend (only piece left)

- [x] **Budgets still has no frontend page** (`resources/js/pages/budgets/index.tsx` doesn't exist), and there's no "Budgets" link in the sidebar nav (`app-sidebar.tsx` only has Dashboard / Dompet / Kategori / Transaksi). `BudgetController` already renders `Inertia::render('budgets/index', ...)` with computed spend/remaining/percentage per category — the backend is ready, only the page and nav entry are missing. Given the pattern already established by the other three pages, this should be the most straightforward remaining page to build.

## 🟡 P2 — Test coverage

- [x] Still no feature tests for `WalletController`, `CategoryController`, `TransactionController`, or `BudgetController` — the one new test (`tests/Unit/UserTest.php`) only checks that the `passkeys()` relation exists. The core money-moving logic (balance adjustment, budget spend calculation, the category-type-lock bug above) has zero automated coverage, which is exactly the kind of logic that regresses silently.
- [x] Add a regression test for the `BudgetController` auth bug and the `CategoryController` type-change-after-update bug specifically, so they can't reappear.

## 🟢 P2 — Data model / domain gaps (unchanged from before)

- [x] No wallet-to-wallet transfer type — moving money between your own wallets still has to be faked with two offsetting transactions.
- [x] Delete "update" feature wallet-to-wallet transfer feature
- [x] No multi-currency support.
- [x] `Wallet.status` boolean still has no documented meaning and isn't obviously surfaced in the new wallets UI beyond a checkbox — worth confirming what it's meant to represent (active/archived?).
- [ ] Budgets: no rollover, no total/overall monthly budget across categories, monthly cadence only.
- [ ] No recurring transactions.
- [ ] Cascading hard-deletes on wallets still permanently remove transaction history (categories now have a use-guard against deletion, wallets don't).

## ⚪ P3 — Polish

- [ ] No pagination on `TransactionController@index` — still loads the full history in one response.
- [ ] Repo still has no README/description.
- [ ] Validation/success messages are in Indonesian, UI labels ("Dompet", "Kategori", "Transaksi") are in Indonesian too now — consistent, but confirm this is the intended single-language product (no i18n toggle currently).
- [ ] Delete modal still using alert javascript use modal

---

## P4 - Add Auth

- [ ] Add Google Login Authentication

## Suggested order of work

[X] Build `budgets/index.tsx` + add the sidebar nav link — this finishes the full core product loop end-to-end.
[ ] Add feature tests for all four domain controllers, including regression tests for the two bugs above.
[ ] Then move on to the P2/P3 domain and polish items (transfers, recurring transactions, budget rollover, pagination, soft-deletes on wallets).
