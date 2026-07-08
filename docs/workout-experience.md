# Workout Experience Validation

## Validation results

- Branch freshness check: attempted `git fetch origin main`, but this checkout has no configured `origin` remote, so the environment could not verify whether the branch includes the latest `main`. CI or a maintainer with repository remote access should rerun this check before merge.
- Lockfile: `package-lock.json` exists at the repository root.
- UI Supabase boundary: no files under `src/components` import `@supabase/supabase-js`, `getSupabaseClient`, or `SupabaseProvider`.
- Workout save boundary: workout interaction state is held in the app day log, and persistence is triggered through `dashboardRepository.saveDailyLog`, which delegates to `DailyActivityRepository.saveDailyLog`.
- Developer route: `/dev/workout` is registered and renders a read-only workout validation page showing active provider, current workout, exercise logs, save status, XP event, mission update, streak update, and offline queue.

## Repository flow

1. Workout UI components render from app state and static workout program data.
2. Exercise completion, weights, and notes update the selected `DailyLog` through `updateDay`.
3. `App` observes the hydrated daily log state and calls `dashboardRepository.saveDailyLog`.
4. `DashboardRepository` delegates to `DailyActivityRepository`.
5. `DailyActivityRepository` writes local/cache snapshots first, then writes queueable records through the configured backend provider paths:
   - `/dailyLogs`
   - `/nutritionLogs`
   - `/measurements`
   - `/progressPhotos`
   - `/xpEvents`
   - `/streaks`
6. Supabase-specific table mapping stays isolated in the provider layer; workout UI components do not instantiate or import Supabase clients.

## Mock mode behavior

- `VITE_BACKEND_PROVIDER` defaults to `mock`, so local development works without Supabase environment variables.
- Mock mode uses repository/provider abstractions and local browser storage snapshots for profile, daily logs, mission, XP, and streak state.
- The `/dev/workout` page loads via `DailyActivityRepository`, so it validates the same repository flow used by the application instead of reading Supabase or storage directly from UI components.

## Supabase behavior

- Supabase mode is selected only through `VITE_BACKEND_PROVIDER=supabase` and the shared provider factory.
- `DailyActivityRepository` checks that Supabase URL and anon key are configured before attempting Supabase-backed daily activity writes.
- Production persistence remains behind repository/provider boundaries: UI components call app callbacks or repositories, repositories call the shared backend provider, and `SupabaseProvider` maps repository paths to Supabase tables.

## Build and test status

- `npm ci`: blocked by npm registry access in this environment with `403 Forbidden` for `@testing-library/jest-dom`.
- `npm run build`: could not complete because dependencies were not installed after the registry 403; TypeScript reported missing modules such as `react`, `react/jsx-runtime`, `@supabase/supabase-js`, `lucide-react`, and `recharts`.
- `npm run test`: could not complete because dependencies were not installed after the registry 403; `vitest` was unavailable.

## Verification commands

```sh
git fetch origin main
npm ci
npm run build
npm run test
rg -n "@supabase/supabase-js|getSupabaseClient|SupabaseProvider" src/components
rg -n "saveDailyLog|dashboardRepository|dailyActivityRepository|backend.request" src/App.tsx src/repositories src/components/Workout src/components/Dev/DeveloperWorkout.tsx
```
