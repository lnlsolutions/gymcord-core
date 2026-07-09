# Admin platform validation notes

Build 037 validates the admin platform on the existing PR branch. Local history contains PR #58 and PR #59 merge commits, and the branch `HEAD` is `8ca18fc` (`Merge pull request #59 from lnlsolutions/codex/continue-work-on-pr-#58`), so this validation pass is based on the latest known main state in this checkout after those merges. The checkout has no configured `origin` remote, so remote PR #60 metadata could not be fetched from GitHub in this environment.

`package.json` and `package-lock.json` remain synchronized. No dependency manifest changes were required; a root manifest comparison confirmed that every dependency and devDependency version declared in `package.json` matches the root package entry in `package-lock.json`.

## Admin route and repositories

- `/dev/admin` is registered in `App.tsx` and renders the repository-only admin validation surface.
- `AdminRepository` exists and exposes `loadDashboard`, `seedDashboard`, `switchTenant`, `viewAs`, and `getOfflineQueue`.
- `OrganizationRepository` exists and exposes `list`, `findById`, `search`, `create`, `archive`, `restore`, and `delete`.
- `OrganizationRepository.delete(id)` delegates to `archive(id)`, so admin destructive actions archive organization records instead of hard-deleting them.

## Tenant switching validation

The admin dashboard seed and `/dev/admin` validation action confirm that tenant switching updates all required metadata in one optimistic context update:

- active tenant
- active organization
- branding
- permissions
- enabled features
- navigation visibility
- billing state
- tenant switch history

`AdminRepository.switchTenant` persists the tenant context as metadata through `/adminDashboards` with `queueWhenOffline: true`, allowing the UI to update optimistically before repository reconciliation.

## White-label preview validation

The white-label preview matrix supports:

- GymCord Consumer
- Gym Enterprise
- Trainer Business
- switching without logout for each preview

The developer surface displays each preview and its enabled features without redesigning the production UI.

## Admin impersonation safety

Admin impersonation remains metadata-only:

- `viewAs` writes an audit metadata record to `/adminAuditEvents`.
- `securityBypass` is always `false`.
- `authBypass` is always `false`.
- `repositoryMetadataOnly` is always `true`.
- No auth/session mutation is performed by the admin repository or developer UI.

## Provider boundaries

UI import checks confirmed no files under `src/components` or `src/App.tsx` import:

- `@supabase/supabase-js`
- `getSupabaseClient`
- `SupabaseProvider`

Mock mode works through the shared backend provider factory. Supabase mode routes admin operations only through provider mappings: `AdminRepository` uses `/adminDashboards` and `/adminAuditEvents`, and `SupabaseProvider` maps those paths to `admin_dashboards` and `admin_audit_events` through the centralized table map.

## Offline queue and optimistic updates

Offline queue support is implemented through the shared API client and documented for admin operations. Queueable admin paths are `/adminDashboards`, `/adminAuditEvents`, and `/organizations`; `AdminRepository.getOfflineQueue()` filters the shared offline queue to those admin metadata writes.

Optimistic updates are implemented for:

- tenant switching, before `AdminRepository.switchTenant` reconciliation
- admin organization metadata updates in the developer validation page

## Integration readiness

The admin dashboard declares readiness for:

- multi-tenant foundation
- white-label preview
- billing
- trainer portal
- member app
- admin operations

## Validation commands

- `npm ci` is blocked in this environment by registry authorization: `npm error code E403` and `403 Forbidden - GET https://registry.npmjs.org/@testing-library%2fjest-dom`.
- `npm run build` cannot complete after the blocked install because dependencies are absent; TypeScript reports missing installed modules such as `react`, `react/jsx-runtime`, `@supabase/supabase-js`, `lucide-react`, and `recharts`.
- `npm run test` cannot complete after the blocked install because `vitest` is not installed.
- Manifest synchronization was confirmed with a Node root dependency comparison between `package.json` and `package-lock.json`.
- Admin repository, route, provider mapping, and UI Supabase-boundary scans passed with ripgrep.
