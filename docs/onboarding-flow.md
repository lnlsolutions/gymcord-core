# Onboarding flow

Build 020 connects signup, session restore, and member onboarding to the configured data provider while keeping mock mode as the default local path.

## Modes

- `VITE_BACKEND_PROVIDER=mock` uses the mock auth service and in-memory repository provider. It does not require Supabase environment variables.
- `VITE_BACKEND_PROVIDER=supabase` requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` at startup.

## Signup

The signup screen collects display name, email, password, optional organization name, and role (`member` or `trainer`).

In Supabase mode the auth service:

1. Creates the Supabase auth user.
2. Creates an `organizations` row when an organization name is provided.
3. Upserts the app `users` row with organization membership and active organization.
4. Creates either a `member_profiles` or `trainer_profiles` row based on role.
5. Returns an app auth session with the active organization for app context restore.

Mock mode follows the same UI contract and continues to create a mock organization and session locally.

## Onboarding save

The onboarding submit action validates the required name and primary goal, then saves onboarding data through `OnboardingRepository`:

- goals
- measurements
- preferences
- injuries
- profile settings
- completion timestamp

The repository writes to `memberProfiles` or `trainerProfiles`, allowing the Supabase provider to map those repository paths to `member_profiles` or `trainer_profiles`. In mock mode the same call writes to the in-memory mock provider.

## Session restore

On app startup the auth provider restores the current service session. In Supabase mode the restored Supabase session is hydrated by loading:

- the app `users` row
- the active `organizations` row
- the role context needed for profile reads and writes

## Developer validation

Open `/dev/onboarding-flow` to inspect:

- auth session
- user row
- organization row
- profile row
- onboarding completion state

The existing `/dev/data-flow` page remains available for table mapping and provider health checks.
