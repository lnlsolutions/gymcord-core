# Program Builder validation

## Build 029 revision notes

- PR #44 is based on the current branch head, which already contains the merge commits for PR #42 and PR #43. The latest local history shows `2773895 Merge pull request #43...` on top of `3322723 Validate trainer portal repository wiring`, so this validation is layered after those merges.
- `package.json` and `package-lock.json` are in sync for the declared dependency graph: `npm ci` started dependency resolution instead of failing with a lockfile mismatch. The install is blocked by the npm registry/security policy returning `403 Forbidden` for `@testing-library/jest-dom`.
- `/dev/program-builder` is registered in `src/App.tsx` and renders the developer Program Builder validation screen.

## Repository-only Program Builder boundary

`ProgramRepository` is the only Program Builder data access surface. It calls the shared API client path `/programs` and exposes the required capabilities:

- `list`
- `findById`
- `create`
- `update`
- `delete`
- `duplicate`
- `assign`
- `publish`
- `saveDraft`

The Program Builder developer component imports `programRepository` only. It does not import `@supabase/supabase-js`, `getSupabaseClient`, or `SupabaseProvider`.

## Mock mode validation

Mock mode works without Supabase environment variables because `createBackendProvider` defaults to `MockBackendProvider` unless `VITE_BACKEND_PROVIDER=supabase` is selected. The `/programs` path is handled by the mock provider's in-memory collection behavior, so `/dev/program-builder` can load and display repository diagnostics without `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY`.

## Supabase mode validation

Supabase mode remains behind repository/provider mappings only:

- Program Builder UI calls `ProgramRepository`.
- `ProgramRepository` calls the shared `apiClient` at `/programs`.
- `SupabaseProvider` maps the `programs` provider path to the `programs` Supabase table.
- UI components do not construct or import Supabase clients.

## Offline queue and optimistic updates

Program writes use `queueWhenOffline: true` for `create`, `update`, and `delete`; the higher-level `duplicate`, `assign`, `publish`, and `saveDraft` methods compose those queued writes. The API client owns the offline queue, so the Program Builder UI can apply optimistic state updates after a repository call is started and reconcile with the repository result or queued-write status without importing backend providers.

## Draft and publish workflow

- `saveDraft(id, input)` persists edits with `status: "draft"` and clears `publishedAt`.
- `publish(id)` persists `status: "published"` and stamps `publishedAt` with the current ISO timestamp.
- `duplicate(id)` creates a draft copy of an existing program, preserving the source program content while using a new id and copy title.
- `assign(id, memberIds)` updates the program's assigned member list through the repository.

## Validation commands

```bash
git log --oneline --decorate -3
npm ci
npm run build
npm run test
rg -n "window.location.pathname === \"/dev/program-builder\"|ProgramRepository|programPath|programs:" src/App.tsx src/repositories src/api/providers/SupabaseProvider.ts src/api/supabaseTableMap.ts
rg -n "@supabase/supabase-js|getSupabaseClient|SupabaseProvider" src/components --glob '*.{ts,tsx}'
```

### Results

- `npm ci` failed with `E403 403 Forbidden - GET https://registry.npmjs.org/@testing-library%2fjest-dom`; this is the registry/security-policy blocker from the previous validation.
- `npm run build` did not complete because dependencies were not installed after the blocked `npm ci`; TypeScript reported missing installed modules including `react`, `react/jsx-runtime`, `@supabase/supabase-js`, `lucide-react`, and `recharts`.
- `npm run test` did not complete because `vitest` was not installed after the blocked `npm ci`.
- UI import scan confirmed no files under `src/components` import `@supabase/supabase-js`, `getSupabaseClient`, or `SupabaseProvider`.
