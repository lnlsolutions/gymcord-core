# Notifications Validation Notes

## Build 033 revision validation

- PR #52 is being updated on the current branch. The local history includes the latest available `main` merge commits for PR #50 and PR #51, with `c255a90` recorded as the PR #51 merge commit and `3ebadb3` as the messaging validation commit from PR #50. No remote named `origin` is configured in this checkout, so remote PR metadata cannot be queried from this environment.
- `package.json` and `package-lock.json` remain synchronized for declared dependencies.
- `/dev/notifications` exists and renders `DeveloperNotifications` through `App.tsx` without redesigning the production UI.
- `NotificationRepository` exists and exposes `list`, `findById`, `create`, `markRead`, `archive`, `getPreferences`, `savePreferences`, `defaultPreferences`, and `seedSamples`.
- Notification deletion defaults to archive behavior: `delete` delegates to `archive`, and archived notifications are filtered out of default list results through `deletedAt`.
- Mock mode works without Supabase environment variables because notifications use the shared `apiClient` and `MockBackendProvider` collection paths when `VITE_BACKEND_PROVIDER` is unset or `mock`.
- Supabase mode routes only through provider mappings: `NotificationRepository` calls `/notifications` and `/notificationPreferences`; `SupabaseProvider` maps those paths to `notifications` and `notification_preferences`.
- UI components do not import `@supabase/supabase-js`, `getSupabaseClient`, or `SupabaseProvider`; notification UI imports only repository and domain types.
- Optimistic mark-read and optimistic archive are implemented in the developer validation page as local state updates before repository reconciliation.
- Offline queue support is implemented by marking notification and notification preference writes with `queueWhenOffline: true`; the developer page reports queued notification writes from the shared offline engine.

## Integration readiness

Notifications are integration-ready for:

- Member app: in-app notifications are modeled with `Notification.channel="in_app"`, user scoping, read state, and preferences.
- Trainer Portal: organization-scoped alerts can be listed by organization and delivered to trainer or member users.
- Calendar reminders: `calendarReminders` preferences and notification channels support reminder fan-out from calendar events.
- Messaging alerts: `messagingAlerts` preferences and push/email/SMS metadata support direct and trainer-member message alerts.
- Program assignment alerts: `programAssignmentAlerts` preferences support assignment notifications for new or updated programs.
- Push notifications: preferences include push enablement, endpoint, platform, and token metadata without UI-level provider SDK imports.
- Email/SMS delivery: preferences include email address verification and SMS phone verification metadata for downstream delivery services.

## Preference and delivery metadata

`NotificationPreferences` documents delivery controls per user:

- `channels` toggles in-app, email, push, and SMS delivery.
- `digestFrequency` and `quietHours` provide throttling and quiet-window metadata.
- `calendarReminders`, `messagingAlerts`, `programAssignmentAlerts`, and `marketing` provide product-level routing controls.
- `push` stores enablement plus optional endpoint, platform, and token ID metadata.
- `email` stores enablement plus optional address and verification metadata.
- `sms` stores enablement plus optional phone number and verification metadata.

## Validation commands

```bash
git log --oneline --decorate -5
git remote -v
node -e 'const fs=require("fs");const pkg=JSON.parse(fs.readFileSync("package.json"));const lock=JSON.parse(fs.readFileSync("package-lock.json"));for (const section of ["dependencies","devDependencies"]) for (const [name, range] of Object.entries(pkg[section]||{})) { if (lock.packages["" ][section]?.[name] !== range) { console.error(`${section}.${name} mismatch`); process.exit(1); }} console.log("package manifests synchronized")'
npm ci
npm run build
npm run test
rg -n 'window.location.pathname === "/dev/notifications"|NotificationRepository|list\(|findById\(|create\(|markRead\(|archive\(|getPreferences\(|savePreferences\(|defaultPreferences\(|seedSamples\(' src/App.tsx src/repositories/NotificationRepository.ts src/components/Dev/DeveloperNotifications.tsx
if rg -n '@supabase/supabase-js|getSupabaseClient|SupabaseProvider' src/components --glob '*.{ts,tsx}'; then exit 1; fi
rg -n 'notificationPreferences|notification_preferences|notifications' src/api src/repositories/NotificationRepository.ts
```
