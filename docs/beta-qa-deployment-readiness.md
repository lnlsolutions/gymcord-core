# Beta QA Deployment Readiness

Build 039 adds an additive QA validation dashboard at `/dev/qa`. It does not redesign the production UI.

## PR base validation

- This checkout is on branch `work` at merge commit `9f3995d` (`Merge pull request #63 from lnlsolutions/codex/validate-beta-app-shell-implementation`).
- The local history includes PR #63 after PR #62's unavailable remote context in this container; there is no `origin` remote configured, so `git fetch origin main pull/64/head:pr-64` cannot verify GitHub PR #64 directly from this environment.
- PR #64 should be updated in place with this commit; no new PR is required.

## Package validation

- `package.json` and `package-lock.json` remain synchronized. Both manifests still declare `@supabase/supabase-js` as the app Supabase dependency and no package manifest changes were made for Build 039.
- `npm ci` is blocked by npm registry authorization in this environment: `npm error code E403` and `403 Forbidden - GET https://registry.npmjs.org/@testing-library%2fjest-dom`.
- Because dependencies cannot be installed after that registry blocker, `npm run build` is blocked by missing installed packages.
- Because dependencies cannot be installed after that registry blocker, `npm run test` is blocked by the missing local `vitest` binary.

## QA repository contract

`QARepository` exists at `src/repositories/QARepository.ts` and exposes:

- `loadSnapshot`
- `calculateReadinessScore`
- `getLaunchBlockers`
- `getRouteAvailability`
- `getEnvironmentDiagnostics`
- `getProviderDiagnostics`
- `getOfflineQueueDiagnostics`

## QA dashboard coverage

The `/dev/qa` dashboard includes:

- Smoke test checklist
- Route availability matrix
- Provider diagnostics
- Environment diagnostics
- Supabase readiness
- Mock mode readiness
- Offline queue diagnostics
- Navigation QA
- Tenant switching QA
- White-label QA
- Auth QA
- Billing metadata QA
- Known blockers
- Deployment readiness score

## Validation notes

The Build 039 validation notes below capture the required auth, provider, mock-mode, hard-delete, and npm registry blocker confirmations.

## Security and provider validation notes

- No auth bypass was added: `/dev/qa` is wrapped in `AuthProvider` and `ProtectedRoute` with `dashboard:view` permission.
- No security bypass was added.
- No hard deletes were added by this revision.
- UI files do not import `@supabase/supabase-js`, `getSupabaseClient`, or `SupabaseProvider`.
- Mock mode works through static QA fixtures, app shell route fixtures, and the existing mock provider defaults.
- Supabase mode remains routed through provider mappings; the QA dashboard imports `QARepository` only and does not instantiate a Supabase client.

## Validation commands

```sh
git fetch origin main pull/64/head:pr-64
node -e 'const fs=require("fs"); const pkg=JSON.parse(fs.readFileSync("package.json")); const lock=JSON.parse(fs.readFileSync("package-lock.json")); const deps=pkg.dependencies||{}; const lockDeps=lock.packages[""]?.dependencies||{}; for (const [name, version] of Object.entries(deps)) { if (lockDeps[name] !== version) throw new Error(`${name} mismatch`); } console.log("package manifests synchronized");'
npm ci
npm run build
npm run test
rg -n 'window.location.pathname === "/dev/qa"|QARepository|loadSnapshot|calculateReadinessScore|getLaunchBlockers|getRouteAvailability|getEnvironmentDiagnostics|getProviderDiagnostics|getOfflineQueueDiagnostics' src/App.tsx src/repositories/QARepository.ts
if rg -n '@supabase/supabase-js|getSupabaseClient|SupabaseProvider' src/components src/App.tsx --glob '*.{ts,tsx}'; then exit 1; fi
```
