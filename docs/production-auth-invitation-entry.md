# Production auth + invitation entry v1

## Account and relationship rules

- One user account owns personal data forever: workouts, nutrition, progress, AI history, messages, achievements, and settings remain attached to the user account.
- Trainer and gym relationships are metadata-only access relationships. Leaving, expiring, rejecting, or archiving a relationship must not hard-delete personal data.
- `/demo` remains repository metadata only and does not enter app auth.

## Signup flow

1. User opens `/auth/signup` directly, from `/auth`, from `/invite/:code`, or after selecting an onboarding path.
2. Any pending invitation is read from the invitation repository and displayed before account creation.
3. The UI calls auth abstractions through `useAuth().signUp`; it does not import provider UI or provider clients.
4. Mock mode creates a local mock session. Provider mode can use the configured auth service.
5. Signup records email verification metadata and accepts a valid pending invite after a real session exists.
6. Session routing sends incomplete profiles to `/onboarding` and completed profiles to `/app`.

## Login flow

1. User opens `/auth/login`.
2. Pending invitation metadata, if present, is preserved through login.
3. The UI calls `useAuth().signIn` only.
4. After authentication, the pending invite is accepted against the authenticated user metadata.
5. Session routing resumes onboarding or enters `/app` based on completion status.

## Invite-before-auth flow

1. User opens `/invite/:code` or enters a code on `/auth`.
2. The invite is validated before authentication.
3. Valid, expired, rejected, accepted, archived, and missing states are visible to the user.
4. The invite entry is stored as pending metadata so signup/login can continue without losing context.
5. Trainer invites preserve the trainer onboarding path; gym invites preserve the gym onboarding path.

## Invite-after-auth flow

- A pending valid invite is accepted only after the auth session exists.
- Acceptance adds metadata such as `acceptedByUserId`, `acceptedAt`, and `metadataOnlyRelationship`.
- Expired, rejected, archived, missing, or already accepted invites do not grant hidden app access.

## Password reset metadata

- `/auth/forgot-password` records password reset request metadata in mock mode and delegates reset request intent through auth abstractions.
- `/auth/reset-password` displays whether a reset token is present and is ready for provider callbacks when real provider reset links are configured.

## Email verification metadata

- Signup records email verification metadata.
- Mock mode marks email as `mock_verified` to keep local beta testing usable.
- Provider mode can mark verification as provider-pending until an external provider callback is wired.

## Social auth provider metadata

- Google and Apple buttons are provider-ready but do not require secrets.
- In mock mode, selecting a social provider records provider metadata and continues to use email auth.
- In provider mode, the same metadata can drive provider redirects once OAuth secrets and callback URLs are configured.

## Session routing rules

- No session: route to `/auth/login`.
- Authenticated and onboarding incomplete: route to `/onboarding`.
- Authenticated and onboarding complete: route to protected `/app`.
- Routing considers selected onboarding path, pending invite state, return route, and profile completion.

## Onboarding continuation rules

- The selected onboarding path is persisted independently from the auth session.
- Pending invitation metadata is attached after auth.
- Incomplete profiles resume `/onboarding`; completed profiles continue to `/app`.
- Consumer, trainer invite, and gym invite paths all preserve the one-account ownership model.

## Future Supabase/Auth provider production plan

1. Keep UI on repository/auth abstractions only.
2. Wire provider mode through auth services and repositories, not Supabase UI components.
3. Add real OAuth redirects for Google and Apple using stored provider metadata.
4. Add provider-backed email verification and password reset callbacks for `/auth/verify-email` and `/auth/reset-password`.
5. Persist invitation acceptance as relationship metadata in the production data store with no hard deletes.
6. Keep mock mode available for local/offline beta validation.

## npm registry blocker note

If `npm ci` is blocked by registry authorization in an environment, record the exact npm error in the PR summary. This branch was validated in the current environment using the commands listed in the PR.

### Current validation environment blocker

`npm ci` is currently blocked by registry authorization in this environment with: `npm error code E403` and `403 Forbidden - GET https://registry.npmjs.org/@testing-library%2fjest-dom`. Because dependencies are not installed, `npm run build` cannot resolve React/Vite/Supabase package types and `npm run test` cannot find `vitest`.
