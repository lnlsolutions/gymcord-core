# GymCord Database Architecture

Build 016 introduces a provider-neutral production database foundation. The UI and feature engines must talk to repositories, never directly to Supabase, Firebase, Postgres, SQLite, or mock persistence.

## Provider architecture

Database provider contracts live in `src/database`:

- `DatabaseProvider.ts` defines the provider boundary and the supported provider kinds: Supabase, Firebase, Postgres, SQLite, and Mock.
- `DatabaseClient.ts` defines collection-oriented reads, writes, deletes, queries, and transaction execution.
- `DatabaseTransaction.ts` standardizes transaction work units.
- `DatabaseMigration.ts`, `DatabaseSchema.ts`, and `DatabaseSeeder.ts` define schema governance, migrations, and seed data.
- `DatabaseHealth.ts` exposes provider health, connection state, latency, pending sync count, and provider status.

Runtime selection is centralized in `src/config/database.ts`. It supports development, staging, and production defaults and is controlled by environment variables such as `VITE_DATABASE_PROVIDER`, `VITE_DATABASE_URL`, and provider-specific keys.

## Repository flow

Persistence must flow through repository interfaces in `src/repositories`:

1. UI or engine calls a repository contract, such as `WorkoutRepository` or `NutritionRepository`.
2. The repository uses a `DatabaseClient` implementation for the active provider.
3. The repository reads from or writes to the cache layer.
4. Writes can enter the offline queue when the client is disconnected.
5. Provider implementations handle transport details without leaking provider-specific APIs upward.

The required repository surface covers users, workouts, exercises, missions, progress, nutrition, organizations, trainers, notifications, Atlas, analytics, and achievements.

## Caching

The cache layer lives in `src/cache` and provides:

- Memory cache for fast in-session reads.
- Persistent cache abstraction backed by GymCord key/value storage.
- TTL expiry per entry.
- Tag-based automatic invalidation.
- Optimistic updates for write latency masking.

Repositories should cache individual entity reads by collection and id, invalidate collection tags on writes, and use optimistic updates only for user-initiated mutations that can be reconciled by the active provider.

## Offline synchronization

Offline writes integrate with the existing Offline Engine in `src/services/sync`:

- Repositories queue create, update, and delete operations when offline support is enabled and the browser is disconnected.
- The Offline Engine stores pending writes durably.
- Sync replay occurs on reconnect through the engine's `sync()` boundary.
- Conflict resolution hooks use `resolveConflict()` with client-wins, server-wins, or manual-review strategies.

Provider implementations should mark remote version metadata on writes so future conflict resolvers can compare local and remote changes deterministically.

## Health monitoring

`/dev/database` exposes the database health monitor. It displays:

- Active provider.
- Connection state.
- Latency.
- Pending sync count.
- Provider status.
- Last checked timestamp.

This route is a developer console only and does not redesign user-facing UI.

## Migration strategy

Schema changes should be implemented as ordered `DatabaseMigration` objects:

1. Additive schema migrations first.
2. Backfill data through seeders or one-time migration statements.
3. Deploy repository code that can read both old and new shapes when necessary.
4. Remove deprecated fields only after all production clients have migrated.
5. Record migration checksums in the configured migrations table.

Every provider implementation must either support migrations natively or document how migrations are applied outside the application runtime.
