# Graph Report - wallet-tracker  (2026-08-04)

## Corpus Check
- 219 files · ~51,694 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1117 nodes · 2209 edges · 141 communities (85 shown, 56 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 16 edges (avg confidence: 0.71)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f2be4a7d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- User
- security.tsx
- PasswordValidationRules.php
- utils.ts
- scripts
- sidebar.tsx
- auth.ts
- app-header.tsx
- index.ts
- cn
- transactions/index.tsx
- PRD — Multi-language (i18n) Support for Monnage
- dropdown-menu.tsx
- Illuminate\Database\Eloquent\Factories\HasFactory
- RecurringTransaction
- compilerOptions
- components.json
- User.php
- two-factor-setup-modal.tsx
- devDependencies
- inertia.php
- Illuminate\Http\RedirectResponse
- optionalDependencies
- app-sidebar.tsx
- SetLocale.php
- Category
- Illuminate\Http\Request
- require-dev
- BudgetController
- user-info.tsx
- dependencies
- scripts
- composer.json
- require
- config
- dashboard.tsx
- Transaction
- Wallet
- TestCase
- welcome.tsx
- psr-4
- laravel
- Lint Continuous Integration Workflow
- package.json
- Monnage TODO and Audit Notes
- autoload-dev
- keywords
- eslint.config.js
- icon.tsx
- placeholder-pattern.tsx
- concurrently
- eslint-import-resolver-typescript
- eslint-plugin-import
- babel-plugin-react-compiler
- UserFactory
- @inertiajs/react
- input-otp
- @laravel/passkeys
- lucide-react
- @radix-ui/react-avatar
- @radix-ui/react-checkbox
- @radix-ui/react-collapsible
- @radix-ui/react-dialog
- @radix-ui/react-dropdown-menu
- @radix-ui/react-label
- @radix-ui/react-navigation-menu
- @radix-ui/react-select
- @radix-ui/react-separator
- transfers/index.tsx
- @radix-ui/react-toggle
- class-variance-authority
- @radix-ui/react-tooltip
- react
- react-dom
- sonner
- tailwind-merge
- tailwindcss
- @tailwindcss/vite
- tw-animate-css
- @types/react
- @types/react-dom
- typescript
- DatabaseSeeder.php
- @vitejs/plugin-react
- prettier
- prettier-plugin-tailwindcss
- Monnage
- @types/node
- Dependency Update Policy
- PNPM Workspace Configuration
- Laravel Logo
- Wallet Favicon Icon
- Crawler Access Policy
- AGENTS.md
- rules/graphify.md
- workflows/graphify.md
- @base-ui/react
- cmd.sh
- @inertiajs/vite
- laravel-react-i18n
- laravel-vite-plugin
- radix-ui

## God Nodes (most connected - your core abstractions)
1. `cn()` - 130 edges
2. `User` - 32 edges
3. `Button()` - 31 edges
4. `Wallet` - 27 edges
5. `InputError()` - 20 edges
6. `Controller` - 19 edges
7. `Input()` - 18 edges
8. `Label()` - 18 edges
9. `RecurringTransaction` - 17 edges
10. `formatCurrency()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `BreadcrumbEllipsis()` --calls--> `cn()`  [EXTRACTED]
  resources/js/components/ui/breadcrumb.tsx → resources/js/lib/utils.ts
- `CardFooter()` --calls--> `cn()`  [EXTRACTED]
  resources/js/components/ui/card.tsx → resources/js/lib/utils.ts
- `DialogOverlay()` --calls--> `cn()`  [EXTRACTED]
  resources/js/components/ui/dialog.tsx → resources/js/lib/utils.ts
- `DropdownMenuCheckboxItem()` --calls--> `cn()`  [EXTRACTED]
  resources/js/components/ui/dropdown-menu.tsx → resources/js/lib/utils.ts
- `DropdownMenuRadioItem()` --calls--> `cn()`  [EXTRACTED]
  resources/js/components/ui/dropdown-menu.tsx → resources/js/lib/utils.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Repository Automation** — github_dependabot_dependency_update_policy, github_workflows_lint_ci_lint_workflow, github_workflows_tests_ci_test_workflow [INFERRED 0.85]

## Communities (141 total, 56 thin omitted)

### Community 0 - "User"
Cohesion: 0.13
Nodes (4): User, WalletTransfer, WalletTransferPolicy, Illuminate\Foundation\Auth\User

### Community 1 - "security.tsx"
Cohesion: 0.12
Nodes (15): Heading(), ManageGoogleAccount(), Props, ManagePasskeys(), Props, ManageTwoFactor(), Props, PasskeyItem() (+7 more)

### Community 2 - "PasswordValidationRules.php"
Cohesion: 0.06
Nodes (17): CreateNewUser, ResetUserPassword, emailRules(), nameRules(), profileRules(), PasswordUpdateRequest, ProfileDeleteRequest, ProfileUpdateRequest (+9 more)

### Community 3 - "utils.ts"
Cohesion: 0.16
Nodes (16): InputError(), Props, PasskeyVerify(), Props, PasswordInput(), Props, TextLink(), Button() (+8 more)

### Community 4 - "scripts"
Cohesion: 0.05
Nodes (39): scripts, ci:check, dev, lint, lint:check, post-autoload-dump, post-create-project-cmd, post-root-package-install (+31 more)

### Community 5 - "sidebar.tsx"
Cohesion: 0.11
Nodes (23): NavUser(), Separator(), Sidebar(), SidebarContext, SidebarGroupAction(), SidebarInput(), SidebarInset(), SidebarMenuAction() (+15 more)

### Community 6 - "auth.ts"
Cohesion: 0.22
Nodes (9): Auth, Passkey, TwoFactorSecretKey, TwoFactorSetupData, User, InertiaConfig, @inertiajs/core, InputHTMLAttributes (+1 more)

### Community 7 - "app-header.tsx"
Cohesion: 0.12
Nodes (16): mainNavItems, Props, rightNavItems, AppLogo(), AppLogoIcon(), Sheet(), SheetContent(), SheetDescription() (+8 more)

### Community 8 - "index.ts"
Cohesion: 0.05
Nodes (49): AppContent(), Props, AppShell(), Props, AppSidebar(), AppSidebarHeader(), AppearanceToggleTab(), Breadcrumbs() (+41 more)

### Community 9 - "cn"
Cohesion: 0.16
Nodes (18): Pagination(), PaginationLink, Props, NavigationMenu(), NavigationMenuContent(), NavigationMenuIndicator(), NavigationMenuItem(), NavigationMenuLink() (+10 more)

### Community 10 - "transactions/index.tsx"
Cohesion: 0.08
Nodes (44): Props, Badge(), badgeVariants, Card(), CardContent(), CardDescription(), CardFooter(), CardHeader() (+36 more)

### Community 11 - "PRD — Multi-language (i18n) Support for Monnage"
Cohesion: 0.10
Nodes (19): 0.1 Check-before-you-code — applies to every phase, not just Phase 0, 0. Before you start — context you need beyond reading the repo, 1. Goal, 2. Non-goals (do not do these), 3. Architecture decision (locked in — do not deviate), 4.1 Database, 4.2 Middleware — `app/Http/Middleware/SetLocale.php`, 4.3 Locale-switch endpoint (+11 more)

### Community 12 - "dropdown-menu.tsx"
Cohesion: 0.13
Nodes (16): DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuGroup(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator() (+8 more)

### Community 13 - "Illuminate\Database\Eloquent\Factories\HasFactory"
Cohesion: 0.14
Nodes (5): Budget, MonthlyBudget, Passkey, Illuminate\Database\Eloquent\Factories\HasFactory, Illuminate\Database\Eloquent\Model

### Community 14 - "RecurringTransaction"
Cohesion: 0.21
Nodes (4): ProcessRecurringTransactions, RecurringTransaction, Carbon\Carbon, Illuminate\Console\Command

### Community 15 - "compilerOptions"
Cohesion: 0.10
Nodes (19): resources/js/**/*.d.ts, resources/js/**/*.ts, resources/js/**/*.tsx, compilerOptions, allowJs, baseUrl, esModuleInterop, forceConsistentCasingInFileNames (+11 more)

### Community 16 - "components.json"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 18 - "two-factor-setup-modal.tsx"
Cohesion: 0.16
Nodes (12): Props, TwoFactorSetupStep(), InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot, CopiedValue, CopyFn (+4 more)

### Community 19 - "devDependencies"
Cohesion: 0.12
Nodes (17): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react, eslint-plugin-react-hooks, @laravel/vite-plugin-wayfinder, devDependencies, eslint (+9 more)

### Community 21 - "Illuminate\Http\RedirectResponse"
Cohesion: 0.14
Nodes (9): GoogleAuthController, Controller, LocaleController, GoogleLinkController, GoogleSheetController, ProfileController, SecurityController, Illuminate\Http\RedirectResponse (+1 more)

### Community 22 - "optionalDependencies"
Cohesion: 0.15
Nodes (13): lightningcss-linux-x64-gnu, lightningcss-win32-x64-msvc, optionalDependencies, lightningcss-linux-x64-gnu, lightningcss-win32-x64-msvc, @rollup/rollup-linux-x64-gnu, @rollup/rollup-win32-x64-msvc, @tailwindcss/oxide-linux-x64-gnu (+5 more)

### Community 23 - "app-sidebar.tsx"
Cohesion: 0.13
Nodes (22): AppHeader(), mainNavItems, NavFooter(), NavMain(), SidebarContent(), SidebarFooter(), SidebarGroup(), SidebarGroupContent() (+14 more)

### Community 24 - "SetLocale.php"
Cohesion: 0.33
Nodes (5): HandleAppearance, SetLocale, Closure, Illuminate\Foundation\Configuration\Middleware, Symfony\Component\HttpFoundation\Response

### Community 26 - "Illuminate\Http\Request"
Cohesion: 0.21
Nodes (6): RecurringTransactionController, HandleInertiaRequests, WalletTransfer, Illuminate\Http\Request, Illuminate\Http\Resources\Json\JsonResource, Inertia\Middleware

### Community 27 - "require-dev"
Cohesion: 0.18
Nodes (11): require-dev, fakerphp/faker, larastan/larastan, laravel/pail, laravel/pao, laravel/pint, laravel/sail, mockery/mockery (+3 more)

### Community 28 - "BudgetController"
Cohesion: 0.17
Nodes (3): BudgetController, WalletController, Currency

### Community 29 - "user-info.tsx"
Cohesion: 0.33
Nodes (7): Avatar(), AvatarFallback(), AvatarImage(), UserInfo(), getInitial(), GetInitialsFn, useInitials()

### Community 30 - "dependencies"
Cohesion: 0.18
Nodes (11): clsx, globals, dependencies, clsx, globals, @radix-ui/react-slot, @radix-ui/react-toggle-group, vite (+3 more)

### Community 31 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, build, build:ssr, dev, format, format:check, lint, lint:check (+1 more)

### Community 32 - "composer.json"
Cohesion: 0.25
Nodes (7): description, license, minimum-stability, name, prefer-stable, $schema, type

### Community 33 - "require"
Cohesion: 0.22
Nodes (9): require, inertiajs/inertia-laravel, laravel/chisel, laravel/fortify, laravel/framework, laravel/socialite, laravel/tinker, laravel/wayfinder (+1 more)

### Community 34 - "config"
Cohesion: 0.29
Nodes (7): pestphp/pest-plugin, php-http/discovery, config, allow-plugins, optimize-autoloader, preferred-install, sort-packages

### Community 35 - "dashboard.tsx"
Cohesion: 0.07
Nodes (30): AlertError(), Alert(), AlertDescription(), AlertTitle(), alertVariants, CURRENCIES, CURRENCY_CODES, CurrencyCode (+22 more)

### Community 36 - "Transaction"
Cohesion: 0.18
Nodes (3): GoogleSheetConnection, Transaction, GoogleSheetsSyncService

### Community 37 - "Wallet"
Cohesion: 0.14
Nodes (6): Closure, TransactionController, WalletTransfer, WalletTransferController, Wallet, Symfony\Component\HttpFoundation\StreamedResponse

### Community 40 - "psr-4"
Cohesion: 0.40
Nodes (5): autoload, psr-4, App\\, Database\\Factories\\, Database\\Seeders\\

### Community 41 - "laravel"
Cohesion: 0.40
Nodes (5): extra, laravel, post-create-project, dont-discover, installer

### Community 43 - "Lint Continuous Integration Workflow"
Cohesion: 0.50
Nodes (4): Lint Continuous Integration Workflow, Frontend Quality Checks, Application Test Suite, Test Continuous Integration Workflow

### Community 44 - "package.json"
Cohesion: 0.29
Nodes (6): react, overrides, laravel-react-i18n, private, $schema, type

### Community 46 - "Monnage TODO and Audit Notes"
Cohesion: 0.50
Nodes (4): Monnage TODO and Audit Notes, Core Personal Finance Loop, Database Portability, Wallet Active and Archived Status

### Community 47 - "autoload-dev"
Cohesion: 0.67
Nodes (3): autoload-dev, psr-4, Tests\\

### Community 48 - "keywords"
Cohesion: 0.67
Nodes (3): keywords, framework, laravel

### Community 73 - "UserFactory"
Cohesion: 0.29
Nodes (4): UserFactory, WalletTransferFactory, Illuminate\Database\Eloquent\Factories\Factory, static

### Community 87 - "transfers/index.tsx"
Cohesion: 0.17
Nodes (18): DeleteUser(), Props, Dialog(), DialogClose(), DialogContent(), DialogDescription(), DialogFooter(), DialogHeader() (+10 more)

### Community 101 - "DatabaseSeeder.php"
Cohesion: 0.39
Nodes (4): DatabaseSeeder, WalletTransferSeeder, Illuminate\Database\Console\Seeds\WithoutModelEvents, Illuminate\Database\Seeder

### Community 105 - "Monnage"
Cohesion: 0.29
Nodes (6): Features, Google login (optional), Monnage, Prerequisites, Setup, Tech stack

## Knowledge Gaps
- **274 isolated node(s):** `cmd.sh script`, `$schema`, `style`, `rsc`, `tsx` (+269 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **56 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `security.tsx`, `dashboard.tsx`, `utils.ts`, `sidebar.tsx`, `app-header.tsx`, `index.ts`, `transactions/index.tsx`, `dropdown-menu.tsx`, `two-factor-setup-modal.tsx`, `transfers/index.tsx`, `app-sidebar.tsx`, `user-info.tsx`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `@base-ui/react`, `@inertiajs/vite`, `laravel-react-i18n`, `laravel-vite-plugin`, `radix-ui`, `package.json`, `concurrently`, `@inertiajs/react`, `input-otp`, `@laravel/passkeys`, `lucide-react`, `@radix-ui/react-avatar`, `@radix-ui/react-checkbox`, `@radix-ui/react-collapsible`, `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-label`, `@radix-ui/react-navigation-menu`, `@radix-ui/react-select`, `@radix-ui/react-separator`, `@radix-ui/react-toggle`, `class-variance-authority`, `@radix-ui/react-tooltip`, `react`, `react-dom`, `sonner`, `tailwind-merge`, `tailwindcss`, `@tailwindcss/vite`, `tw-animate-css`, `@types/react`, `@types/react-dom`, `typescript`, `@vitejs/plugin-react`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `Wallet` connect `Wallet` to `Illuminate\Database\Eloquent\Factories\HasFactory`, `RecurringTransaction`, `inertia.php`, `Illuminate\Http\Request`, `BudgetController`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `User` (e.g. with `.callback()` and `.callback()`) actually correct?**
  _`User` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `cmd.sh script`, `$schema`, `style` to the rest of the system?**
  _274 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `User` be split into smaller, more focused modules?**
  _Cohesion score 0.13438735177865613 - nodes in this community are weakly interconnected._
- **Should `security.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11904761904761904 - nodes in this community are weakly interconnected._