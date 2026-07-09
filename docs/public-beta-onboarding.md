# Public Beta Onboarding Validation Notes

## PR base

- PR #68 validation was performed on the current branch after the local history includes `Merge pull request #67 from lnlsolutions/codex/perform-smoke-test-and-polish-beta-demo`, confirming this branch is based on the latest available main after PR #67.

## Package sync

- `package.json` and `package-lock.json` were not changed during this validation pass, so they remain synchronized in the committed diff. `npm ci` did not complete because registry authorization returned `403 Forbidden - GET https://registry.npmjs.org/@testing-library%2fjest-dom`.

## Routes

The public beta route registrations are conflict-free because each route is matched exactly before the authenticated app fallback:

- `/` renders the public landing page.
- `/onboarding` renders public beta onboarding.
- `/demo` renders the repository-metadata-only demo switcher.
- `/dev/onboarding` renders onboarding diagnostics.
- `/app` renders the authenticated app shell.

## Public landing content

The landing repository and public landing page include validation coverage for:

- hero
- features
- Atlas AI
- workout tracking
- nutrition
- progress
- community
- trainer platform
- gym platform
- testimonials placeholders
- pricing placeholders
- FAQ placeholders
- footer
- CTA buttons: Start Personal Journey, Join Your Trainer, Join Your Gym

## Onboarding support

Public onboarding validates:

- consumer path
- trainer invite path
- gym invite path
- profile step
- goals
- units
- experience
- relationship step
- finish / launch app

## Repositories

Repository classes exist for:

- `LandingRepository`
- `OnboardingRepository` (exported from public beta onboarding metadata repository)
- `InvitationRepository`

## Account model

The documented public beta account model is:

- one permanent user account
- personal data user-owned
- gym/trainer relationships metadata-only
- leaving gym/trainer never deletes workouts, nutrition, progress, AI history, messages, or achievements

## Invitation metadata

Invitation metadata supports:

- trainer invite
- gym invite
- code validation
- pending
- accepted
- expired
- rejected
- archived

## White-label branding

White-label branding resolves from tenant/domain metadata and falls back to GymCord branding when no tenant/domain metadata matches.

## Demo route

`/demo` switches consumer, trainer, and gym views without login by reading repository metadata only. It does not grant application access or bypass auth.

## Developer diagnostics

`/dev/onboarding` displays:

- active provider
- tenant
- branding
- selected onboarding path
- pending invitation
- relationship metadata
- completion percentage
- offline queue

## Security validation

- UI components do not import `@supabase/supabase-js`, `getSupabaseClient`, or `SupabaseProvider`.
- There is no auth bypass except `/demo`, which is repository-metadata-only and does not enter protected app state.
- No security bypass was added.
- Archive semantics are documented and represented in invitation metadata instead of delete semantics.
