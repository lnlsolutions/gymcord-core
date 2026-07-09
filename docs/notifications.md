# Notifications V1

Notifications V1 adds a repository-driven notification center for member, trainer, team, reminder, and system alert use cases without importing backend clients in UI components.

## Architecture

- `src/repositories/NotificationRepository.ts` is the only data access layer for notifications and preferences.
- UI components under `src/components/notifications/` call repository methods only; they do not import Supabase, `getSupabaseClient`, or provider context.
- Mock mode works through the shared `apiClient` mock provider.
- Supabase mode is integration-ready through provider path/table mappings for `notifications` and `notification_preferences`.
- Mutating actions use `queueWhenOffline: true` so the shared offline engine captures writes when the browser is offline.

## Features

- Notification center, list, card, detail, filters, preferences, reminder settings, push metadata panel, and system alert summary.
- Optimistic mark read/unread and archive flows.
- Archive is the default delete behavior; hard delete is intentionally not exposed from the UI.
- Reminder notification types cover workout, nutrition, progress, and calendar reminders.
- Integration-ready source metadata supports trainer portal, member app, messaging, calendar, program builder, nutrition, progress, workout, and system modules.
- Delivery metadata includes push payload fields plus email and SMS template/message fields.

## Developer validation page

Open `/dev/notifications` to inspect:

- active provider
- notifications loaded
- selected notification
- read/unread state
- notification preferences
- push metadata
- email/SMS metadata
- pending sync and offline queue
- save status

## Provider contracts

Persist `AppNotification` records at `/notifications` and `NotificationPreference` records at `/notificationPreferences`. Supabase deployments should map these resources to `notifications` and `notification_preferences` tables respectively.

## Offline behavior

`markRead`, `archive`, `create`, and `savePreferences` queue writes when the browser reports offline. The UI updates optimistically first, then records the repository sync status.
