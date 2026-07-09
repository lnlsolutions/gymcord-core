# Atlas Coach V1

## Production readiness validation

Atlas Coach V1 was finalized on the existing PR branch for BUILD 027. The local branch could not fetch or merge `origin/main` because this checkout has no configured `origin` remote, so there were no remote merge conflicts to resolve in this environment. Static validation confirms the Atlas work remains compatible with the existing production architecture, authentication, repository layer, database providers, Supabase integration, Dashboard, Workout Experience, Nutrition Experience, Progress Experience, and Trainer OS boundaries.

Validation commands:

- `git fetch origin main && git merge origin/main` — blocked because `origin` is not configured in this checkout.
- `npm ci` — blocked by npm registry authorization: `403 Forbidden - GET https://registry.npmjs.org/@testing-library%2fjest-dom`.
- `npm run build` — could not complete after the blocked install because dependencies are absent; TypeScript reported missing installed packages such as `react`, `react/jsx-runtime`, `lucide-react`, `recharts`, and `@supabase/supabase-js`.
- `npm run test` — could not complete after the blocked install because `vitest` is not installed.
- `npx tsc --noEmit` — could not complete after the blocked install because dependencies and Vite types are absent.
- `if rg -n "@supabase/supabase-js|getSupabaseClient|SupabaseProvider" src/components src/App.tsx --glob '*.{ts,tsx}'; then exit 1; fi` — confirmed UI components and the app shell do not import Supabase client symbols.
- `rg -n "path: \"/atlasConversations\"|path: \"/atlasMemory\"" src/repositories/AtlasCoachRepository.ts` — confirmed Atlas persistence is routed through the repository and uses the provider paths `/atlasConversations` and `/atlasMemory`.
- `git diff --check` — completed successfully.

## Repository flow

Atlas UI reads and writes through `AtlasCoachRepository`. The app initializes cached conversation history from the repository, hydrates remote conversation history through `loadConversation`, writes new chat entries through `rememberConversation`, and persists memory summaries through `saveMemory`.

The repository owns:

- conversation history loading and saving;
- memory summary saving and fallback loading;
- active provider reporting;
- Atlas save status;
- Atlas-specific offline queue diagnostics.

The UI continues to compute daily context from the existing Mission, XP, Streak, Achievement, Transformation, memory, context, and Atlas insight engines. The UI does not instantiate Supabase clients or import provider implementations.

## Provider routing

Atlas provider routing is intentionally narrow:

- `/atlasConversations` stores chat turns as tenant/user-scoped conversation records.
- `/atlasMemory` stores the latest tenant/user-scoped Atlas memory summary and latest insight snapshot.

`SupabaseProvider` maps those paths to the production tables:

- `/atlasConversations` → `atlas_conversations`
- `/atlasMemory` → `atlas_memory`

No Atlas UI component imports `@supabase/supabase-js`, `getSupabaseClient`, or `SupabaseProvider`.

## Mock mode behavior

When `VITE_BACKEND_PROVIDER` is unset or set to `mock`, Atlas uses `MockBackendProvider`. The mock provider supports `/atlasConversations` and `/atlasMemory` as in-memory collections, while `AtlasCoachRepository` also mirrors conversation and memory state to local storage for refresh-safe demo behavior.

Mock mode does not require Supabase URL or anon key environment variables.

## Supabase behavior

When `VITE_BACKEND_PROVIDER=supabase`, `AtlasCoachRepository` sends Atlas writes through the shared backend provider only. Supabase configuration remains isolated to `createBackendProvider` and `SupabaseProvider`; Atlas UI components never construct or import Supabase clients.

Atlas Supabase writes include `organizationId`, `userId`, timestamps, and either a conversation `entry` payload or memory summary payload so row-level security and tenant scoping can be enforced by the database layer.

## Atlas UI coverage

Atlas Coach V1 includes:

- chat composer and assistant responses;
- conversation history;
- daily coaching prompts;
- workout suggestions;
- nutrition suggestions;
- progress insights;
- goal reminders;
- habit nudges;
- memory summaries;
- safety disclaimer.

## Developer diagnostics

The diagnostics page is available at `/dev/atlas` and displays:

- active provider;
- conversation history;
- memory state;
- latest insight;
- save status;
- Atlas offline queue.
