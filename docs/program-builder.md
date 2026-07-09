# Program Builder

Build 029 adds a repository-backed Program Builder for trainers to create, edit, publish, duplicate, template, and assign workout programs.

## Entry point

- Developer verification page: `/dev/program-builder`
- UI components live in `src/components/programs/`.
- Persistence is isolated in `src/repositories/ProgramRepository.ts`.

## Architecture

The UI imports only repository APIs. It does not import `@supabase/supabase-js`, `getSupabaseClient`, or `SupabaseProvider`.

`ProgramRepository` supports:

- list, find, create, update, and delete
- optimistic local cache updates
- offline queue writes through the shared API client and sync engine
- draft saves and publish state transitions
- program duplication
- assignment records
- program templates

## Provider modes

Mock mode uses the existing mock backend provider and browser storage cache. Supabase mode uses provider path mapping for the `programs` table through the shared API provider layer.

## Program model

A program contains metadata, status, assignments, and a weekly schedule. A weekly schedule contains workout days. Workout days contain exercise blocks. Exercise blocks contain set prescriptions for reps, rest, tempo, and optional load notes.

## Developer diagnostics

The developer page displays:

- active provider
- programs loaded
- selected program
- assignment status
- draft/publish status
- pending sync
- offline queue
- save status

## Validation

Run:

```bash
npm ci
npm run build
npm run test
```

If dependency installation is blocked by registry authorization, use the existing dependency tree for static validation and document the limitation in the PR.
