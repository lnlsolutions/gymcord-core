# Trainer Portal V1

Trainer Portal V1 adds a repository-backed coach workspace for managing members, assigning programs, reviewing compliance, monitoring progress, triaging Atlas alerts, writing coach notes, handling daily tasks, and launching quick actions.

## Routes

- `/trainer` renders the production Trainer Portal.
- `/dev/trainer` renders the developer validation page with provider and sync diagnostics.

## Architecture

The UI in `src/components/trainer/` imports only repository modules, configuration, and domain types. It does not import `@supabase/supabase-js`, `getSupabaseClient`, or `SupabaseProvider`.

Data access is isolated behind:

- `TrainerRepository` for trainer summary, assignments, alerts, coach notes, and tasks.
- `MemberRepository` for trainer-scoped member loading and optimistic member updates.
- `ApiClient` and backend providers for Mock/Supabase mode switching.

## Mock and Supabase modes

Mock mode uses repository fallbacks and the `MockBackendProvider` collection behavior. Supabase mode goes through provider path mappings so UI components remain provider-agnostic.

## Offline and optimistic behavior

Repository writes use `queueWhenOffline: true`, which lets `ApiClient` enqueue non-GET mutations through the offline sync engine when the browser is offline. `MemberRepository` keeps an optimistic cache so member changes can be reflected before a remote write resolves.

## Developer validation

The `/dev/trainer` page displays:

- active provider
- trainer summary
- members loaded
- assigned programs
- compliance metrics
- pending sync
- offline queue
- save status
