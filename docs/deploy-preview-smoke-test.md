# Deploy Preview Smoke Test — Build 041

Deploy preview baseline: <https://deploy-preview-66--gymcoredbeta.netlify.app>

## Tested routes

| Route | Result | Notes |
| --- | --- | --- |
| `/` | Not reachable from container | Network proxy returned `CONNECT tunnel failed, response 403` before the deploy preview could be loaded. |
| `/dev/app-shell` | Not reachable from container | Local app shell surface was polished to make role switching and route launch links clearly clickable. |
| `/dev/qa` | Not reachable from container | Local QA surface was updated to show Build 041 beta readiness and clickable route coverage. |
| `/dev/admin` | Not reachable from container | Existing repository-only admin diagnostics remain available. |
| `/dev/tenancy` | Not reachable from container | Existing white-label and tenant switching diagnostics remain available. |
| `/dev/billing` | Not reachable from container | Existing metadata-only billing diagnostics remain available. |
| `/dev/check-ins` | Not reachable from container | Route remains registered in the app switchboard. |
| `/dev/notifications` | Not reachable from container | Route remains registered in the app switchboard. |
| `/dev/messaging` | Not reachable from container | Route remains registered in the app switchboard. |
| `/dev/calendar` | Not reachable from container | Route remains registered in the app switchboard. |
| `/dev/exercise-library` | Not reachable from container | Route remains registered in the app switchboard. |
| `/dev/program-builder` | Not reachable from container | Route remains registered in the app switchboard. |
| `/dev/trainer` | Not reachable from container | Route remains registered in the app switchboard. |

## Results

- The deploy preview smoke test could not complete from this container because outbound HTTPS through the configured proxy returned `403` for the Netlify deploy preview.
- `npm ci` also remains blocked by registry authorization for `https://registry.npmjs.org/@testing-library%2fjest-dom`.
- Static route review confirmed the requested development routes are registered in the app-level route switchboard.

## Fixes made

- Updated `/dev/qa` to clearly identify Build 041 deploy preview beta readiness, show the PR #66 deploy preview baseline context, and expose the route availability matrix as clickable links.
- Updated `/dev/app-shell` to make the tenant-aware white-label header, role mode switcher, and route launcher more explicit for a clickable beta demo.

## Remaining blockers

- Netlify deploy preview validation is blocked from this container by `curl: (56) CONNECT tunnel failed, response 403`.
- Dependency installation is blocked by `npm ci` returning `403 Forbidden - GET https://registry.npmjs.org/@testing-library%2fjest-dom`.
- Because dependencies cannot be installed, local `npm run build` and `npm run test` cannot be validated in this container unless `node_modules` is already present.

## Beta demo notes

- Start at `/dev/qa` to explain the beta readiness score, provider diagnostics, auth guard posture, offline queue diagnostics, and route coverage.
- Continue to `/dev/app-shell` to demonstrate tenant-aware branding, role-based navigation, hidden routes by mode, and clickable module launch links.
- Use `/dev/admin`, `/dev/tenancy`, and `/dev/billing` to show admin operations, white-label tenancy, and billing metadata without Supabase UI imports, security bypasses, or hard deletes.
