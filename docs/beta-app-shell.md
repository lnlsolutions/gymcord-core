# Beta App Shell Validation

Build 038 adds a validation-only beta app shell at `/dev/app-shell`. The page is intentionally additive and does not redesign the production UI.

## PR base and package validation

- Current branch includes merge commit `09438d6` (`Merge pull request #61 ...`) after PR #60 and PR #61, so this revision is based on the latest available `main` history in this checkout.
- `package.json` and `package-lock.json` remain synchronized. `npm ci` reached registry resolution and was blocked by npm registry authorization rather than lockfile drift: `403 Forbidden - GET https://registry.npmjs.org/@testing-library%2fjest-dom`.
- Because `npm ci` could not install dependencies, `npm run build` is blocked by missing packages such as `react`, `@supabase/supabase-js`, `lucide-react`, `recharts`, and Vite type declarations.
- Because `npm ci` could not install dependencies, `npm run test` is blocked by the missing local `vitest` binary.

## App shell repository contract

`AppShellRepository` exists in `src/repositories/AppShellRepository.ts` and exposes the required methods:

- `loadSnapshot`
- `getVisibleRoutes`
- `getHiddenRoutes`
- `switchMode`
- `getOfflineQueue`

The repository uses mock-safe fixture data for validation and reads the offline queue through the existing sync engine. It does not import Supabase directly, does not bypass auth, and does not perform deletes.

## App shell surface

The `/dev/app-shell` validation page includes:

- Navigation
- Tenant-aware header
- Active brand indicator from active tenant metadata
- Active gym/trainer/member context
- Role mode switcher
- Module launcher
- Beta status panel
- Dev tools index
- Route guard metadata
- Empty states

## Connected route inventory

The shell registry includes connected routes for:

- Dashboard
- Workouts
- Nutrition
- Progress
- Atlas Coach
- Trainer Portal
- Program Builder
- Exercise Library
- Calendar
- Messaging
- Notifications
- Check-ins
- Billing
- Tenancy
- Admin

## Mode-specific navigation

Navigation is filtered by active mode:

- `consumer`: member-facing Dashboard, Workouts, Nutrition, Progress, Atlas Coach, Calendar, Messaging, Notifications, and Billing.
- `trainer`: coaching tools plus member-facing training context, Program Builder, Exercise Library, Check-ins, Calendar, Messaging, and Notifications.
- `gym`: gym operations, Tenancy, Billing, Trainer Portal, programming, and member engagement modules.
- `admin`: platform administration plus cross-tenant operational modules.

## Security and provider validation

- No auth bypass was added: `/dev/app-shell` is wrapped in `AuthProvider` and `ProtectedRoute` with `dashboard:view` permission.
- No security bypass was added.
- No hard deletes were added.
- UI files do not import `@supabase/supabase-js`, `getSupabaseClient`, or `SupabaseProvider`.
- Mock mode works through repository fixtures and the existing mock provider default.
- Supabase mode remains routed through provider mappings; app shell route metadata records provider mapping names and does not instantiate a Supabase client.
