# Graph Report - wallet-tracker  (2026-08-04)

## Corpus Check
- 214 files · ~49,975 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1084 nodes · 2120 edges · 144 communities (88 shown, 56 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.71)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `863e541c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- User
- app-sidebar-layout.tsx
- FortifyServiceProvider.php
- utils.ts
- scripts
- sidebar.tsx
- auth.ts
- app-header.tsx
- use-appearance.tsx
- cn
- transactions/index.tsx
- PRD — Multi-language (i18n) Support for Monnage
- dropdown-menu.tsx
- Illuminate\Database\Eloquent\Factories\HasFactory
- RecurringTransaction
- compilerOptions
- components.json
- User.php
- Illuminate\Http\Request
- devDependencies
- BudgetController
- Controller
- optionalDependencies
- layout.tsx
- SetLocale.php
- Category
- Transaction
- require-dev
- app.tsx
- user-info.tsx
- dependencies
- scripts
- composer.json
- require
- config
- alert-error.tsx
- Illuminate\Foundation\Http\FormRequest
- Wallet
- TestCase
- useIsMobile
- psr-4
- laravel
- ProfileValidationRules.php
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
- PasswordValidationRules.php
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
- index.ts
- @radix-ui/react-toggle
- breadcrumbs.tsx
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
- auth-split-layout.tsx
- AGENTS.md
- rules/graphify.md
- workflows/graphify.md
- @base-ui/react
- globals
- cmd.sh
- @inertiajs/vite
- laravel-react-i18n
- laravel-vite-plugin
- radix-ui
- typescript-eslint

## God Nodes (most connected - your core abstractions)
1. `cn()` - 130 edges
2. `Button()` - 30 edges
3. `User` - 27 edges
4. `Wallet` - 27 edges
5. `InputError()` - 20 edges
6. `Controller` - 17 edges
7. `RecurringTransaction` - 17 edges
8. `Input()` - 17 edges
9. `Label()` - 17 edges
10. `formatCurrency()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `NavFooter()` --calls--> `toUrl()`  [EXTRACTED]
  resources/js/components/nav-footer.tsx → resources/js/lib/utils.ts
- `BreadcrumbEllipsis()` --calls--> `cn()`  [EXTRACTED]
  resources/js/components/ui/breadcrumb.tsx → resources/js/lib/utils.ts
- `DropdownMenuCheckboxItem()` --calls--> `cn()`  [EXTRACTED]
  resources/js/components/ui/dropdown-menu.tsx → resources/js/lib/utils.ts
- `DropdownMenuRadioItem()` --calls--> `cn()`  [EXTRACTED]
  resources/js/components/ui/dropdown-menu.tsx → resources/js/lib/utils.ts
- `DropdownMenuShortcut()` --calls--> `cn()`  [EXTRACTED]
  resources/js/components/ui/dropdown-menu.tsx → resources/js/lib/utils.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Repository Automation** — github_dependabot_dependency_update_policy, github_workflows_lint_ci_lint_workflow, github_workflows_tests_ci_test_workflow [INFERRED 0.85]

## Communities (144 total, 56 thin omitted)

### Community 0 - "User"
Cohesion: 0.14
Nodes (4): User, WalletTransfer, WalletTransferPolicy, Illuminate\Foundation\Auth\User

### Community 1 - "app-sidebar-layout.tsx"
Cohesion: 0.21
Nodes (9): AppContent(), Props, AppShell(), Props, AppSidebar(), AppSidebarHeader(), Breadcrumbs(), AppLayoutProps (+1 more)

### Community 2 - "FortifyServiceProvider.php"
Cohesion: 0.20
Nodes (3): AppServiceProvider, FortifyServiceProvider, Illuminate\Support\ServiceProvider

### Community 3 - "utils.ts"
Cohesion: 0.06
Nodes (44): DeleteUser(), Heading(), InputError(), ManageGoogleAccount(), Props, ManagePasskeys(), Props, ManageTwoFactor() (+36 more)

### Community 4 - "scripts"
Cohesion: 0.05
Nodes (39): scripts, ci:check, dev, lint, lint:check, post-autoload-dump, post-create-project-cmd, post-root-package-install (+31 more)

### Community 5 - "sidebar.tsx"
Cohesion: 0.10
Nodes (30): mainNavItems, NavFooter(), NavMain(), NavUser(), SheetDescription(), Sidebar(), SidebarContent(), SidebarContext (+22 more)

### Community 6 - "auth.ts"
Cohesion: 0.22
Nodes (9): Auth, Passkey, TwoFactorSecretKey, TwoFactorSetupData, User, InertiaConfig, @inertiajs/core, InputHTMLAttributes (+1 more)

### Community 7 - "app-header.tsx"
Cohesion: 0.13
Nodes (16): mainNavItems, Props, rightNavItems, AppLogo(), AppLogoIcon(), Sheet(), SheetContent(), SheetFooter() (+8 more)

### Community 8 - "use-appearance.tsx"
Cohesion: 0.19
Nodes (16): AppearanceToggleTab(), Appearance, applyTheme(), getStoredAppearance(), handleSystemThemeChange(), initializeTheme(), isDarkMode(), listeners (+8 more)

### Community 9 - "cn"
Cohesion: 0.13
Nodes (22): CardFooter(), DialogOverlay(), NavigationMenu(), NavigationMenuContent(), NavigationMenuIndicator(), NavigationMenuItem(), NavigationMenuLink(), NavigationMenuList() (+14 more)

### Community 10 - "transactions/index.tsx"
Cohesion: 0.05
Nodes (80): Pagination(), PaginationLink, Props, Props, Props, Badge(), badgeVariants, Card() (+72 more)

### Community 11 - "PRD — Multi-language (i18n) Support for Monnage"
Cohesion: 0.10
Nodes (19): 0.1 Check-before-you-code — applies to every phase, not just Phase 0, 0. Before you start — context you need beyond reading the repo, 1. Goal, 2. Non-goals (do not do these), 3. Architecture decision (locked in — do not deviate), 4.1 Database, 4.2 Middleware — `app/Http/Middleware/SetLocale.php`, 4.3 Locale-switch endpoint (+11 more)

### Community 12 - "dropdown-menu.tsx"
Cohesion: 0.13
Nodes (16): DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuGroup(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator() (+8 more)

### Community 13 - "Illuminate\Database\Eloquent\Factories\HasFactory"
Cohesion: 0.16
Nodes (5): Budget, MonthlyBudget, Passkey, Illuminate\Database\Eloquent\Factories\HasFactory, Illuminate\Database\Eloquent\Model

### Community 14 - "RecurringTransaction"
Cohesion: 0.16
Nodes (5): ProcessRecurringTransactions, RecurringTransactionController, RecurringTransaction, Carbon\Carbon, Illuminate\Console\Command

### Community 15 - "compilerOptions"
Cohesion: 0.10
Nodes (19): resources/js/**/*.d.ts, resources/js/**/*.ts, resources/js/**/*.tsx, compilerOptions, allowJs, baseUrl, esModuleInterop, forceConsistentCasingInFileNames (+11 more)

### Community 16 - "components.json"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 18 - "Illuminate\Http\Request"
Cohesion: 0.23
Nodes (4): DashboardController, WalletTransfer, Illuminate\Http\Request, Illuminate\Http\Resources\Json\JsonResource

### Community 19 - "devDependencies"
Cohesion: 0.12
Nodes (17): babel-plugin-react-compiler, eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react, eslint-plugin-react-hooks, @laravel/vite-plugin-wayfinder, devDependencies (+9 more)

### Community 21 - "Controller"
Cohesion: 0.17
Nodes (8): GoogleAuthController, Controller, LocaleController, GoogleLinkController, ProfileController, SecurityController, Illuminate\Http\RedirectResponse, Inertia\Response

### Community 22 - "optionalDependencies"
Cohesion: 0.15
Nodes (13): lightningcss-linux-x64-gnu, lightningcss-win32-x64-msvc, optionalDependencies, lightningcss-linux-x64-gnu, lightningcss-win32-x64-msvc, @rollup/rollup-linux-x64-gnu, @rollup/rollup-win32-x64-msvc, @tailwindcss/oxide-linux-x64-gnu (+5 more)

### Community 23 - "layout.tsx"
Cohesion: 0.22
Nodes (11): AppHeader(), Separator(), IsCurrentOrParentUrlFn, IsCurrentUrlFn, useCurrentUrl(), UseCurrentUrlReturn, WhenCurrentUrlFn, SettingsLayout() (+3 more)

### Community 24 - "SetLocale.php"
Cohesion: 0.20
Nodes (7): HandleAppearance, HandleInertiaRequests, SetLocale, Closure, Illuminate\Foundation\Configuration\Middleware, Inertia\Middleware, Symfony\Component\HttpFoundation\Response

### Community 27 - "require-dev"
Cohesion: 0.18
Nodes (11): require-dev, fakerphp/faker, larastan/larastan, laravel/pail, laravel/pao, laravel/pint, laravel/sail, mockery/mockery (+3 more)

### Community 28 - "app.tsx"
Cohesion: 0.24
Nodes (6): Toaster(), useFlashToast(), AppSidebarLayout(), AppLayout(), BreadcrumbItem, FlashToast

### Community 29 - "user-info.tsx"
Cohesion: 0.33
Nodes (7): Avatar(), AvatarFallback(), AvatarImage(), UserInfo(), getInitial(), GetInitialsFn, useInitials()

### Community 30 - "dependencies"
Cohesion: 0.18
Nodes (11): class-variance-authority, clsx, dependencies, class-variance-authority, clsx, @radix-ui/react-slot, @radix-ui/react-toggle-group, vite (+3 more)

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

### Community 35 - "alert-error.tsx"
Cohesion: 0.48
Nodes (5): AlertError(), Alert(), AlertDescription(), AlertTitle(), alertVariants

### Community 36 - "Illuminate\Foundation\Http\FormRequest"
Cohesion: 0.23
Nodes (5): ProfileDeleteRequest, TwoFactorAuthenticationRequest, StoreWalletTransferRequest, Illuminate\Foundation\Http\FormRequest, Laravel\Fortify\InteractsWithTwoFactorState

### Community 37 - "Wallet"
Cohesion: 0.16
Nodes (4): WalletController, WalletTransfer, WalletTransferController, Wallet

### Community 39 - "useIsMobile"
Cohesion: 0.53
Nodes (5): SidebarProvider(), getServerSnapshot(), isSmallerThanBreakpoint(), mediaQueryListener(), useIsMobile()

### Community 40 - "psr-4"
Cohesion: 0.40
Nodes (5): autoload, psr-4, App\\, Database\\Factories\\, Database\\Seeders\\

### Community 41 - "laravel"
Cohesion: 0.40
Nodes (5): extra, laravel, post-create-project, dont-discover, installer

### Community 42 - "ProfileValidationRules.php"
Cohesion: 0.27
Nodes (6): CreateNewUser, emailRules(), nameRules(), profileRules(), ProfileUpdateRequest, Laravel\Fortify\Contracts\CreatesNewUsers

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

### Community 72 - "PasswordValidationRules.php"
Cohesion: 0.24
Nodes (3): ResetUserPassword, PasswordUpdateRequest, Laravel\Fortify\Contracts\ResetsUserPasswords

### Community 73 - "UserFactory"
Cohesion: 0.29
Nodes (4): UserFactory, WalletTransferFactory, Illuminate\Database\Eloquent\Factories\Factory, static

### Community 87 - "index.ts"
Cohesion: 0.20
Nodes (9): Budget, BudgetFilters, OverallBudget, Paginated, RecurringTransaction, Transaction, TransactionFilters, TransactionTotals (+1 more)

### Community 89 - "breadcrumbs.tsx"
Cohesion: 0.39
Nodes (7): Breadcrumb(), BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink(), BreadcrumbList(), BreadcrumbPage(), BreadcrumbSeparator()

### Community 101 - "DatabaseSeeder.php"
Cohesion: 0.39
Nodes (4): DatabaseSeeder, WalletTransferSeeder, Illuminate\Database\Console\Seeds\WithoutModelEvents, Illuminate\Database\Seeder

### Community 105 - "Monnage"
Cohesion: 0.29
Nodes (6): Features, Google login (optional), Monnage, Prerequisites, Setup, Tech stack

### Community 128 - "auth-split-layout.tsx"
Cohesion: 0.33
Nodes (3): AuthSimpleLayout(), AuthLayout(), AuthLayoutProps

## Knowledge Gaps
- **273 isolated node(s):** `cmd.sh script`, `$schema`, `style`, `rsc`, `tsx` (+268 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **56 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `utils.ts`, `alert-error.tsx`, `sidebar.tsx`, `app-header.tsx`, `use-appearance.tsx`, `useIsMobile`, `transactions/index.tsx`, `dropdown-menu.tsx`, `layout.tsx`, `breadcrumbs.tsx`, `user-info.tsx`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `@base-ui/react`, `globals`, `@inertiajs/vite`, `laravel-react-i18n`, `laravel-vite-plugin`, `radix-ui`, `package.json`, `concurrently`, `@inertiajs/react`, `input-otp`, `@laravel/passkeys`, `lucide-react`, `@radix-ui/react-avatar`, `@radix-ui/react-checkbox`, `@radix-ui/react-collapsible`, `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-label`, `@radix-ui/react-navigation-menu`, `@radix-ui/react-select`, `@radix-ui/react-separator`, `@radix-ui/react-toggle`, `@radix-ui/react-tooltip`, `react`, `react-dom`, `sonner`, `tailwind-merge`, `tailwindcss`, `@tailwindcss/vite`, `tw-animate-css`, `@types/react`, `@types/react-dom`, `typescript`, `@vitejs/plugin-react`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `Button()` connect `utils.ts` to `sidebar.tsx`, `app-header.tsx`, `cn`, `transactions/index.tsx`, `layout.tsx`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `User` (e.g. with `.callback()` and `.callback()`) actually correct?**
  _`User` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `cmd.sh script`, `$schema`, `style` to the rest of the system?**
  _273 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `User` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Should `utils.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06230847803881512 - nodes in this community are weakly interconnected._