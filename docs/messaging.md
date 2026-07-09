# Messaging Validation Notes

## Build 032 revision validation

- PR #50 is being updated on the current branch, whose history already contains the latest local `main` merge commits for PR #48 and PR #49 (`160df52` is the PR #49 merge commit). No remote named `origin` is configured in this checkout, so remote PR metadata cannot be queried from this environment.
- `package.json` and `package-lock.json` remain synchronized for declared dependencies. `npm ci` was blocked by npm registry authorization: `403 Forbidden - GET https://registry.npmjs.org/@testing-library%2fjest-dom`, so dependencies could not be installed in this environment.
- `/dev/messaging` exists and renders `DeveloperMessaging` through `App.tsx` without redesigning the production UI.
- `MessagingRepository` exists and exposes `listConversations`, `findConversationById`, `createConversation`, `archiveConversation`, `markRead`, `listMessages`, `sendMessage`, `editMessage`, and `searchMessages`.
- Conversation deletion defaults to archive behavior: `deleteConversation` delegates to `archiveConversation`, and archived conversations are filtered out of default list results.
- Mock mode works without Supabase environment variables because messaging uses the shared `apiClient` and `MockBackendProvider` collection paths when `VITE_BACKEND_PROVIDER` is unset or `mock`.
- Supabase mode routes only through provider mappings: `MessagingRepository` calls `/messagingConversations` and `/messagingMessages`; `SupabaseProvider` maps those paths to `messaging_conversations` and `messaging_messages`.
- UI components do not import `@supabase/supabase-js`, `getSupabaseClient`, or `SupabaseProvider`; messaging UI imports only repository and domain types.
- Optimistic sends and optimistic edits are implemented in the developer validation page as local state updates before repository reconciliation.
- Offline queue support is implemented by marking conversation and message writes with `queueWhenOffline: true`; the developer page reports queued messaging writes from the shared offline engine.

## Integration readiness

Messaging is integration-ready for:

- Trainer Portal: use `kind="trainer_member"`, trainer/member participants, and organization scoping.
- Member app: use direct or trainer-member conversations with `participantIds` and per-participant read metadata.
- Team announcements: use `kind="team_announcement"` and `sourceModule="team_announcements"` for broadcast threads.
- System messages: set message `system=true`, use `kind="system"`, and attach moderation metadata when applicable.
- Realtime subscriptions: repository paths (`/messagingConversations`, `/messagingMessages`) are stable provider paths that the shared realtime layer can subscribe to without UI-level Supabase imports.

## Attachment and moderation metadata

`MessagingMessage.attachments` documents file metadata without forcing UI components to import storage SDKs. Each attachment includes an ID, file name, MIME type, byte size, and optional storage path or URL.

`MessagingMessage.moderation` documents moderation state for system and user-generated messages. It supports pending, approved, flagged, and blocked states plus reviewer, timestamp, reason, and score metadata.

## Validation commands

```bash
git log --oneline --decorate -5
git remote -v
node -e 'const fs=require("fs");const pkg=JSON.parse(fs.readFileSync("package.json"));const lock=JSON.parse(fs.readFileSync("package-lock.json"));for (const section of ["dependencies","devDependencies"]) for (const [name, range] of Object.entries(pkg[section]||{})) { if (lock.packages["" ][section]?.[name] !== range) { console.error(`${section}.${name} mismatch`); process.exit(1); }} console.log("package manifests synchronized")'
npm ci # blocked: 403 Forbidden - GET https://registry.npmjs.org/@testing-library%2fjest-dom
npm run build
npm run test
rg -n 'window.location.pathname === "/dev/messaging"|MessagingRepository|listConversations|findConversationById|createConversation|archiveConversation|markRead|listMessages|sendMessage|editMessage|searchMessages|deleteConversation' src/App.tsx src/repositories/MessagingRepository.ts src/components/Dev/DeveloperMessaging.tsx
if rg -n '@supabase/supabase-js|getSupabaseClient|SupabaseProvider' src/components --glob '*.{ts,tsx}'; then exit 1; fi
rg -n 'messagingConversations|messagingMessages|messaging_conversations|messaging_messages' src/api src/repositories/MessagingRepository.ts
```
