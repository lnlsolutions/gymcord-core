# Supabase Production Integration

GymCord uses Supabase behind provider classes so UI components never call Supabase directly. Repository and service abstractions remain the only data layer entry points.

## Environment

Copy `.env.example` and configure:

- `VITE_BACKEND_PROVIDER=supabase`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_STORAGE_BUCKET`
- `VITE_SUPABASE_REALTIME_CHANNEL`
- `VITE_SUPABASE_SCHEMA`

Runtime validation lives in `src/config/supabase.ts` and throws if required values are missing when a Supabase provider is used.

## Providers

- `SupabaseAuthProvider` integrates Supabase Auth with GymCord `AuthService`.
- `SupabaseDatabaseProvider` adapts the existing `BackendProvider` request contract to Supabase tables.
- `SupabaseRealtimeProvider` adapts GymCord events to Supabase broadcast channels.
- `SupabaseStorageProvider` uploads/removes assets through Supabase Storage.
- `SupabaseRepositoryFactory` creates repositories backed by Supabase without changing repository interfaces.

## Developer Health

Open `/dev/supabase` in development to inspect Connection, Authentication, Realtime, Storage, Database, Environment, and Health state.

## Data Model

The database provider maps endpoint names to table names by trimming slashes and converting hyphens to underscores. For example `/organizations` maps to the `organizations` table. Organization lookup by slug uses `/organizations/slug/:slug`.
