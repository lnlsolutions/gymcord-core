# Full beta integration: zero-state, workouts, journal

## Zero-state and score rules
Member-entered health, nutrition, recovery, sleep, workout, body, activity, and progress data starts as `0`, empty, `null`, or `No data yet`. Score eligibility is centralized in `src/lib/metrics/dataSufficiency.ts`, `metricGuards.ts`, and `scoreEligibility.ts`; the UI must show “No data yet”, “Start logging to unlock this insight”, “Not enough data to calculate”, or “Add your first entry” until sufficient member-owned data exists.

## Dashboard behavior
Dashboard cards should link to real routes for workouts, journal, sleep, recovery, progress, Atlas, subscription, gym/trainer, photos, and consistency. Empty cards must show next actions rather than invented scores.

## Workout library and player
The workout foundation lives under `src/data/exercises`, `src/data/workouts`, and `src/data/programs`. Exercises include muscles, equipment, difficulty, instructions, prescriptions, tempo, form cues, regressions, progressions, safety notes, media placeholders, and tags. Workout routes cover library browsing, filtering, details, starting a workout, custom workout creation, programs, and history. History remains empty until completion is logged by the member.

## Training splits
Program templates include 3-day full body, 4-day upper/lower, 5-day PPL plus upper/lower, 6-day PPL repeat, beginner 3-day, hypertrophy 5-day, strength 4-day, glute-focused 4-day, home dumbbell 4-day, and conditioning 3-day.

## Meal-photo journal
The nutrition journal supports multiple meals per day and multiple photos per meal with preview, removal before save, captions-ready photo records, local mock image storage, future Supabase metadata, archive status, and visible analysis status. Nutrition totals are manual only and display “Not entered” when absent; no AI food analysis calls run in this build.

## Sleep, recovery, and body progress
Sleep and recovery routes accept manual entries from empty state and do not calculate readiness, sleep, or recovery scores without eligibility. Progress remains member-owned and supports measurements, notes, and front/side/back/custom photo concepts with archive-over-delete ownership rules.

## Navigation
Mobile navigation uses five primary items: Home, Workouts, Journal, Atlas, and Menu. The menu drawer groups Member, Coaching, and Account links, excludes developer links, provides accessible touch targets, and closes on navigation.

## Pricing and billing
Pricing, subscribe, billing, upgrade, and account subscription routes remain visible as beta-safe metadata screens. Member UI should show readable cards/tables; developer pages may expose raw metadata.

## Demo mode separation
Normal member routes use zero-state data unless the member enters data. Demo routes are allowed seeded data only when visibly labeled “Demo Mode”.

## Ownership model
Workout history, custom workouts, nutrition entries, meal photos, sleep logs, recovery logs, progress photos, body measurements, Atlas history, records, notes, and journal history belong to the permanent member account. Gym and trainer relationships grant access only; data is archived rather than hard-deleted.

## Route audit results
Primary routes audited in this build: `/`, `/pricing`, `/onboarding`, `/auth`, `/auth/signup`, `/auth/login`, `/app`, `/workouts`, `/workouts/library`, `/workouts/programs`, `/nutrition`, `/nutrition/journal`, `/sleep`, `/recovery`, `/progress`, `/atlas`, `/calendar`, `/messages`, `/check-ins`, `/billing`, `/upgrade`, `/account/subscription`, and `/settings`.

## Known remaining blockers
The beta uses local/mock persistence for new workout and meal-photo interactions. Real provider-backed file storage, payment processing, wearable sleep ingestion, and AI food analysis are intentionally not enabled.
