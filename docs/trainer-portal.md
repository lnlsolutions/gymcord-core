# Trainer Portal Validation Notes

## Build 028 revision status

- The local checkout is on commit `0281b74`, the merge commit for PR #41 (`Merge pull request #41 from lnlsolutions/codex/finalize-atlas-coach-v1-for-production`). The container has no `origin` remote configured, so this environment cannot fetch a newer `main` reference or GitHub PR #42 directly.
- `package.json` and `package-lock.json` currently declare the same root dependencies and devDependencies. An attempted lockfile refresh with `npm install --package-lock-only` was blocked by npm registry `403 Forbidden` before npm could rewrite the lockfile.
- `npm ci` is also blocked by npm registry `403 Forbidden` while requesting `@testing-library/jest-dom`, so local dependency installation cannot complete in this container.

## Routes

- `/trainer` renders the production Trainer Portal surface.
- `/dev/trainer` renders the same repository-backed Trainer Portal in developer mode.
- `/dev/trainer-os` remains as a compatibility alias for the earlier Trainer OS validation route.

## Repository and provider boundary

- Trainer Portal UI components do not import `@supabase/supabase-js`, `getSupabaseClient`, or `SupabaseProvider`.
- `TrainerDashboard` loads trainer records through `TrainerRepository` via the exported `trainerRepository` instance.
- `TrainerDashboard` loads assigned member records through `MemberRepository` via the exported `memberRepository` instance.
- Supabase mode is selected only through the shared backend provider factory. Repository paths map through `SupabaseProvider` aliases: `/trainerProfiles` maps to `trainer_profiles`, and `/memberProfiles` maps to `member_profiles`.
- Mock mode uses `MockBackendProvider` through the same repository/API client path and does not require `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY`.

## Offline queue and optimistic update notes

- Trainer and member create, update, and delete repository methods pass `queueWhenOffline: true` to the shared API client. When a queueable write fails while the browser is offline, the API client stores the write in the offline queue.
- The app context listens for browser online/offline changes and calls `offlineEngine.sync()` when connectivity returns.
- Trainer Portal reads include demo fallback records when repository reads fail, keeping the route reviewable in mock/dev environments without Supabase configuration. Write paths are repository-owned, so optimistic UI updates should be layered above `TrainerRepository` and `MemberRepository` without importing provider SDKs into components.

## Validation commands

```sh
npm install --package-lock-only
npm ci
npm run build
npm run test
rg -n "@supabase/supabase-js|getSupabaseClient|SupabaseProvider" src/components/Trainer src/components/Dev --glob '*.{ts,tsx}'
rg -n "window.location.pathname === \"/trainer\"|window.location.pathname === \"/dev/trainer\"" src/App.tsx
rg -n "trainerRepository|memberRepository|TrainerRepository|MemberRepository" src/components/Trainer src/repositories --glob '*.{ts,tsx}'
```
