# Production auth and invitation entry validation

Build 043 validates the auth entry, invite entry, and session routing surfaces added for PR #70. The implementation keeps UI code on repository/auth abstractions and leaves vendor SDK usage inside the auth service boundary.

## PR base validation

The local branch contains the merge commits for PR #68 and PR #69, including `Merge pull request #69 from lnlsolutions/codex/validate-public-beta-onboarding-in-pr-#68` at `c86d1fd`. No `origin` remote is configured in this workspace, so live GitHub comparison could not be performed from the container.

## Package synchronization

`package.json` and `package-lock.json` were checked for dependency/devDependency version agreement. No package manifest changes were made in this revision.

## Dependency installation blocker

`npm ci` is currently blocked by npm registry authorization:

```text
npm error code E403
npm error 403 403 Forbidden - GET https://registry.npmjs.org/@testing-library%2fjest-dom
```

Because dependency installation fails before `node_modules` is hydrated, `npm run build` and `npm run test` cannot complete in this workspace. The build attempt confirms missing installed packages such as `react`, `@supabase/supabase-js`, `lucide-react`, and Vite types after the failed install.

## Route validation notes

The application now defines non-conflicting route entries for:

- `/auth`
- `/auth/signup`
- `/auth/login`
- `/auth/forgot-password`
- `/auth/reset-password`
- `/auth/verify-email`
- `/invite/:code`
- `/app`
- `/dev/auth-entry`

The auth routes render beta-usable sign up, login, forgot password, password reset metadata, email verification metadata, social provider buttons, invite code preservation, logout, and session routing decisions. `/app` remains protected by `AuthProvider`, `AuthGate`, and `ProtectedRoute`.

## Auth entry validation notes

`AuthEntryRepository` exposes active provider metadata, auth mode, mock session state, Google and Apple provider metadata, password reset metadata, and email verification metadata. Mock social buttons remain provider-ready without requiring provider secrets.

`SessionRoutingRepository` returns `/onboarding` when onboarding is incomplete and `/app` when onboarding is complete. Pending invite metadata and selected onboarding path are preserved so signup/login can return to onboarding with invite context.

## Invitation entry validation notes

`InviteEntryRepository` validates trainer and gym invite links before auth, preserves the invite through signup/login, and accepts only pending invites after auth. Expired, rejected, accepted, and archived invites are treated as metadata states rather than deleted records.

Supported sample codes:

- `TRAINER-BETA` pending trainer invite
- `GYM-BETA` pending gym invite
- `GYM-EXPIRED` expired gym invite
- `TRAINER-REJECTED` rejected trainer invite
- `TRAINER-ACCEPTED` already accepted trainer invite
- `GYM-ARCHIVED` archived invite proving no hard delete path

## Diagnostics validation notes

`/dev/auth-entry` displays active provider, auth mode, mock session state, pending invite, selected onboarding path, return route, session routing decision, social provider metadata, email verification metadata, password reset metadata, offline queue, and save status.

## Security and repository-boundary notes

No UI code imports `@supabase/supabase-js`, `getSupabaseClient`, or `SupabaseProvider`. Supabase SDK usage remains isolated to service/provider infrastructure. The auth entry and invite entry call repositories/auth abstractions only.

No hard deletes were added. Invite archival is metadata-only. No security bypass or hidden auth bypass was added; protected application entry continues through the existing `AuthProvider`/`ProtectedRoute` flow. `/demo` remains the public repository metadata demo and does not enter app auth.
