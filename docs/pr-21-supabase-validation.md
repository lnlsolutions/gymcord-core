# PR #21 Supabase Validation

## Latest main status

- Attempted to confirm the branch includes the latest `main` by running `git fetch origin main` on 2026-07-08.
- The Codex checkout has no configured `origin` remote, so the fetch could not complete: `fatal: 'origin' does not appear to be a git repository`.
- Local branch status before these validation changes was `work` at commit `057d94a` (`Merge pull request #20 from lnlsolutions/codex/update-pr-#18-for-merge-readiness-dy5daw`).
- Because the remote is unavailable in this environment, the latest-main check is documented as environment-limited and should be re-run by CI or a maintainer with repository remote access.

## package-lock status

- `package-lock.json` exists at the repository root.

## Testing dependency status

- Testing packages are declared in `devDependencies` only:
  - `@testing-library/jest-dom`
  - `@testing-library/react`
  - `@testing-library/user-event`
  - `@vitest/coverage-v8`
  - `jsdom`
  - `vitest`
- No testing package was found in production `dependencies`.

## Build status

- `npm run build` completed successfully in the Codex environment.
- The production build ran `tsc && vite build` and completed without TypeScript or Vite errors.

## Test status

- `npm run test` was attempted after `npm ci`.
- The test command could not complete because `vitest` was not available in `node_modules/.bin` after the blocked dependency install.
- This is considered environment-limited because `npm ci` was blocked by the npm registry 403 described below.

## npm registry limitation

- `npm ci` was attempted and failed with an npm registry 403:
  - `403 Forbidden - GET https://registry.npmjs.org/@testing-library%2fjest-dom`
- Because dependency installation was blocked by the registry response, test execution could not be fully validated in this Codex environment.

## Mock mode safety

- Mock mode remains the default provider when `VITE_BACKEND_PROVIDER` is not set.
- Missing Supabase environment variables do not throw during startup when the backend provider is omitted or set to `mock`.
- The mock backend provider remains the default fallback path for unknown or unset backend providers.

## Supabase env validation behavior

- Supabase environment variables are validated only when `VITE_BACKEND_PROVIDER=supabase`.
- When Supabase mode is selected, startup now requires both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- This prevents an accidental Supabase production startup with incomplete credentials while preserving default-safe mock startup behavior.

## UI isolation check

- Checked UI-facing directories for direct Supabase access patterns:
  - `src/components`
  - `src/App.tsx`
  - `src/main.tsx`
  - `src/auth`
  - `src/context`
  - `src/lib`
- No UI component imports or references were found for:
  - `@supabase/supabase-js`
  - `getSupabaseClient`
  - Supabase client instances
- Supabase references remain isolated to allowed architecture layers:
  - `src/config`
  - `src/api/providers`
  - `src/api/client.ts`
  - `src/services/realtime`
