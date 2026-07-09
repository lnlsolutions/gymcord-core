# Admin Platform + Tenant Switching V1

Build 037 adds a repository-first admin surface for validating GymCord multi-tenant operations without importing UI-only Supabase primitives into repositories.

## Scope

The admin platform supports:

- Admin dashboard diagnostics at `/dev/admin`.
- Organization list, search, detail metadata, creation, archive, and restore.
- Organization status derived from billing state or archive metadata.
- Tenant switching across GymCord Consumer, Gym Enterprise, and Trainer Business account contexts without changing accounts.
- Active tenant indicators for provider, organization, branding, permissions, enabled features, navigation, billing, and pending sync.
- White-label previews across Gym A, Gym B, Independent Trainer, and GymCord Consumer without logging out.
- Metadata-only admin impersonation for gym, trainer, and member previews.

## Repository architecture

Admin behavior is implemented in `AdminRepository.ts` and `OrganizationRepository.ts`.

Repositories use the existing `apiClient` abstraction so they can run in mock mode, Supabase provider mode, REST provider mode, and offline queue scenarios. Repository files do not import `@supabase/supabase-js`, `getSupabaseClient`, or `SupabaseProvider` directly.

## Tenant switching

`AdminRepository.switchTenant` records a metadata-only switch event and immediately returns an optimistic dashboard snapshot with updated:

- Active organization.
- Tenant kind.
- Branding tokens.
- Permission set.
- Enabled feature flags.
- Navigation visibility.
- Billing state.
- Tenant switch history.

## Impersonation safety

`AdminRepository.viewAs` creates a repository metadata preview only. It explicitly records:

- `metadataOnly: true`
- `securityBypass: false`
- `authBypass: false`

This means the admin preview never bypasses authentication, authorization, row-level security, or provider access controls.

## Archive lifecycle

Organizations are archived via `deletedAt` metadata using `OrganizationRepository.archive`. `delete` delegates to archive behavior so admin flows avoid destructive deletion. `OrganizationRepository.restore` clears archive metadata.

## Developer validation page

Open `/dev/admin` to validate:

- Active provider.
- Active tenant.
- Impersonation target.
- Organizations and search.
- Branding.
- Permissions.
- Enabled features.
- Billing state.
- Tenant switch history.
- Pending sync.
- Save status.
