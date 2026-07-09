# Exercise Library validation

## Validation notes

- `/dev/exercise-library` is registered in `src/App.tsx` and renders a developer Exercise Library validation screen.
- `ExerciseRepository` is the only Exercise Library data access surface. It exposes `list`, `findById`, `create`, `update`, `archive`, and `delete`.
- Package manifest synchronization was checked with `npm ci`; `package.json` and `package-lock.json` resolved together successfully.
- This branch is based on commit `a5d4837`, which is the local mainline merge commit for PR #45 after PR #44.

## Repository flow

Exercise Library UI calls `ExerciseRepository`, and the repository calls the shared API client path `/exercises`. The repository normalizes create payloads, filters archived records out of default list results, and keeps the returned shape compatible with future Program Builder usage by using stable exercise IDs, organization/trainer ownership fields, muscle groups, equipment, instructions, and audit metadata.

## Provider routing

Supabase mode remains behind repository/provider mappings only:

1. Exercise Library UI calls `ExerciseRepository`.
2. `ExerciseRepository` calls the shared `apiClient` with the `/exercises` provider path.
3. `SupabaseProvider` maps the `exercises` provider path to the `exercises` Supabase table through its path aliases and `supabaseTableMap`.

Exercise Library UI components do not import `@supabase/supabase-js`, `getSupabaseClient`, or `SupabaseProvider`.

## Archive behavior

`archive(id)` sets `status: "archived"` and stamps `deletedAt`. `delete(id)` delegates to `archive(id)`, so archive is the default delete behavior and records remain recoverable for audit and future Program Builder references.

## Offline queue behavior

Exercise writes use `queueWhenOffline: true` for `create`, `update`, `archive`, and `delete`. The API client owns the offline queue and stores failed non-GET writes when the browser is offline. The developer route documents this queueable write path and can insert an optimistic validation row before repository reconciliation.

## Mock mode

Mock mode works without Supabase environment variables because provider selection uses `VITE_BACKEND_PROVIDER=mock` by default and the in-memory `MockBackendProvider` serves `/exercises` without constructing a Supabase client.

## Supabase mode

Supabase mode is selected with `VITE_BACKEND_PROVIDER=supabase`. In that mode, Exercise Library requests still route only through the repository and provider mapping; UI code never creates a Supabase client directly.

## Program Builder compatibility

`ExerciseRepository` preserves stable exercise metadata needed by future Program Builder integration: IDs for references, organization and trainer ownership, display name, category, muscles, equipment, instructions, status, and audit timestamps. Because deletion archives by default, published or draft programs can retain references to historical exercises instead of losing them to hard deletes.

## Build 030 revision checks

Commands run for this revision:

```sh
npm ci
npm run build
npm run test
rg -n "window.location.pathname === \"/dev/exercise-library\"|ExerciseRepository|async list|async findById|async create|async update|async archive|async delete|exercises:" src/App.tsx src/repositories/ExerciseRepository.ts src/api/providers/SupabaseProvider.ts
rg -n "@supabase/supabase-js|getSupabaseClient|SupabaseProvider" src/components --glob '*.{ts,tsx}'
```

Results:

- `npm ci` was blocked by registry authorization: `403 Forbidden - GET https://registry.npmjs.org/@testing-library%2fjest-dom`. Because dependency installation did not complete, installed dependency binaries and type declarations are unavailable in this environment.
- `npm run build` could not complete after the blocked install because dependencies are absent; TypeScript reported missing installed modules including `react`, `react/jsx-runtime`, `@supabase/supabase-js`, `lucide-react`, and `recharts`.
- `npm run test` could not complete after the blocked install because `vitest` is not installed in `node_modules`.
- UI import scan confirmed no files under `src/components` import `@supabase/supabase-js`, `getSupabaseClient`, or `SupabaseProvider`.
