# GymCord data flow

Build 019 wires the app data layer to the Supabase schema while keeping mock mode safe for local development.

## Provider selection

`VITE_BACKEND_PROVIDER` controls the active backend provider:

- `mock` (default): uses in-memory seed data and does not require Supabase environment variables.
- `supabase`: requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`; missing values fail fast during app startup.
- `firebase` and `rest`: preserved as future-compatible provider options.

## Supabase table mapping

The Supabase provider maps app repository paths to these production tables:

- `organizations`
- `users`
- `member_profiles`
- `trainer_profiles`
- `workouts`
- `exercises`
- `workout_sessions`
- `exercise_logs`
- `missions`
- `achievements`
- `xp_events`
- `streaks`
- `nutrition_logs`
- `progress_photos`
- `measurements`
- `messages`
- `notifications`
- `atlas_memory`
- `atlas_conversations`

Repository requests can use camelCase path aliases, but the Supabase provider sends snake_case table names and converts request/response field names between app camelCase and schema snake_case.

## Repository contract

Repositories continue to expose app-friendly domain types. The provider boundary is responsible for schema compatibility:

1. `GET /organizations` selects from `organizations` and returns `{ items }`.
2. `GET /organizations/:id` selects by `id`.
3. `GET /organizations/slug/:slug` selects by `slug`.
4. `POST`, `PATCH`, and `DELETE` perform direct table mutations with schema-compatible snake_case fields.

## Developer verification page

Open `/dev/data-flow` in the running app to verify:

- active provider
- Supabase environment status
- auth status
- organization repository read
- sample write dry-run payload
- realtime publish/connect status
- browser storage status
- full Supabase table mapping

The write check is intentionally a dry-run. It displays the mutation shape without sending a write to Supabase.
