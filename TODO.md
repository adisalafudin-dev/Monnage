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

- [x] `BudgetController` auth()->id bug — confirmed fixed (`auth()->id()` with parens, both in BudgetController and MonthlyBudget delete).

## 🟠 P1 — Logic bug in the new code

- [x] `CategoryController@update` type-change guard — confirmed fixed, the check now runs before `$category->update($validated)`.

## 🟡 P1 — Missing frontend

- [x] Budgets page — confirmed exists, with nav entry.

## 🟡 P2 — Test coverage

- [ ] **Not actually done, despite being checked off.** I looked at `tests/` directly — it's only Fortify's own scaffolded auth tests (`AuthenticationTest`, `PasswordResetTest`, etc.), `DashboardTest`, and `ExampleTest`. There is still zero test coverage for `WalletController`, `CategoryController`, `TransactionController`, `BudgetController`, `WalletTransferController`, or `RecurringTransactionController` — every bit of money-moving logic we've built across this whole conversation (transfers, rollover, recurring generation, balance adjustments) has no automated protection. This is the checkbox I'd trust least in the whole doc, and it's the one I flagged last turn as the actual priority.

## 🟢 P2 — Data model / domain gaps

- [x] Wallet-to-wallet transfers — confirmed (`WalletTransfer` model present).
- [x] Multi-currency support — confirmed (`Currency` support class, currency columns present).
- [x] `Wallet.status` documented + enforced — confirmed.
- [x] Budgets: rollover + overall monthly cap — confirmed (`rollover` column on `Budget`, `MonthlyBudget` model present).
- [x] Recurring transactions — confirmed (`RecurringTransaction` model + `ProcessRecurringTransactions` scheduled command present).
- [x] Wallet hard-delete guard — confirmed (`WalletController@destroy` blocks deletion when transactions/transfers exist). One small gap: it doesn't yet check `recurringTransactions()->exists()` the way I specced — a wallet with an active recurring rule could still be deleted today, which would then let the rule reference a dangling wallet. Small fix, want me to add it?

## ⚪ P3 — Polish

- [x] Pagination on `TransactionController@index` — confirmed, `->paginate(20)`.
- [x] README — confirmed, 48 lines added.
- [x] i18n confirmation — still just needs a decision, no code.
- [x] Delete modals — confirmed.

## P4 — Next Feature

- [x] Google Login — **confirmed merged** (`google_id` on `User`, full OAuth flow present). Not in this doc's list as done — should be checked off.
- [x] Export CSV — **written, not merged.** I gave you the full `export()` method + route + button, but `grep` for `function export` in `TransactionController.php` comes up empty — it never got copied in.
- [x] Google Sheets sync — **written, not merged.** No `app/Services/` directory exists yet, so `GoogleSheetsSyncService` was never added.
- [ ] Gemini Studio API — not started, not yet scoped.
- [ ] ML/FastAPI — not started, not yet scoped.

## Suggested order of work

[X] Build `budgets/index.tsx` + add the sidebar nav link — this finishes the full core product loop end-to-end.
[ ] Add feature tests for all four domain controllers, including regression tests for the two bugs above.
[ ] Then move on to the P2/P3 domain and polish items (transfers, recurring transactions, budget rollover, pagination, soft-deletes on wallets).

---

## 🟠 P2 — GoogleSheetsSyncService improvements (audited 2026-08-04)

`app/Services/GoogleSheetsSyncService.php` — functional & efficient, but needs hardening for production. Current quality ~7/10.

### 🔴 High priority

- [x] **Add logging** — done. `Log::info` (start/completed) only in non-production via `logInfo()` guard; `Log::error` (with `user_id` + message) always logged in all environments, then re-thrown.
- [x] **Validate refresh-token response** — done. Added `isset($data['access_token'])` guard in `getValidAccessToken()` that throws `RuntimeException` with a clear Indonesian message if the key is missing.
- [ ] **Write unit tests with `Http::fake()`** — zero coverage for this service. Mock `https://oauth2.googleapis.com/token` and `https://sheets.googleapis.com/*` to test: token refresh, 404/403 handling, sheet auto-creation, clear-then-write flow, and stale-row cleanup.

### 🟡 Medium priority

- [ ] **Split responsibilities (SRP)** — class currently does OAuth token management + sheet management + data writing. Extract:
    - `GoogleOAuthService` — token refresh logic
    - `GoogleSheetsClient` — API calls (create sheet, clear, write)
    - `GoogleSheetsSyncService` — orchestrator only
- [ ] **Replace magic strings with constants/enums** — `'Transactions'`, `'Wallets'`, `'income'`, `'Pemasukan'`, `'Aktif'`, `'Diarsipkan'` are scattered. Use class constants or PHP enums.
- [ ] **Move API URLs to config** — `https://sheets.googleapis.com/...` and `https://oauth2.googleapis.com/token` are hardcoded. Put them in `config/services.php` for testability (mock server) and future changes.
- [ ] **Handle partial-sync inconsistency** — if `writeTransactions` succeeds but `writeWallets` fails, the spreadsheet is left inconsistent. Consider staging sheets + swap, or record a partial-sync status in the DB.

### 🟢 Low priority

- [ ] **Add retry logic** — wrap Google API calls with `Http::retry(3, 100)` for transient errors (rate limit, timeout).
- [ ] **Dynamic range instead of `A1:Z10000`** — hardcoded 10k-row assumption. Compute range from `count($rows)`.
- [ ] **Batch large writes** — a single `PUT` with thousands of rows can hit API quota. Batch per 500–1000 rows.
- [ ] **Wallet hard-delete guard gap** — `WalletController@destroy` doesn't check `recurringTransactions()->exists()`; a wallet with an active recurring rule could still be deleted, leaving a dangling reference.
- [ ] Telegram POST transactions with bot in my old phone
