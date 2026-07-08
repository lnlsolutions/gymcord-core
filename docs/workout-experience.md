# Workout Experience V1

Build 024 introduces a repository-backed workout experience for the member training flow and developer validation route.

## Routes

- Member app training tab: renders `WorkoutExperience` for the current daily workout.
- Developer page: `/dev/workout` renders the same experience with repository diagnostics.

## Components

The production workout UI lives in `src/components/workout/`:

- `WorkoutExperience.tsx` orchestrates draft logs, repository saves, completion, XP, mission, and streak projections.
- `WorkoutHeader.tsx` shows overview, active provider, progress, and save status.
- `ExerciseList.tsx` renders all exercises for the active workout.
- `ExerciseCard.tsx` captures exercise completion, notes, and set-level fields.
- `SetLogger.tsx` captures set completion, weight, and reps.
- `WorkoutSummary.tsx` summarizes completed exercises, XP award, mission progress, and streak update.

## Persistence model

All workout saves go through `WorkoutExperienceRepository`.

- It first delegates the full `DailyLog`, `Mission`, `XpSnapshot`, and `StreakSnapshot` to `DailyActivityRepository.saveDailyLog` so the app's canonical local/mock/Supabase persistence path is preserved.
- In mock mode it also writes workout sessions and exercise logs through the backend provider.
- In Supabase mode it writes only through provider paths (`/workoutSessions` and `/exerciseLogs`), which map to `workout_sessions` and `exercise_logs` in `SupabaseProvider`.
- UI components do not import Supabase or any Supabase client.

## Logged workout data

Each exercise stores:

- exercise completion state
- per-set completion state
- per-set weight
- per-set reps
- exercise notes

The daily workout task updates through `buildDailyMission`, XP updates through `buildXpSnapshot`, and streaks update through `buildStreakSnapshot` after each save or completion.

## Developer validation

`/dev/workout` shows:

- active provider
- current workout
- exercise logs
- save status
- XP event
- mission update
- streak update
- offline queue size
