# Beta App Shell

Build 038 adds a repository-backed beta shell around the existing GymCord modules. The shell is intentionally aligned with the current visual language and does not introduce direct UI access to Supabase clients.

## What is included

- App shell navigation with role-aware module visibility.
- Tenant-aware header showing the active gym, active trainer context, provider, and active white-label brand.
- Consumer, trainer, gym, and admin mode switching.
- Module cards and dashboard shortcuts for visible routes.
- Route guard metadata for hidden modules.
- Empty states for connected beta modules that do not yet render a full workflow.
- `/dev/app-shell` developer page exposing provider, active mode, active tenant, active brand, route metadata, permissions, navigation visibility, beta checklist, pending sync, and save status.

## Repository architecture

`src/repositories/AppShellRepository.ts` composes tenancy and admin metadata from existing repositories. UI components only consume the repository snapshot and do not import `@supabase/supabase-js`, `getSupabaseClient`, or `SupabaseProvider`.

## Provider behavior

- Mock mode uses seeded tenant/admin metadata and is fully clickable.
- Supabase mode flows through provider mappings exposed by the API client and repository layer.
- Pending sync and save status are derived from existing offline queues.

## Route visibility

Visible routes are computed from three signals:

1. Active mode: consumer, trainer, gym, or admin.
2. Tenant feature metadata such as `member_app`, `trainer_portal`, `billing`, and `notifications`.
3. Role permission metadata from the active tenant brand.

Hidden routes remain visible on the developer page with guard reasons and required permissions.

## Security posture

- No auth bypass was added.
- No security bypass was added.
- Tenant/admin context switches are metadata-only.
- No hard deletes were introduced.
