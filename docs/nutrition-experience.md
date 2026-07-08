# Nutrition Experience V1

Build 025 introduces a repository-backed nutrition experience for daily fuel tracking.

## User experience

The nutrition flow supports:

- meal logging with ingredients and notes
- calorie and protein entry
- water tracking against the daily eight-serving target
- meal photo path entry with metadata preview
- daily macro totals
- completion state (`empty`, `in_progress`, or `complete`)
- save feedback with offline queue visibility

## Repository flow

All saves go through `NutritionRepository`, which delegates persistence to `DailyActivityRepository`. The repository calculates the daily mission, XP snapshot, and streak snapshot before saving so nutrition changes update the same production persistence path as the dashboard and workout experiences.

No nutrition UI imports Supabase directly. Supabase mode is reached only through the configured backend provider and repository path. Mock mode works through the mock backend provider and local persistence fallback.

## Developer page

Visit `/dev/nutrition` to verify:

- active provider
- current day nutrition log
- macro totals
- water status
- meal photo metadata
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
