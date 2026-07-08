# Trainer OS Foundation

Build 022 keeps Trainer OS aligned with the production data foundation and the Supabase integration work already merged into `main`.

## Routes

- `/trainer` renders the Trainer OS command center for app users.
- `/dev/trainer-os` renders the same repository-backed surface with developer labeling for integration checks.

## Data access contract

Trainer OS UI does not import Supabase or instantiate backend clients. The UI calls `trainerRepository`, and the repository calls the shared API client. In mock mode that client uses `MockBackendProvider`; in Supabase mode it uses `SupabaseProvider`, which maps the repository path `/trainerProfiles` to the `trainer_profiles` table.

## Mode expectations

- Mock mode remains the default and does not require Supabase environment variables.
- Supabase mode requires `VITE_BACKEND_PROVIDER=supabase`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_ANON_KEY`.
- If a Trainer OS repository read fails, the screen falls back to demo trainer data so local mock/dev review remains available without Supabase.

## Validation status

This checkout has no configured remote, so the latest available local `work` history was used. Attempting to fetch `main` from GitHub was blocked by the Codex environment with a 403 CONNECT tunnel response.

`npm install` was also blocked by the environment with a 403 from the npm registry, so `node_modules` is unavailable. As a result, `npm run build` cannot resolve React, Vite, Supabase, and related package types, and `npm run test` cannot start Vitest in this container.
