# Beta QA deployment readiness

Build 039 adds a repository-backed beta QA dashboard at `/dev/qa` for validating deployment readiness without bypassing authentication or importing Supabase clients in UI components.

## What the dashboard reports

- Active provider and environment status.
- Route availability matrix for member, trainer, gym, and admin surfaces.
- Provider mapping diagnostics for mock and Supabase modes.
- Environment variable checks for backend provider, API base URL, and Supabase configuration.
- Supabase readiness through repository/provider contracts only.
- Mock mode readiness using deterministic repository fixtures.
- Offline queue readiness and failed-write visibility.
- Navigation, tenant switching, white-label, auth, and billing metadata QA checklists.
- npm registry authorization blocker tracking for beta validation.
- Known launch blockers and a deployment readiness score.

## Readiness interpretation

- **90–100%**: beta deployable.
- **75–89%**: deploy with watchlist; resolve warnings before broad rollout.
- **Below 75%**: blocked for beta deployment.

Warnings are intentionally visible for production-only tasks such as custom domain cutover and npm registry authorization checks. Supabase configuration becomes blocking only when `VITE_BACKEND_PROVIDER=supabase`.

## Security and architecture notes

- The `/dev/qa` page is wrapped with `AuthProvider` and `ProtectedRoute`.
- QA UI components read diagnostics from `QARepository` and do not import `@supabase/supabase-js`, `getSupabaseClient`, or `SupabaseProvider`.
- Supabase mode readiness is validated through existing provider mappings and configuration metadata.
- The dashboard does not perform hard deletes, auth bypasses, or security bypasses.
