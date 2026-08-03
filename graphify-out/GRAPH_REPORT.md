# Graph Report - .  (2026-08-03)

## Corpus Check
- Corpus is ~37,682 words - fits in a single context window. You may not need a graph.

## Summary
- 954 nodes · 1856 edges · 128 communities (77 shown, 51 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.67)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- User php
- app tsx
- CreateNewUser php
- input error tsx
- scripts Module
- app sidebar tsx
- heading tsx
- app header tsx
- appearance tabs tsx
- alert error tsx
- badge tsx
- checkbox tsx
- nav user tsx
- Budget php
- AlertError Module
- resources js d ts
- components json
- delete user tsx
- BudgetController php
- babel plugin react compiler
- BudgetController Module
- Controller php
- lightningcss linux x64 gnu
- AppHeader Module
- HandleAppearance php
- CategoryController Module
- TransactionController Module
- require dev
- index tsx
- avatar tsx
- class variance authority
- scripts Module
- composer json
- require Module
- pestphp pest plugin
- input otp tsx
- toggle tsx
- WalletTransfer Module
- Illuminate Foundation Testing TestCase
- SidebarProvider Module
- autoload Module
- extra Module
- welcome tsx
- Lint Continuous Integration Workflow
- package json
- Monnage TODO and Audit
- autoload dev
- keywords Module
- eslint config js
- icon tsx
- placeholder pattern tsx
- concurrently Module
- eslint import resolver typescript
- eslint plugin import
- eslint plugin react
- globals Module
- inertiajs react
- input otp
- laravel passkeys
- lucide react
- radix ui react avatar
- radix ui react checkbox
- radix ui react collapsible
- radix ui react dialog
- radix ui react dropdown
- radix ui react label
- radix ui react navigation
- radix ui react select
- radix ui react separator
- radix ui react slot
- radix ui react toggle
- radix ui react toggle
- radix ui react tooltip
- react Module
- react dom
- sonner Module
- tailwind merge
- tailwindcss Module
- tailwindcss vite
- tw animate css
- types react
- types react dom
- typescript Module
- vite Module
- vitejs plugin react
- prettier Module
- prettier plugin tailwindcss
- stylistic eslint plugin
- types node
- Dependency Update Policy
- PNPM Workspace Configuration
- Laravel Logo
- Wallet Favicon Icon
- Crawler Access Policy

## God Nodes (most connected - your core abstractions)
1. `cn()` - 126 edges
2. `Button()` - 28 edges
3. `User` - 23 edges
4. `Wallet` - 20 edges
5. `InputError()` - 19 edges
6. `Input()` - 16 edges
7. `Label()` - 16 edges
8. `compilerOptions` - 15 edges
9. `WalletTransfer` - 14 edges
10. `scripts` - 13 edges

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

## Communities (128 total, 51 thin omitted)

### Community 0 - "User php"
Cohesion: 0.06
Nodes (14): User, WalletTransfer, WalletTransferPolicy, UserFactory, WalletTransferFactory, DatabaseSeeder, WalletTransferSeeder, Illuminate\Database\Console\Seeds\WithoutModelEvents (+6 more)

### Community 1 - "app tsx"
Cohesion: 0.07
Nodes (33): AppContent(), Props, AppShell(), Props, AppSidebar(), AppSidebarHeader(), Breadcrumbs(), Breadcrumb() (+25 more)

### Community 2 - "CreateNewUser php"
Cohesion: 0.06
Nodes (17): CreateNewUser, ResetUserPassword, emailRules(), nameRules(), profileRules(), PasswordUpdateRequest, ProfileDeleteRequest, ProfileUpdateRequest (+9 more)

### Community 3 - "input error tsx"
Cohesion: 0.16
Nodes (16): InputError(), Props, PasskeyVerify(), Props, PasswordInput(), Props, TextLink(), Button() (+8 more)

### Community 4 - "scripts Module"
Cohesion: 0.05
Nodes (39): scripts, ci:check, dev, lint, lint:check, post-autoload-dump, post-create-project-cmd, post-root-package-install (+31 more)

### Community 5 - "app sidebar tsx"
Cohesion: 0.12
Nodes (27): mainNavItems, NavFooter(), NavMain(), NavUser(), Sidebar(), SidebarContent(), SidebarContext, SidebarFooter() (+19 more)

### Community 6 - "heading tsx"
Cohesion: 0.09
Nodes (22): Heading(), ManagePasskeys(), Props, ManageTwoFactor(), Props, PasskeyItem(), PasskeyRegistration(), TwoFactorRecoveryCodes() (+14 more)

### Community 7 - "app header tsx"
Cohesion: 0.12
Nodes (17): mainNavItems, Props, rightNavItems, AppLogo(), AppLogoIcon(), Sheet(), SheetContent(), SheetDescription() (+9 more)

### Community 8 - "appearance tabs tsx"
Cohesion: 0.13
Nodes (21): AppearanceToggleTab(), TwoFactorSetupStep(), Appearance, applyTheme(), getStoredAppearance(), handleSystemThemeChange(), initializeTheme(), isDarkMode() (+13 more)

### Community 9 - "alert error tsx"
Cohesion: 0.14
Nodes (21): Alert(), AlertDescription(), AlertTitle(), alertVariants, CardFooter(), DialogOverlay(), NavigationMenu(), NavigationMenuContent() (+13 more)

### Community 10 - "badge tsx"
Cohesion: 0.14
Nodes (18): Badge(), badgeVariants, Select(), SelectContent(), SelectItem(), SelectTrigger(), SelectValue(), BudgetForm (+10 more)

### Community 11 - "checkbox tsx"
Cohesion: 0.13
Nodes (19): Checkbox(), Textarea(), CURRENCIES, CURRENCY_CODES, CurrencyCode, formatCurrency(), formatterCache, getFormatter() (+11 more)

### Community 12 - "nav user tsx"
Cohesion: 0.13
Nodes (16): DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuGroup(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator() (+8 more)

### Community 13 - "Budget php"
Cohesion: 0.15
Nodes (6): Budget, MonthlyBudget, Passkey, Transaction, Illuminate\Database\Eloquent\Factories\HasFactory, Illuminate\Database\Eloquent\Model

### Community 14 - "AlertError Module"
Cohesion: 0.17
Nodes (15): AlertError(), Props, Card(), CardContent(), CardDescription(), CardHeader(), CardTitle(), CurrencyCashFlowChart() (+7 more)

### Community 15 - "resources js d ts"
Cohesion: 0.10
Nodes (19): resources/js/**/*.d.ts, resources/js/**/*.ts, resources/js/**/*.tsx, compilerOptions, allowJs, baseUrl, esModuleInterop, forceConsistentCasingInFileNames (+11 more)

### Community 16 - "components json"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 17 - "delete user tsx"
Cohesion: 0.24
Nodes (11): DeleteUser(), Props, Props, Dialog(), DialogClose(), DialogContent(), DialogDescription(), DialogFooter() (+3 more)

### Community 18 - "BudgetController php"
Cohesion: 0.27
Nodes (4): DashboardController, WalletTransfer, Illuminate\Http\Request, Illuminate\Http\Resources\Json\JsonResource

### Community 19 - "babel plugin react compiler"
Cohesion: 0.13
Nodes (15): babel-plugin-react-compiler, eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-hooks, @laravel/vite-plugin-wayfinder, devDependencies, babel-plugin-react-compiler (+7 more)

### Community 20 - "BudgetController Module"
Cohesion: 0.19
Nodes (3): BudgetController, WalletController, Currency

### Community 21 - "Controller php"
Cohesion: 0.25
Nodes (5): Controller, ProfileController, SecurityController, Illuminate\Http\RedirectResponse, Inertia\Response

### Community 22 - "lightningcss linux x64 gnu"
Cohesion: 0.15
Nodes (13): lightningcss-linux-x64-gnu, lightningcss-win32-x64-msvc, optionalDependencies, lightningcss-linux-x64-gnu, lightningcss-win32-x64-msvc, @rollup/rollup-linux-x64-gnu, @rollup/rollup-win32-x64-msvc, @tailwindcss/oxide-linux-x64-gnu (+5 more)

### Community 23 - "AppHeader Module"
Cohesion: 0.24
Nodes (10): AppHeader(), Separator(), IsCurrentOrParentUrlFn, IsCurrentUrlFn, useCurrentUrl(), UseCurrentUrlReturn, WhenCurrentUrlFn, SettingsLayout() (+2 more)

### Community 24 - "HandleAppearance php"
Cohesion: 0.21
Nodes (6): HandleAppearance, HandleInertiaRequests, Closure, Illuminate\Foundation\Configuration\Middleware, Inertia\Middleware, Symfony\Component\HttpFoundation\Response

### Community 27 - "require dev"
Cohesion: 0.18
Nodes (11): require-dev, fakerphp/faker, larastan/larastan, laravel/pail, laravel/pao, laravel/pint, laravel/sail, mockery/mockery (+3 more)

### Community 28 - "index tsx"
Cohesion: 0.22
Nodes (8): CurrencyTotals, dateFormatter, FilterForm, initialTransactionForm(), localDateTime(), Props, TransactionForm, Transactions()

### Community 29 - "avatar tsx"
Cohesion: 0.33
Nodes (7): Avatar(), AvatarFallback(), AvatarImage(), UserInfo(), getInitial(), GetInitialsFn, useInitials()

### Community 30 - "class variance authority"
Cohesion: 0.22
Nodes (9): class-variance-authority, clsx, @inertiajs/vite, laravel-vite-plugin, dependencies, class-variance-authority, clsx, @inertiajs/vite (+1 more)

### Community 31 - "scripts Module"
Cohesion: 0.22
Nodes (9): scripts, build, build:ssr, dev, format, format:check, lint, lint:check (+1 more)

### Community 32 - "composer json"
Cohesion: 0.25
Nodes (7): description, license, minimum-stability, name, prefer-stable, $schema, type

### Community 33 - "require Module"
Cohesion: 0.25
Nodes (8): require, inertiajs/inertia-laravel, laravel/chisel, laravel/fortify, laravel/framework, laravel/tinker, laravel/wayfinder, php

### Community 34 - "pestphp pest plugin"
Cohesion: 0.29
Nodes (7): pestphp/pest-plugin, php-http/discovery, config, allow-plugins, optimize-autoloader, preferred-install, sort-packages

### Community 35 - "input otp tsx"
Cohesion: 0.43
Nodes (4): InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot

### Community 36 - "toggle tsx"
Cohesion: 0.43
Nodes (5): ToggleGroup(), ToggleGroupContext, ToggleGroupItem(), Toggle(), toggleVariants

### Community 39 - "SidebarProvider Module"
Cohesion: 0.53
Nodes (5): SidebarProvider(), getServerSnapshot(), isSmallerThanBreakpoint(), mediaQueryListener(), useIsMobile()

### Community 40 - "autoload Module"
Cohesion: 0.40
Nodes (5): autoload, psr-4, App\\, Database\\Factories\\, Database\\Seeders\\

### Community 41 - "extra Module"
Cohesion: 0.40
Nodes (5): extra, laravel, post-create-project, dont-discover, installer

### Community 43 - "Lint Continuous Integration Workflow"
Cohesion: 0.50
Nodes (4): Lint Continuous Integration Workflow, Frontend Quality Checks, Application Test Suite, Test Continuous Integration Workflow

### Community 44 - "package json"
Cohesion: 0.50
Nodes (3): private, $schema, type

### Community 46 - "Monnage TODO and Audit"
Cohesion: 0.50
Nodes (4): Monnage TODO and Audit Notes, Core Personal Finance Loop, Database Portability, Wallet Active and Archived Status

### Community 47 - "autoload dev"
Cohesion: 0.67
Nodes (3): autoload-dev, psr-4, Tests\\

### Community 48 - "keywords Module"
Cohesion: 0.67
Nodes (3): keywords, framework, laravel

## Knowledge Gaps
- **240 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+235 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **51 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `alert error tsx` to `app tsx`, `input error tsx`, `input otp tsx`, `app sidebar tsx`, `toggle tsx`, `app header tsx`, `appearance tabs tsx`, `SidebarProvider Module`, `badge tsx`, `checkbox tsx`, `nav user tsx`, `AlertError Module`, `delete user tsx`, `AppHeader Module`, `avatar tsx`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Why does `Button()` connect `input error tsx` to `input otp tsx`, `app sidebar tsx`, `heading tsx`, `app header tsx`, `alert error tsx`, `badge tsx`, `checkbox tsx`, `welcome tsx`, `AlertError Module`, `delete user tsx`, `AppHeader Module`, `index tsx`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `dependencies` connect `class variance authority` to `package json`, `concurrently Module`, `globals Module`, `inertiajs react`, `input otp`, `laravel passkeys`, `lucide react`, `radix ui react avatar`, `radix ui react checkbox`, `radix ui react collapsible`, `radix ui react dialog`, `radix ui react dropdown`, `radix ui react label`, `radix ui react navigation`, `radix ui react select`, `radix ui react separator`, `radix ui react slot`, `radix ui react toggle`, `radix ui react toggle`, `radix ui react tooltip`, `react Module`, `react dom`, `sonner Module`, `tailwind merge`, `tailwindcss Module`, `tailwindcss vite`, `tw animate css`, `types react`, `types react dom`, `typescript Module`, `vite Module`, `vitejs plugin react`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _240 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `User php` be split into smaller, more focused modules?**
  _Cohesion score 0.05580693815987934 - nodes in this community are weakly interconnected._
- **Should `app tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06980392156862746 - nodes in this community are weakly interconnected._
- **Should `CreateNewUser php` be split into smaller, more focused modules?**
  _Cohesion score 0.06471631205673758 - nodes in this community are weakly interconnected._