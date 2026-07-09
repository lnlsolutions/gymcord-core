# Beta Fix Pass — Build 040

Date: 2026-07-09

## Install, build, and test results

- `npm ci`: blocked in this container by npm registry authorization. The registry is configured as `https://registry.npmjs.org/`, but install fails with `E403 403 Forbidden - GET https://registry.npmjs.org/@testing-library%2fjest-dom`.
- `npm run build`: blocked after the failed install because `node_modules` is not present. TypeScript reports missing package/type declarations for React, Vite, Supabase, Lucide, Recharts, and the JSX runtime.
- `npm run test`: blocked after the failed install because `vitest` is not installed locally (`sh: 1: vitest: not found`).

## Dependency and registry validation

- `package.json` and `package-lock.json` are synchronized for root dependencies and devDependencies.
- npm registry configuration was confirmed with `npm config get registry`: `https://registry.npmjs.org/`.
- No dependencies were added or removed in this pass.

## TypeScript and route fixes made

- Fixed the QA readiness score calculation so it requires an already-built snapshot instead of recursively calling `loadSnapshot()` through its default parameter.
- Added guarded offline queue diagnostics for QA and app shell repository snapshots so local storage or queue read failures degrade to a warning/empty queue instead of throwing during route render.
- Aligned app shell route ids for core app routes with the route/page ids handled by `App.tsx`: `home`, `train`, `meals`, `progress`, `coach`.
- Changed app shell provider mappings to use the registered route path rather than generated slash-stripped ids, keeping Supabase/provider mapping metadata route-aligned.
- Added an explicit `allowMockMode` option to `ProtectedRoute` and enabled it only for `/dev/qa` and `/dev/app-shell`, so those beta validation pages can render in mock mode without unintentionally weakening other protected routes.

## Route validation notes

Static route registration was confirmed for:

- `/` through the default authenticated app route.
- `/dev/app-shell`.
- `/dev/qa`.
- `/dev/admin`.
- `/dev/tenancy`.
- `/dev/billing`.
- `/dev/check-ins`.
- `/dev/notifications`.
- `/dev/messaging`.
- `/dev/calendar`.
- `/dev/exercise-library`.
- `/dev/program-builder`.
- `/dev/trainer`.

Runtime compile/render validation could not complete because `npm ci` is blocked by registry authorization and `node_modules` is absent.

## Repository boundary validation

Static scans found no UI imports of:

- `@supabase/supabase-js`
- `getSupabaseClient`
- `SupabaseProvider`

Supabase usage remains isolated to provider/auth layers; dev UI routes access data through repositories and provider-mapped clients.

## Remaining beta blockers

1. Restore npm registry access for `@testing-library/jest-dom` so `npm ci` can install dependencies.
2. Re-run `npm run build` after dependencies are installed to validate TypeScript with actual package type declarations.
3. Re-run `npm run test` after dependencies are installed to validate Vitest.
4. Perform browser smoke validation for the listed beta routes in deploy preview once the dependency blocker is resolved.
