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
- UI components do not import or call Supabase directly. Screens update app state, and `DailyActivityRepository` persists the resulting profile, daily log, mission, XP, and streak snapshots.

## Persisted activity

The persistence layer stores and reloads:

- profile details for the current user
- daily logs
- workout completion and exercise completion in daily log snapshots
- weights and exercise notes in daily log snapshots
- nutrition logs, including calories, protein, ingredients, and meal photo path
- measurements
- progress photo metadata
- XP events
- streak snapshots
- mission state

Because the current Supabase schema stores many daily activity concepts in normalized tables instead of a single `daily_logs` table, the repository writes schema-compatible rows for nutrition, measurements, photos, XP, and streaks. The aggregate daily-log cache is retained for mock mode and local startup resilience.

## Startup loading

On authenticated app startup, `GymCordApp` asks `DailyActivityRepository` to load:

1. current user context from the auth session
2. organization context from the auth session/bootstrap service
3. profile data from `member_profiles` with local cache fallback
4. daily logs from repository/local cache
5. mission state from persisted mission snapshots
6. XP history from persisted XP snapshots
7. streak history from persisted streak snapshots

If a Supabase table is unavailable, RLS blocks a read, or required environment variables are absent, the repository catches the error and falls back to cached mock/local data where possible. The most recent save outcome is stored as the last save status for developer inspection.

## Offline queue

Writes are marked as queueable. The API client adds failed non-GET writes to the offline queue when the browser is offline. The developer page shows the queue length via `offlineEngine.getQueue()`.

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
