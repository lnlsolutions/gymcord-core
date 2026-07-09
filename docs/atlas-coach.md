# Atlas Coach V1

Atlas Coach V1 is the first production-ready coaching surface for GymCord. It combines the existing program, mission, transformation, memory, and conversation engines with repository-backed persistence.

## Experience

The coach tab now renders `src/components/atlas/AtlasCoach.tsx` and includes:

- Atlas chat with conversation history.
- Daily coaching prompt cards.
- Workout suggestions based on the selected daily workout.
- Nutrition suggestions based on logged protein and water.
- Progress insights from the Atlas engine.
- Goal reminders from the member profile.
- Habit nudges from incomplete mission tasks.
- Atlas memory summaries for goals, injuries, favorites, workout history, nutrition, recovery, and PRs.
- A safety disclaimer that Atlas is fitness and nutrition education only and not medical advice.

## Repository flow

All Atlas reads and writes go through `AtlasCoachRepository`.

- Conversation reads use `loadConversation(session)`.
- Conversation saves use `rememberConversation(session, entry)`.
- Memory reads use `loadMemory(session, fallbackMemory)`.
- Memory saves use `saveMemory(session, memory)`.
- The repository writes local storage for mock/offline resilience and uses provider paths for backend persistence.

No Atlas UI component imports Supabase. Supabase access stays inside the provider layer and is addressed through `/atlasConversations` and `/atlasMemory` provider paths.

## Mock mode

Mock mode uses the standard `MockBackendProvider` collections and local storage fallback. This lets the chat, memory state, save status, and developer diagnostics work without external services.

## Supabase mode

Supabase mode uses `SupabaseProvider` path aliases only:

- `/atlasConversations` -> `atlas_conversations`
- `/atlasMemory` -> `atlas_memory`

The UI never imports Supabase clients or table names directly.

## Developer page

Visit `/dev/atlas` to inspect:

- Active provider.
- Conversation history.
- Memory state.
- Latest insight.
- Save status.
- Offline queue.

## Safety

Atlas recommendations are non-medical fitness and nutrition education. Users should consult qualified clinicians for injuries, pain, medical conditions, or treatment decisions.
