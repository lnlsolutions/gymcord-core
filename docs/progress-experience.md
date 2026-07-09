# Progress Experience Validation

## Build 026 revision notes

- This revision continues the existing progress-validation branch for PR #37 rather than opening a replacement PR. The local checkout has no configured git remote, so latest-main verification cannot be refreshed from GitHub in this environment.
- The current branch history already contains the merged PR #35 and PR #36 commits: `d0078f5` (`Validate nutrition repository flow`) and `2412578` (`Merge pull request #36 from lnlsolutions/codex/validate-nutrition-functionality-in-pr-#35`) are both ancestors of `HEAD`.
- `package-lock.json` exists in the repository root.
- `/dev/progress` exists through the development route switch in `App.tsx` as an alias of the developer persistence/progress validation view.
- `npm ci` is currently blocked by npm registry authorization: `403 Forbidden - GET https://registry.npmjs.org/@testing-library%2fjest-dom`.
- Because dependencies cannot be installed, `npm run build` cannot complete locally; TypeScript reports missing installed packages such as `react`, `react/jsx-runtime`, `@supabase/supabase-js`, `lucide-react`, and `recharts`.
- Because dependencies cannot be installed, `npm run test` cannot complete locally; `vitest` is not available in `node_modules/.bin`.

## Repository and provider validation

- Mock mode works without Supabase environment values. `createBackendProvider()` chooses `MockBackendProvider` when `VITE_BACKEND_PROVIDER` is unset or set to `mock`, and `DailyActivityRepository.saveDailyLog()` still writes local snapshots when Supabase URL/key values are absent.
- Supabase mode is routed through repository/provider boundaries only. Progress UI interactions call `ProgressExperienceRepository.saveProgressLog()`, which delegates to `DailyActivityRepository.saveDailyLog()`.
- Progress saves flow through `ProgressExperienceRepository` and then provider paths handled by `DailyActivityRepository`: `/dailyLogs`, `/nutritionLogs`, `/measurements`, `/progressPhotos`, `/xpEvents`, and `/streaks`.
- `SupabaseProvider` maps those provider paths to Supabase table names (`daily_logs`, `nutrition_logs`, `measurements`, `progress_photos`, `xp_events`, and `streaks`) through the provider path alias map.
- UI components under `src/components` do not import `@supabase/supabase-js`, `getSupabaseClient`, or `SupabaseProvider`.
- Progress photo and measurement saves remain behind repository/provider boundaries; UI components do not create Supabase clients directly.

## Commands run

```sh
git remote -v
```

No remotes are configured, so latest-main verification is limited to local git history.

```sh
git merge-base --is-ancestor d0078f5 HEAD
```

Confirmed PR #35's validation commit is included in the current branch history.

```sh
git merge-base --is-ancestor 2412578 HEAD
```

Confirmed PR #36's merge commit is included in the current branch history.

```sh
test -f package-lock.json && echo package-lock exists || echo missing
```

Confirmed `package-lock.json` exists.

```sh
rg -n "window.location.pathname === \"/dev/progress\"|ProgressExperienceRepository|path: \"/progressPhotos\"|progressPhotos:" src/App.tsx src/repositories src/api/providers/SupabaseProvider.ts
```

Confirmed `/dev/progress`, progress repository delegation, progress provider writes, and Supabase path mapping.

```sh
rg -n "@supabase/supabase-js|getSupabaseClient|SupabaseProvider" src/components --glob '*.{ts,tsx}'
```

No matches in UI components.

```sh
npm ci
```

Blocked by npm registry `403 Forbidden` for `@testing-library/jest-dom`.

```sh
npm run build
```

Could not complete after the failed install because dependencies are missing.

```sh
npm run test
```

Could not complete after the failed install because `vitest` is missing.
