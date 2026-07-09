# Calendar Scheduling Validation

Build 031 validates Calendar Scheduling for PR #48 without redesigning the UI.

## PR base and dependency lock validation

- Local branch `work` contains merge commit `f978a0a` (`Merge pull request #47 ...`) after PR #46 and PR #47 history, so the branch is based on the latest main content available in this checkout.
- `git fetch origin main` could not be used to compare against the remote because this checkout has no `origin` remote configured. That is the only PR-base validation limitation observed locally.
- `package.json` and `package-lock.json` remain synchronized for declared dependencies by direct manifest comparison. `npm ci` could not install dependencies because the configured registry returned `403 Forbidden - GET https://registry.npmjs.org/@testing-library%2fjest-dom`.

## Developer route

- `/dev/calendar` is registered in `App.tsx` and renders the Calendar Scheduling developer validation page.
- The page is repository-only diagnostics and does not redesign production UI.

## Repository contract

`CalendarRepository` exists and exposes:

- `list`
- `findById`
- `create`
- `update`
- `cancel`
- `archive`
- `delete`
- `listAvailability`
- `createAvailability`
- `updateAvailability`
- `archiveAvailability`

Calendar event writes and availability writes use `queueWhenOffline: true` through the shared API client. Because `npm ci` is blocked by registry authorization, build and test commands cannot complete in this checkout without installed dependencies.

## Delete behavior

- `delete(id)` delegates to `cancel(id)`, making cancellation the default destructive behavior for calendar events.
- `archive(id)` remains an explicit event lifecycle action for records that should be hidden from active calendar lists.
- `archiveAvailability(id)` archives trainer availability slots instead of hard-deleting them.

## Mock and Supabase mode

- Mock mode works without Supabase environment variables because `VITE_BACKEND_PROVIDER=mock` uses `MockBackendProvider`; the mock provider creates collections lazily for `/calendarEvents` and `/calendarAvailability`.
- Supabase mode routes through provider mappings only: `CalendarRepository` calls the shared API client paths, and `SupabaseProvider` maps `calendarEvents` to `calendar_events` and `calendarAvailability` to `calendar_availability`.
- UI components do not import `@supabase/supabase-js`, `getSupabaseClient`, or `SupabaseProvider`.

## Optimistic updates and offline queue

- The `/dev/calendar` diagnostics include an optimistic validation action that inserts a local event row before repository reconciliation.
- Calendar writes (`create`, `update`, `cancel`, `archive`, `delete`, `createAvailability`, `updateAvailability`, and `archiveAvailability`) are queueable when the browser is offline.
- Offline sync remains centralized in the existing app context and shared offline engine; Calendar does not own a separate queue.

## Integration readiness

Calendar event metadata is ready for the known integration surfaces:

- Program Builder milestones use `kind: "program_milestone"`, `sourceModule: "program_builder"`, and `sourceId`.
- Trainer Portal appointments use `kind: "trainer_appointment"` with trainer/member IDs.
- Member check-ins use `kind: "member_check_in"`.
- Workout schedules use `kind: "workout_schedule"`.

## Recurring event metadata and reminders

- Events and availability support recurring metadata with frequency, interval, count/until, and optional days of week.
- Events support reminders with offset minutes, notification channel, and an optional message.
- Reminder delivery should remain behind automation/notification services; Calendar stores scheduling intent and metadata only.

## Validation commands

```sh
git fetch origin main
node -e 'const fs=require("fs"); const pkg=JSON.parse(fs.readFileSync("package.json","utf8")); const lock=JSON.parse(fs.readFileSync("package-lock.json","utf8")); const deps={...pkg.dependencies,...pkg.devDependencies}; const locked=lock.packages[""]; for (const [name, version] of Object.entries(deps)) { if (locked.dependencies?.[name]!==version && locked.devDependencies?.[name]!==version) { throw new Error(`${name} mismatch`); } } console.log("package manifests synchronized");'
npm ci
npm run build
npm run test
rg -n 'window.location.pathname === "/dev/calendar"|CalendarRepository|async list\(|async findById|async create\(|async update\(|async cancel|async archive\(|async delete\(|async listAvailability|async createAvailability|async updateAvailability|async archiveAvailability|calendarEvents|calendarAvailability' src/App.tsx src/repositories/CalendarRepository.ts src/api/providers/SupabaseProvider.ts src/api/supabaseTableMap.ts
if rg -n '@supabase/supabase-js|getSupabaseClient|SupabaseProvider' src/components --glob '*.{ts,tsx}'; then exit 1; fi
```
