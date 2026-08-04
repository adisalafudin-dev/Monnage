# PRD — Multi-language (i18n) Support for Monnage

**For:** Antigravity (autonomous coding agent)
**Repo:** `adisalafudin-dev/Monnage`
**Stack:** Laravel 13 (PHP 8.3) + Inertia 3 + React 19 + TypeScript + Tailwind v4 + Vite

> ⚠️ **Ground-truth check before you start:** run `git ls-files lang/ 2>&1`, `grep -r "LaravelReactI18nProvider" resources/js/app.tsx`, and `grep -r "SetLocale" app/Http/Middleware/`. As of the last audit **none of this exists in the repo yet** — no `lang/` folder, no provider, no middleware, no locale column. If you find any of it already present when you start, treat this PRD as idempotent: skip what's already correct, fix what's incomplete, and continue.

---

## 0. Before you start — context you need beyond reading the repo

Exploring the repo yourself is expected and encouraged (see the ground-truth check above). A few things won't surface from static file-reading alone, so confirm these first:

- **You need a runnable dev environment, not just read access.** This PRD was authored by statically reading the codebase — it was never executed against a live install (no `composer install` / `npm install` / `php artisan migrate` was run to verify it). You must have working PHP 8.3 + Composer, Node + npm, and a database connection to actually run migrations, build the frontend, and manually click through the language toggle to satisfy the acceptance criteria in §4.7 and §8. If your environment is read-only or sandboxed without these, say so before starting rather than marking phases done on code-reading alone.
- **Read `TODO.md` and `PRD.md` in the repo root first.** Both already exist at the project root from a prior audit and contain known open bugs and product context. Don't re-derive findings that are already documented there — cross-reference instead.
- **Translation tone/register:** the existing Indonesian UI consistently uses the formal second person ("Anda"), not casual "kamu". Match that register in English too — professional and concise (e.g. "Save changes", "Delete wallet"), not casual/playful phrasing, and not overly verbose either. When in doubt, keep the English translation as close in length and directness to the Indonesian source as natural English allows.
- **Workflow/branching:** this PRD assumes one PR or commit per phase per §9, but doesn't know how your specific Antigravity invocation is configured (direct commits vs. branches vs. PRs). Confirm the intended workflow before starting Phase 0, since it affects how you should structure your commits.

### 0.1 Check-before-you-code — applies to every phase, not just Phase 0

Before starting _any_ phase or file in §4 or §5, first check whether that piece has already been implemented (by a prior session, or partially by you earlier in this run). Don't assume it's either "not started" or "done" — verify:

- **If it doesn't exist yet:** implement it per this PRD.
- **If it exists:** review it against this PRD's conventions (§3 architecture decisions, §6 conversion pattern, §7 `lang/en.json` conventions) before treating it as done. Specifically check: does it use the literal-Indonesian-string-as-key convention (not invented namespaced keys)? Are dynamic values passed via `:placeholder` substitution rather than string-interpolated into the key? Is every `t('...')` call backed by a real entry in `lang/en.json`? Does switching language actually produce fully translated output on that page, with no mixed-language leftovers?
- **If the existing implementation meets the bar:** mark that phase/file done and move on — don't redo working code just to have written it yourself.
- **If it's partial, inconsistent with the conventions above, or subtly broken** (e.g. a key that doesn't match the current source string because the Indonesian text changed after the translation was added, or a missing `lang/en.json` entry): fix it in place rather than leaving it and rather than duplicating it under a new key.

This matters especially for `dashboard.tsx` (§5, order 2) and anything else a prior session may have already touched — treat any existing i18n code you find there as a draft to audit, not as ground truth to build on top of unquestioned.

## 1. Goal

Add Indonesian (default) + English language support to the whole app, with the user's language choice persisted to their account and switchable from the UI at any time. Indonesian strings already hardcoded throughout the app become the "source of truth" keys; English is the only translation file we write.

## 2. Non-goals (do not do these)

- Do not add any language beyond `id` and `en`.
- Do not restructure existing components beyond what's needed to introduce translation calls — no unrelated refactors, no prop renames, no design changes.
- Do not touch backend business logic (Wallet/Transaction/Budget/Transfer/RecurringTransaction controllers) beyond wrapping user-facing strings (validation messages, flash messages) in `__()`.
- Do not write automated tests as part of this task — the project's test infrastructure is separately broken (`RefreshDatabase` disabled in `tests/Pest.php`, `UserFactory` missing `username`) and is out of scope here.
- Do not translate: log messages, code comments, internal exception messages, route names, DB column values (e.g. `category.type` enum values `income`/`expense`), or anything not shown to the end user.

## 3. Architecture decision (locked in — do not deviate)

- **Package:** [`laravel-react-i18n`](https://github.com/EugeneMeles/laravel-react-i18n) v2.0.5 (`npm i laravel-react-i18n`). It reads Laravel's native JSON translation files directly via Vite (`import.meta.glob('/lang/*.json')`) — no separate JS dictionary to maintain.
- **Key convention:** the translation key is the **literal Indonesian source string itself**, e.g. `t('Simpan perubahan')`. This means:
    - Indonesian needs **zero translation file** — it's the fallback/default and the key simultaneously.
    - Only `lang/en.json` needs to exist, mapping each literal Indonesian string to its English translation.
    - **Do not invent namespaced keys** like `wallets.save_button` — use the exact string that's currently hardcoded in the component.
- **Backend:** wrap PHP-side user-facing strings (validation error messages, flash/session messages) in Laravel's `__()` helper, using the exact Indonesian string as the key (same convention, same `lang/en.json` file — Laravel's own translator and `laravel-react-i18n` both read the same JSON file format, so one file covers both sides).
- **Locale resolution order per request:** authenticated user's saved `locale` column → `locale` cookie → default `id`.
- **Switching UI:** a toggle in the user menu (top-right dropdown), not buried in Settings — should be reachable in one click from anywhere in the app.
- **Persistence:** `locale` column on `users` table (so it follows the user across devices), _plus_ a `locale` cookie so a guest's choice on the login/register/welcome pages also sticks pre-login.
- **Vite plugin:** also add `laravel-react-i18n/vite`'s `i18n()` plugin to `vite.config.ts`. It's not strictly required for the flat-JSON approach above, but costs nothing to add now and keeps the door open for future use of Laravel PHP-side plural/attribute translations from JS. Add `lang/php_*.json` to `.gitignore` per the package's own instructions.

---

## 4. Phase 0 — Foundation (build this first, verify each piece before moving to Phase 1)

### 4.1 Database

Create a migration adding `locale` to `users`:

```php
$table->string('locale', 5)->default('id')->after('email');
```

Add `'locale'` to `User::$fillable`.

### 4.2 Middleware — `app/Http/Middleware/SetLocale.php`

Mirror the existing `app/Http/Middleware/HandleAppearance.php` pattern (read it first for the house style). Logic:

```php
$locale = $request->user()?->locale ?? $request->cookie('locale') ?? 'id';
if (! in_array($locale, ['id', 'en'], true)) {
    $locale = 'id';
}
App::setLocale($locale);
```

Register it in `bootstrap/app.php`'s `$middleware->web(append: [...])`, **before** `HandleInertiaRequests::class` (locale must be set before Inertia shares props and before Blade renders `<html lang="...">`).

### 4.3 Locale-switch endpoint

`app/Http/Controllers/LocaleController.php` with a single `update(Request $request)` action:

- Validate `locale` is in `['id', 'en']`.
- If authenticated, persist to `$request->user()->locale`.
- Always set the `locale` cookie (1 year), so it works for guests too.
- Redirect `back()`.

Route in `routes/web.php`, **outside** the `auth` middleware group (guests can switch too):

```php
Route::patch('locale', [LocaleController::class, 'update'])->name('locale.update');
```

### 4.4 Frontend package wiring

```bash
npm install laravel-react-i18n
```

- `vite.config.ts`: add the `i18n()` plugin from `laravel-react-i18n/vite`.
- `.gitignore`: add `lang/php_*.json`.
- `resources/js/app.tsx`: wrap the existing `withApp(app)` return value with:
    ```tsx
    <LaravelReactI18nProvider
        fallbackLocale="id"
        files={import.meta.glob('/lang/*.json')}
    >
        {/* existing TooltipProvider + Toaster + app */}
    </LaravelReactI18nProvider>
    ```
    Don't pass an explicit `locale` prop — it auto-detects from `<html lang="">`, which `resources/views/app.blade.php` already renders correctly via `app()->getLocale()`, and `SetLocale` middleware drives that.

### 4.5 Locale switcher UI

Add to `resources/js/components/user-menu-content.tsx` (the dropdown that already contains the Settings link and Log out button): a menu item using `useLaravelReactI18n()`'s `currentLocale()` to show the _other_ language as the label (e.g. shows "English" when currently `id`, shows "Bahasa Indonesia" when currently `en`), calling:

```tsx
router.patch(
    '/locale',
    { locale: nextLocale },
    { preserveScroll: true, preserveState: false },
);
```

Use `preserveState: false` (not `true`) so the full page re-renders with fresh server-computed translated content (validation messages, etc. that come from the backend on the _next_ request) — a soft partial reload is fine for the visual switch itself since `t()` is reactive, but we want a clean state after language change, not a stale merge.

### 4.6 `lang/en.json`

Create the file with an empty object `{}` to start — this file will grow across Phase 1 as each page is translated. Do **not** try to pre-populate it with strings for pages you haven't touched yet — that invites drift between the key and the actual current source string if that page's wording changes later before you get to it.

### 4.7 Phase 0 acceptance criteria

- [ ] Fresh migration runs cleanly (`php artisan migrate`).
- [ ] Logging in, opening the user menu, and clicking the language toggle flips `<html lang="">` between `id` and `en` and the choice survives a full page reload.
- [ ] A guest (logged out) can also toggle the language on the welcome/login pages and it persists via cookie.
- [ ] No existing page is visually or functionally broken by this phase — since no page uses `t()` yet, everything should look **identical** to before (Indonesian everywhere), regardless of which locale is active. This phase is purely plumbing.

---

## 5. Phase 1+ — Frontend rollout (page by page, in this order)

> Apply §0.1 before every row below: check whether that page already has i18n work on it, audit it against §6/§7 if so, and only redo it if it doesn't hold up — don't blindly re-translate a page that's already done correctly.

Work through pages **in this priority order**, one page = one PR/commit, so each can be reviewed and merged independently without blocking the rest:

| Order | File                                                                                                                                                                                                                              | Approx. size | Notes                                                                                                                                                                                                                                                                                                                                        |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | `resources/js/components/app-sidebar.tsx` + `nav-footer.tsx`                                                                                                                                                                      | small        | Shared nav — every page depends on this being right. Titles ("Dashboard", "Dompet", "Kategori", "Transaksi", "Transfer", "Budget", "Planning") are defined here as plain strings passed into `NavItem[]`, not inside `nav-main.tsx` — translate at the point of definition.                                                                  |
| 2     | `resources/js/pages/dashboard.tsx`                                                                                                                                                                                                | 237 lines    | Reference implementation — see §6 for the exact before/after pattern to replicate everywhere else. If Stage 1 (a prior session) already retrofitted this file, verify it against §6's conventions and correct any drift rather than assuming it's done right.                                                                                |
| 3     | `resources/js/components/user-menu-content.tsx`, `nav-user.tsx`, `user-info.tsx`                                                                                                                                                  | small        | Shared, high-visibility.                                                                                                                                                                                                                                                                                                                     |
| 4     | `resources/js/pages/auth/*.tsx` (7 files: login, register, forgot-password, reset-password, confirm-password, verify-email, two-factor-challenge)                                                                                 | small–medium | First thing a non-authenticated user sees — matters for perceived polish.                                                                                                                                                                                                                                                                    |
| 5     | `resources/js/pages/welcome.tsx`                                                                                                                                                                                                  | 201 lines    | Public landing page.                                                                                                                                                                                                                                                                                                                         |
| 6     | `resources/js/pages/settings/*.tsx` (profile, security, appearance) + `resources/js/components/manage-two-factor.tsx`, `manage-passkeys.tsx`, `manage-google-account.tsx`, `passkey-*.tsx`, `two-factor-*.tsx`, `delete-user.tsx` | medium       | Settings has the most small shared components — do the page files and their child components together in one PR since they're tightly coupled.                                                                                                                                                                                               |
| 7     | `resources/js/pages/wallets/index.tsx`                                                                                                                                                                                            | 523 lines    |                                                                                                                                                                                                                                                                                                                                              |
| 8     | `resources/js/pages/categories/index.tsx`                                                                                                                                                                                         | 458 lines    |                                                                                                                                                                                                                                                                                                                                              |
| 9     | `resources/js/pages/transfers/index.tsx`                                                                                                                                                                                          | 554 lines    | Includes the known currency-display bug noted separately in `TODO.md` — do not fix that here, stay in scope.                                                                                                                                                                                                                                 |
| 10    | `resources/js/pages/transactions/index.tsx`                                                                                                                                                                                       | 813 lines    | Largest single page — consider splitting into two commits (list/filters, then the create/edit dialog) if it's more reviewable that way.                                                                                                                                                                                                      |
| 11    | `resources/js/pages/recurring-transactions/index.tsx`                                                                                                                                                                             | 709 lines    |                                                                                                                                                                                                                                                                                                                                              |
| 12    | `resources/js/pages/budgets/index.tsx`                                                                                                                                                                                            | 987 lines    | Largest file in the app — same splitting advice as transactions.                                                                                                                                                                                                                                                                             |
| 13    | Remaining shared components not yet covered: `alert-error.tsx`, `pagination.tsx`, `breadcrumbs.tsx`, `heading.tsx`, `app-header.tsx`, `password-input.tsx`, `text-link.tsx`                                                       | small        | Sweep pass — catch anything with hardcoded strings that earlier phases didn't touch because it wasn't imported by those pages.                                                                                                                                                                                                               |
| 14    | `app/Http/Controllers/*.php` — validation messages & flash messages                                                                                                                                                               | —            | Backend sweep: every `->withErrors([...])`, `->with('success', '...')`, and custom validation message string across `WalletController`, `CategoryController`, `TransactionController`, `BudgetController`, `WalletTransferController`, `RecurringTransactionController`, and Fortify actions in `app/Actions/Fortify/`. Wrap each in `__()`. |

For each page, after translating: **add every new key you introduced to `lang/en.json` in the same commit.** Never leave a `t('...')` call with no corresponding English entry (it'll silently fall back to showing the Indonesian text in English mode, which is a broken translation, not a missing-but-harmless one).

---

## 6. The exact conversion pattern (copy this precisely — this is the Dashboard reference)

**Backend** (only if the page's controller returns validation/flash messages):

```php
// Before
return back()->withErrors(['type' => 'Jenis kategori tidak dapat diubah karena sudah digunakan.']);

// After
return back()->withErrors(['type' => __('Jenis kategori tidak dapat diubah karena sudah digunakan.')]);
```

**Frontend component:**

```tsx
// Before
import { Head } from '@inertiajs/react';
// ...
<Head title="Dashboard" />
<h1>Dashboard</h1>
<p className="text-sm text-muted-foreground">Ringkasan kondisi keuangan Anda.</p>

// After
import { Head } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
// ...
export default function Dashboard({ summary, monthlySummary }: Props) {
    const { t } = useLaravelReactI18n();

    return (
        <>
            <Head title={t('Dashboard')} />
            <h1>{t('Dashboard')}</h1>
            <p className="text-sm text-muted-foreground">{t('Ringkasan kondisi keuangan Anda.')}</p>
```

**Dynamic values** — use Laravel's `:placeholder` syntax, never string-interpolate the translation key itself:

```tsx
// WRONG — breaks the key/lang-file lookup and can't be translated as one grammatical unit
{
    t(`Perbandingan pemasukan dan pengeluaran untuk dompet ${currency}.`);
}

// RIGHT
{
    t(
        'Perbandingan pemasukan dan pengeluaran dalam beberapa bulan terakhir untuk dompet :currency.',
        { currency },
    );
}
```

In `lang/en.json`: `"Perbandingan pemasukan dan pengeluaran dalam beberapa bulan terakhir untuk dompet :currency.": "Comparison of income and expense over the last few months for :currency wallets."`

**Currency/number/date suffixes appended outside a sentence** (e.g. a card title showing an amount in a specific currency) — keep the translated label and the dynamic suffix as **separate concatenated pieces**, don't bake the dynamic value into the translation key:

```tsx
// RIGHT — "Total saldo" translates as one unit; (IDR) is just appended, not part of the key
title={`${t('Total saldo')} (${currencySummary.currency})`}
```

**Things that must NOT be wrapped in `t()`:**

- `aria-label` values that already embed a dynamic name (e.g. ``aria-label={`Hapus ${wallet.title}`}``) — translate only the static part: ``aria-label={`${t('Hapus')} ${wallet.title}`}``.
- Currency codes, category `type` values (`income`/`expense` as stored data, not their displayed label), route names, CSS class names.
- Anything already coming from user data (a wallet's own title, a category's own name) — those are user content, not UI chrome, and must never be run through `t()`.

**Toasts** (`sonner`) — same pattern:

```tsx
// Before
toast.success('Perubahan dompet disimpan.');

// After
toast.success(t('Perubahan dompet disimpan.'));
```

---

## 7. `lang/en.json` conventions

- One flat object, no nesting — `{ "Indonesian string": "English string" }`.
- Keep the file alphabetically sorted by key (easier to spot duplicates and missing entries in review) — resort it as part of each PR that touches it, don't just append.
- Before adding a key, **grep the existing file** to check whether that exact Indonesian string is already present from another page (e.g. "Simpan perubahan", "Batal", "Hapus" are likely reused across every CRUD dialog in the app) — reuse the existing key, don't duplicate it.
- If two different pages use the same Indonesian word for two different meanings that would need different English translations (a real risk with short generic words), that's a signal that one of them needs slightly more specific Indonesian source wording — flag this rather than silently producing an incorrect translation for one of the two contexts.

---

## 8. Definition of done (whole feature)

- [ ] Phase 0 acceptance criteria (§4.7) all pass.
- [ ] Every file in the §5 table has been swept — no remaining hardcoded Indonesian UI string outside of user-generated content (wallet names, category names, transaction descriptions, etc., which are correctly never translated).
- [ ] `lang/en.json` has an entry for every `t('...')` call introduced anywhere in the codebase — do a final pass with `grep -rohE "t\('[^']+'\)" resources/js | sort -u` and cross-check against the JSON file's keys.
- [ ] Switching language via the user menu on any page, then navigating to every other page in the app, shows fully English (or fully Indonesian) UI with no mixed-language pages.
- [ ] Backend validation errors and flash/success messages also switch language correctly (test by triggering a validation error — e.g. submit an empty wallet form — in both locales).
- [ ] No unrelated diffs: `git diff --stat` for each PR should only touch files relevant to that page's translation, not incidental reformatting of untouched code.

---

## 9. Suggested PR breakdown

Don't do this as one giant PR. Suggested grouping, each independently reviewable and mergeable:

1. Phase 0 (foundation) — one PR, this unlocks everything else.
2. Nav/shared chrome (sidebar, user menu) — one PR.
3. Auth pages — one PR.
4. Welcome page — one PR.
5. Settings + its child components — one PR.
6. Each of Wallets / Categories / Transfers — one PR each (3 PRs).
7. Transactions — one or two PRs (per §5 splitting note).
8. Recurring Transactions — one PR.
9. Budgets — one or two PRs (per §5 splitting note).
10. Remaining shared components sweep — one PR.
11. Backend controller message sweep — one PR.

If you're able to open PRs sequentially and wait for each to be reviewed before continuing, do so in the order listed — later PRs assume `lang/en.json` conventions from earlier ones are already established.
