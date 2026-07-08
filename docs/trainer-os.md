# Trainer OS Foundation

Build 022 introduces the first Trainer OS foundation for GymCord. It adds a separate trainer workspace at `/trainer` and a developer verification page at `/dev/trainer-os` without redesigning the existing member UI.

## Routes

- `/trainer` renders the trainer workspace behind the existing authenticated route protection.
- `/dev/trainer-os` renders repository diagnostics for provider state, trainer user, assigned clients, sample detail data, and last repository status.

## Trainer Dashboard

The Trainer Dashboard is focused on quick triage for assigned clients:

- Assigned clients
- Client adherence percentage
- Latest workout completion
- Nutrition compliance
- Progress photo status
- Unread messages
- At-risk clients and risk reasons

## Client Detail

The client detail view exposes the trainer-facing member record:

- Profile
- Goals
- Injuries
- Workout history
- Nutrition logs
- Progress photo metadata
- Measurements
- XP and streak status
- Atlas summary
- Trainer notes

## Repository abstraction

`TrainerRepository` is the integration boundary for Trainer OS. It supports:

- `listAssignedMembers(session)`
- `getClientDetail(session, clientId)`
- `assignWorkout(session, clientId, workoutId)`
- `addTrainerNote(session, clientId, note)`
- `flagClientRisk(session, clientId, reason)`
- `loadWorkspace(session)` for developer diagnostics

The repository uses the active backend provider from `createBackendProvider()`. If remote reads fail or a provider is not configured, mock client data remains available so local development and demo mode keep working.

## Supabase table path mapping

Trainer OS provider paths map through the Supabase provider to snake_case schema tables:

| Repository path | Supabase table |
| --- | --- |
| `/trainerAssignments` | `trainer_assignments` |
| `/trainerClientDetails` | `trainer_client_details` |
| `/workoutAssignments` | `workout_assignments` |
| `/trainerNotes` | `trainer_notes` |
| `/clientRiskFlags` | `client_risk_flags` |

## Local persistence

Trainer notes and risk flags are mirrored to local storage for mock mode and resilient UI refreshes:

- `gc.trainer.notes`
- `gc.trainer.riskFlags`
- `gc.trainer.lastRepositoryStatus`

## Validation

Run:

```bash
npm run build
npm run test
```
