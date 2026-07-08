# Live Data Persistence

Build 021 moves daily activity data behind repository calls while keeping the existing UI intact.

## Provider model

- `VITE_BACKEND_PROVIDER=mock` remains the default. Mock mode writes to the in-memory mock backend where supported and always keeps a local browser-storage cache for fast reloads.
- `VITE_BACKEND_PROVIDER=supabase` uses repository paths that map to the production schema through `SupabaseProvider`:
  - `/memberProfiles` -> `member_profiles`
  - `/nutritionLogs` -> `nutrition_logs`
  - `/measurements` -> `measurements`
  - `/progressPhotos` -> `progress_photos`
  - `/xpEvents` -> `xp_events`
  - `/streaks` -> `streaks`
  - `/missions` -> `missions`
  - `/workoutSessions` -> `workout_sessions`
  - `/exerciseLogs` -> `exercise_logs`
- UI components do not import or call Supabase directly. Screens update app state, and `DailyActivityRepository` persists the resulting profile, daily log, workout, exercise, nutrition, progress, mission, XP, and streak snapshots.
- Supabase writes use schema-compatible upserts so repeated autosaves update the same daily rows instead of creating duplicates.

## Persisted activity

The persistence layer stores and reloads:

- current profile details for the authenticated user
- daily logs through normalized repository data plus a local aggregate cache
- workout completion in `workout_sessions`
- exercise completion, weights, and notes in `exercise_logs`
- nutrition logs, including calories, protein, ingredients, water, sleep, steps, mood, energy, and meal photo path
- measurements and measurement metadata
- progress photo metadata
- XP events
- streak snapshots
- mission state

Because the current Supabase schema stores many daily activity concepts in normalized tables instead of a single `daily_logs` table, the repository writes schema-compatible rows for workouts, exercise logs, nutrition, measurements, photos, missions, XP, and streaks. Mock mode also writes the aggregate `/dailyLogs` collection. The aggregate local cache remains available for startup resilience and for data that cannot be read because a table, RLS policy, or environment variable is missing.

## Startup loading

On authenticated app startup, `GymCordApp` asks `DailyActivityRepository` to load:

1. current user context from the auth session
2. organization context from the auth session/bootstrap service
3. profile data from `member_profiles` with local cache fallback
4. daily logs from mock `/dailyLogs` or reconstructed Supabase records (`nutrition_logs`, `measurements`, `progress_photos`, `workout_sessions`, and `exercise_logs`)
5. mission state from `missions` or persisted mission snapshots
6. XP history from `xp_events` or persisted XP snapshots
7. streak history from `streaks` or persisted streak snapshots

If a Supabase table is unavailable, RLS blocks a read/write, or required environment variables are absent, the repository catches the error and falls back to cached mock/local data where possible. The most recent save outcome is stored as the last save status for developer inspection.

## Offline queue

Writes are marked as queueable for providers that support queued requests. The shared offline engine remains the single source for queue diagnostics, and the developer page shows the queue length via `offlineEngine.getQueue()`.

## Developer diagnostics

Open `/dev/persistence` to inspect:

- active provider
- current user
- organization
- loaded daily logs
- latest mission
- latest XP event
- latest streak
- last save status
- offline queue state

This route is read-only from the UI perspective; it loads repository state and displays a JSON snapshot of the loaded daily logs.
