# Multi-tenant white-label validation notes

Build 036 validates tenancy and white-label behavior on the existing PR branch after the local history includes the merge commits for PR #56 and PR #57, with `HEAD` at merge commit `c740e66` for PR #57.

## Package synchronization

`package.json` and `package-lock.json` remain synchronized. No dependency manifest changes were required for this validation pass; both manifests continue to declare `@supabase/supabase-js` as the application Supabase dependency.

## Developer route and repositories

- `/dev/tenancy` is registered in `src/App.tsx` and renders a developer-only validation surface.
- `TenancyRepository` exposes `loadSnapshot`, `seedSnapshot`, `switchTenantContext`, `switchTrainerContext`, `acceptInvite`, `updateRelationship`, `revokeAccess`, `endRelationship`, `updateBranding`, `updateSettings`, and `getOfflineQueue`.
- `GymRepository` is present for gym tenant listing.
- Supabase mode remains behind provider mappings only: tenancy repositories call `/gyms`, `/tenantRelationships`, `/tenantBranding`, and `/tenantSettings`; `SupabaseProvider` maps those paths to `gyms`, `tenant_relationships`, `tenant_branding`, and `tenant_settings`.
- UI components do not import `@supabase/supabase-js`, `getSupabaseClient`, or `SupabaseProvider`.

## User-owned account model

The tenancy snapshot documents that the user account is permanent, personal data remains user-owned, gym/trainer relationships only grant access, and the user keeps data after leaving a gym or trainer. Relationship lifecycle operations use `ended` or `revoked` metadata states rather than hard deletes.

## Join paths and metadata

The validation snapshot includes consumer signup, trainer onboarding link, and gym enterprise onboarding link paths. Invite metadata, acceptance metadata, and transfer metadata are included in relationship/join-path metadata so integrations can preserve attribution and user data ownership during transfers.

## White-label preview scope

The visible white-label preview is scoped to `/dev/tenancy` only and shows active brand name, logo/media placeholder, primary color, accent color, domain/subdomain, enabled features, role permissions, and onboarding path. No production UI redesign was performed.

## Offline queue and optimistic behavior

The tenancy offline queue filter is limited to relationship, settings, and branding metadata writes. Tenant switching and trainer switching are applied optimistically in the developer page before repository reconciliation.

## Mock and Supabase mode readiness

Mock mode works without Supabase environment variables because the shared API client defaults to `MockBackendProvider` unless `VITE_BACKEND_PROVIDER=supabase` is selected. Supabase mode routes only through centralized provider mappings, keeping Supabase client construction out of UI surfaces.

## Integration readiness

The tenancy snapshot marks Member app, Trainer Portal, Admin Dashboard, Billing, and Notifications as ready for integration against the relationship-scoped access model.

## Validation commands

- `npm ci` is blocked in this environment by npm registry authorization: `npm error code E403` and `403 Forbidden - GET https://registry.npmjs.org/@testing-library%2fjest-dom`.
- `npm run build` cannot complete after the blocked install because dependencies are absent; TypeScript reports missing installed modules such as `react`, `react/jsx-runtime`, `@supabase/supabase-js`, `lucide-react`, and `recharts`. The validation did fix an existing duplicate `else` syntax issue in `src/App.tsx`.
- `npm run test` cannot complete after the blocked install because `vitest` is not installed.
- UI import scan confirmed no files under `src/components` import `@supabase/supabase-js`, `getSupabaseClient`, or `SupabaseProvider`.
