# AI Check-ins V1

AI Check-ins use repository architecture so member, trainer, and Atlas Coach surfaces never import Supabase clients directly. UI components call `CheckInRepository`, which routes reads and writes through the active backend provider.

## Scope

- Member check-in form for mood, energy, soreness, goal reflection, workout compliance, nutrition compliance, and progress trends.
- Trainer review queue for submitted check-ins and coach feedback notes.
- Weekly summary panels for compliance, progress, Atlas-generated insights, risk flags, and follow-up tasks.
- Status workflow: `draft` → `submitted` → `in_review` → `feedback_ready` / `action_required` → `completed` → `archived`.

## Repository behavior

`src/repositories/CheckInRepository.ts` supports:

- Mock mode through `/checkIns` records in `MockBackendProvider`.
- Supabase mode through the `check_ins` provider mapping.
- Offline queue support via `queueWhenOffline` and repository queue filtering.
- Optimistic submit and review helpers (`submit`, `review`).
- Archive-by-default deletion through `archive`, with `delete` delegating to archive.

## Integration readiness

Check-in records include metadata for:

- Atlas Coach insights (`atlasInsights`).
- Risk flags (`riskFlags`).
- Trainer Portal action queues (`followUpTasks`).
- Member app feedback states (`status`, `coachFeedbackNotes`).
- Notifications (`notificationMetadata` and follow-up integration targets).
- Calendar scheduling (`calendarMetadata` and follow-up integration targets).

## Developer verification

Open `/dev/check-ins` to inspect:

- Active provider and repository source.
- Loaded check-ins and selected check-in.
- Status workflow.
- Workout and nutrition compliance summary.
- Atlas insight metadata.
- Risk flags.
- Follow-up tasks.
- Pending sync and offline queue.
- Save status for optimistic submissions.
