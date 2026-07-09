# Progress Experience V1

Build 026 adds a repository-backed progress tracking surface for measurements, weight, progress photo metadata, transformation scoring, XP, mission progress, and streak updates.

## User experience

The production page is rendered by `src/components/progress/ProgressExperience.tsx` and is composed from focused components:

- `ProgressHeader.tsx` shows the active provider, save status, and transformation score.
- `WeightTracker.tsx` records the latest weight and displays recent history.
- `MeasurementLogger.tsx` records waist, hips, glutes, thighs, arms, and chest measurements.
- `BodyMeasurements.tsx` summarizes the latest measurement set.
- `ProgressPhotoLogger.tsx` records progress photo metadata paths or URLs for front, side, and back photos.
- `ProgressTimeline.tsx` shows recent progress events.
- `ProgressSummary.tsx` displays repository outputs for XP, mission, streak, and offline queue state.

## Repository flow

All saves go through `ProgressRepository.saveProgress`.

1. The UI builds the next `DailyLog` patch.
2. `ProgressExperience` calls `ProgressRepository.saveProgress` with the selected date, updated log, and current log map.
3. The repository persists local mock/cache state for offline-safe reads.
4. The repository writes measurement rows, photo metadata rows, XP events, mission progress, and streak updates through the active backend provider.
5. Supabase mode uses provider paths such as `/measurements`, `/progressPhotos`, `/xpEvents`, `/missions`, and `/streaks`; UI components do not import Supabase.

## Mock mode

Mock mode uses `MockBackendProvider` via `createBackendProvider`, so developer validation works without network services or Supabase credentials.

## Supabase mode

Supabase writes are routed through `SupabaseProvider` path aliases only. Components and developer pages depend on repositories, not Supabase clients.

## Developer page

Open `/dev/progress` to validate:

- active provider
- measurements
- weight history
- progress photo metadata
- transformation score
- save status
- XP event
- mission update
- streak update
- offline queue

## Validation

Run:

```bash
npm run build
npm run test
```
