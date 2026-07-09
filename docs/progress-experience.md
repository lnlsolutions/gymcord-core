# Progress Experience Validation

## Build 026 revision notes

- PR #37 is continuing on the current `work` branch. The local history includes merge commits for PR #35 and PR #36, with HEAD at `2412578` (`Merge pull request #36 from lnlsolutions/codex/validate-nutrition-functionality-in-pr-#35`). No remote named `origin` is configured in this checkout, so the branch could not be fetched again from GitHub during this validation pass.
- `package-lock.json` exists in the repository root.
- `/dev/progress` exists through the development route switch in `App.tsx` as an alias of the developer persistence/progress validation view.
- `npm ci` is currently blocked by npm registry authorization: `403 Forbidden - GET https://registry.npmjs.org/@testing-library%2fjest-dom`.
- Because dependencies cannot be installed, `npm run build` cannot complete locally; TypeScript reports missing installed packages such as `react`, `@supabase/supabase-js`, `lucide-react`, and `recharts`.
- Because dependencies cannot be installed, `npm run test` cannot complete locally; `vitest` is not available in `node_modules/.bin`.

## Repository and provider validation

- Mock mode does not require Supabase environment values. `createBackendProvider()` chooses the mock backend when `VITE_BACKEND_PROVIDER` is unset or set to `mock`, and `DailyActivityRepository` permits mock writes without checking Supabase URL/key values.
- Supabase mode is routed through repository/provider boundaries only. UI progress interactions call `ProgressExperienceRepository.saveProgressLog()`, which delegates to `DailyActivityRepository.saveDailyLog()`. That repository writes to backend provider paths including `/dailyLogs`, `/nutritionLogs`, `/measurements`, `/progressPhotos`, `/xpEvents`, and `/streaks`; `SupabaseProvider` maps those provider paths to Supabase tables.
- UI components under `src/components` do not import `@supabase/supabase-js`, `getSupabaseClient`, or `SupabaseProvider`.
- Progress photo and measurement saves flow through `ProgressExperienceRepository` and then `DailyActivityRepository` before reaching backend provider paths. UI components do not create Supabase clients directly.

## Commands run

```sh
git remote -v
```

No remotes are configured, so latest-main verification is limited to local git history.

```sh
test -f package-lock.json && echo package-lock exists || echo missing
```

Confirmed `package-lock.json` exists.

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

```sh
rg -n "@supabase/supabase-js|getSupabaseClient|SupabaseProvider" src/components --glob '*.{ts,tsx}'
```

No matches in UI components.
