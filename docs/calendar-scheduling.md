# Calendar & Scheduling V1

Calendar & Scheduling V1 introduces a repository-only scheduling surface for GymCord trainers, members, workouts, check-ins, appointments, availability, reminders, recurring metadata, and Program Builder milestone dates.

## Architecture

- UI components live in `src/components/calendar/` and call `CalendarRepository` only.
- Calendar UI does not import Supabase clients, providers, or database SDKs.
- `CalendarRepository` uses the existing `apiClient` provider mapping, so the same interface works with Mock mode and Supabase mode.
- Writes use `queueWhenOffline: true`, which routes failed offline writes into the existing offline sync queue.
- Create and update flows are designed for optimistic UI updates; the scheduler updates local state before waiting for remote confirmation.
- `delete` archives by default. Explicit cancel and archive methods preserve historical scheduling data.

## Event model

Calendar events support these event types:

- `workout`
- `check_in`
- `appointment`
- `program_milestone`
- `availability`
- `custom`

Event metadata includes trainer/member/program/workout references, reminders, recurrence metadata, timezone, location, and extensible integration metadata for Program Builder and Trainer Portal.

## Availability

Availability blocks are independent records so Trainer Portal can expose bookable trainer windows without overloading member appointments. Blocks include capacity, status, recurrence metadata, and timezone.

## Recurring events

Recurring events store structure only in V1:

- frequency: daily, weekly, monthly
- interval
- optional days of week
- optional end date/count
- timezone

Expansion into generated instances is intentionally deferred to integration layers.

## Developer page

Open `/dev/calendar` to verify:

- active provider
- events loaded
- selected event
- availability blocks
- recurring event metadata
- reminders
- pending sync
- offline queue
- save status

## Supabase mapping readiness

The repository reads and writes these API paths:

- `/calendar-events`
- `/availability-blocks`

Supabase mode should map those paths through the provider table mapping layer without UI changes.
