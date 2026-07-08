# GymCord Cloud Foundation Architecture

Sprint 007 introduces a backend-agnostic foundation for taking GymCord from a local-first app toward a production SaaS platform. The goal is to define stable enterprise seams without changing the current UI or binding the product to a specific backend vendor.

## Services

The `src/services` layer contains infrastructure contracts and mock-ready adapters:

- `api`: HTTP client interface for future REST or edge-function calls.
- `auth`: authentication session and auth state listener contracts.
- `database`: collection-oriented persistence contract for hosted databases.
- `storage`: browser key/value storage abstraction used by the existing local persistence helpers.
- `sync`: offline queue, auto-sync, and conflict-resolution architecture with a mock implementation.

These services are deliberately interface-first. Firebase, Supabase, GraphQL, REST, or custom backend implementations can be added later behind the same contracts.

## Domain Interfaces

Core SaaS domain models live in `src/types/domain.ts` and cover:

- Users, trainers, gyms, organizations, and memberships.
- Workout sessions, exercise logs, meal logs, and progress photos.
- Messages, notifications, achievements, and missions.

The existing local application types remain in `src/types/gymcord.ts` so UI behavior is preserved while cloud-ready types evolve independently.

## Repositories

`src/repositories` defines repository-pattern interfaces for application data access:

- `UserRepository`
- `WorkoutRepository`
- `MissionRepository`
- `ProgressRepository`
- `AtlasRepository`
- `NotificationRepository`
- `AchievementRepository`

Repositories return source metadata (`cache`, `remote`, or `mock`) and hide implementation details from components and engines. No Firebase-specific code exists in these contracts.

## State Flow

`src/context/AppContext.tsx` centralizes cross-cutting application state:

1. Authentication state exposes whether a user is authenticated or authenticating.
2. Current user and organization are held at the app shell level.
3. Theme state is centralized for future app-wide theming.
4. Network state tracks browser online/offline transitions.
5. Offline state is derived from network status and can also be overridden by app logic.

The root app now renders inside `AppContextProvider`, while the existing feature state remains unchanged to avoid UI redesign.

## Offline Strategy

The mock offline engine supports the production architecture without performing real remote writes yet:

1. Writes are queued with entity, operation, payload, status, attempts, and timestamps.
2. The queue is persisted through the storage service.
3. Browser `online` events trigger mock sync automatically.
4. Conflict resolution is represented through explicit strategies: `client_wins`, `server_wins`, and `manual_review`.
5. Future backend adapters can replace mock sync with real remote commits while preserving queue semantics.

This design supports local-first user experiences, recoverable writes, auditable retries, and deterministic conflict handling.

## Environment Configuration

Runtime configuration is centralized in `src/config/index.ts`. Storage keys, onboarding timing, sync intervals, retry limits, app name, and environment mode are now read from Vite environment variables with safe defaults.

## Future Backend Support

To add a production backend:

1. Implement `AuthService` for the selected identity provider.
2. Implement `DatabaseService` and/or `ApiClient` for the backend transport.
3. Implement repository interfaces using those services.
4. Replace `MockOfflineEngine.sync()` with a remote-aware sync pipeline.
5. Add server conflict payloads to `ConflictResolution` and route manual conflicts into product workflows.

Because components depend on app state and repositories rather than vendor SDKs, the UI can remain stable while backend infrastructure evolves.
