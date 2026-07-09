# Exercise Library V1

`/dev/exercise-library` renders the repository-backed Exercise Library validation page for trainers.

## Repository boundary

`ExerciseRepository` is the only data access surface for Exercise Library UI. It exposes `list`, `findById`, `create`, `update`, `archive`, and `delete`; default delete behavior archives records by setting `status=archived` and `deletedAt` instead of hard deleting.

The UI components under `src/components/exercises` do not import `@supabase/supabase-js`, `getSupabaseClient`, or `SupabaseProvider`. Components call `ExerciseRepository`, and repository writes use the shared API client with `queueWhenOffline: true` so offline queue behavior remains centralized.

## Provider support

- Mock mode works through the shared mock backend provider and seeds reviewable starter exercises when the library is empty.
- Supabase mode flows through provider path `/exercises`, which maps to the `exercises` table in `SupabaseProvider`.
- Offline queue diagnostics are exposed via `ExerciseRepository.getOfflineQueue()`.
- The library applies optimistic create, edit, and archive updates before repository calls settle.

## Exercise model

Exercise records include:

- muscle groups, equipment, and difficulty filters
- media metadata
- coaching cues
- movement standards
- safety notes
- tags and archived status
- `programBuilder` defaults for later Program Builder integration

## Developer page diagnostics

The `/dev/exercise-library` route displays:

- active provider
- exercises loaded
- selected exercise
- search/filter state
- media metadata
- pending sync
- offline queue
- save status

## Validation commands

```bash
npm ci
npm run build
npm run test
rg -n "@supabase/supabase-js|getSupabaseClient|SupabaseProvider" src/components --glob '*.{ts,tsx}'
```
