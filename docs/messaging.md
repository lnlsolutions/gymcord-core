# Messaging V1

Messaging V1 adds repository-owned conversations and messages for trainer/member direct messages, team announcements, and system conversations.

## Repository boundary

UI components under `src/components/messaging/` call `MessagingRepository` only. They do not import `@supabase/supabase-js`, `getSupabaseClient`, or `SupabaseProvider`.

`MessagingRepository` routes persistence through the shared API client paths:

- `/messageConversations` for conversation list, read state, archive state, participant IDs, and realtime topics.
- `/messages` for sent, edited, searched, attachment, and moderation metadata.

Supabase mode maps those paths to `message_conversations` and `messages` through the provider alias map. Mock mode works through `MockBackendProvider`; when no mock data is present, the repository returns demo direct, announcement, and system conversations so `/dev/messaging` stays reviewable.

## Capabilities

- Conversation list with read/unread state.
- Message thread loading by conversation.
- Optimistic sends and optimistic edits.
- Archive instead of hard delete by default.
- Trainer/member direct message metadata with `trainerId` and `memberId`.
- Team announcement metadata with `teamId` and announcement message kind.
- System messages with system sender/kind.
- Attachment metadata: name, MIME type, byte size, storage path or URL, uploader, and timestamp.
- Message search by body and attachment name.
- Basic moderation metadata: status, flags, reviewer, reviewed timestamp, and notes.
- Realtime-ready `realtimeTopic` on every conversation.
- Offline queue support through API client `queueWhenOffline` writes.

## Developer route

Visit `/dev/messaging` to inspect:

- active provider
- repository source
- conversations loaded
- selected conversation
- messages loaded
- read/unread state
- attachment metadata
- moderation metadata
- pending sync
- offline queue
- save status

## Validation commands

```bash
npm ci
npm run build
npm run test
```
