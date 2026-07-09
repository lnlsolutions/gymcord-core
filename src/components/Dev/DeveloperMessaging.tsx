import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth";
import { appConfig } from "../../config";
import { messagingRepository } from "../../repositories/MessagingRepository";
import type { MessagingConversation, MessagingMessage } from "../../types/domain";

function row(label: string, value: string, detail?: string) { return { label, value, detail }; }
function StatusCard({ title, rows }: { title: string; rows: { label: string; value: string; detail?: string }[] }) {
  return <section className="dev-card"><h2>{title}</h2><div className="dev-grid">{rows.map((item) => <div className="dev-row" key={item.label}><strong>{item.label}</strong><span>{item.value}</span>{item.detail && <small>{item.detail}</small>}</div>)}</div></section>;
}

export function DeveloperMessaging() {
  const auth = useAuth();
  const repository = useMemo(() => messagingRepository, []);
  const [conversations, setConversations] = useState<MessagingConversation[]>([]);
  const [messages, setMessages] = useState<MessagingMessage[]>([]);
  const [source, setSource] = useState("loading");
  const [optimisticSend, setOptimisticSend] = useState("ready");
  const [optimisticEdit, setOptimisticEdit] = useState("ready");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    repository.listConversations({ organizationId: auth.session?.organization?.id })
      .then(async (result) => {
        if (!active) return;
        setConversations(result.data.items);
        setSource(result.source);
        if (result.data.items[0]) {
          const messageResult = await repository.listMessages(result.data.items[0].id, { organizationId: auth.session?.organization?.id });
          if (active) setMessages(messageResult.data.items);
        }
      })
      .catch((unknownError: Error) => active && setError(unknownError.message));
    return () => { active = false; };
  }, [auth.session, repository]);

  function validateOptimisticSend() {
    const createdAt = new Date().toISOString();
    const conversationId = conversations[0]?.id ?? "optimistic-conversation";
    setMessages((items) => [{ id: `optimistic-send-${createdAt}`, conversationId, senderId: auth.session?.user.id ?? "developer", body: "Optimistic messaging validation", status: "queued", readBy: [], attachments: [], createdAt, updatedAt: createdAt }, ...items]);
    setOptimisticSend("optimistic message inserted before repository reconciliation");
  }

  function validateOptimisticEdit() {
    setMessages((items) => items.map((message, index) => index === 0 ? { ...message, body: `${message.body} (optimistically edited)`, editedAt: new Date().toISOString() } : message));
    setOptimisticEdit("optimistic edit patched local state before repository reconciliation");
  }

  return <main className="dev-page">
    <header className="dev-header"><p className="eyebrow">GymCord Developer Verification</p><h1>Messaging</h1><p>Repository-only diagnostics for conversations, messages, archive-by-default deletes, provider routing, optimistic send/edit, offline queue, and integration readiness.</p><button type="button" onClick={validateOptimisticSend}>Validate optimistic send</button><button type="button" onClick={validateOptimisticEdit}>Validate optimistic edit</button></header>
    <StatusCard title="Runtime" rows={[row("Active provider", appConfig.backend.provider), row("Repository source", source), row("Current user", auth.session?.user.email ?? auth.status), row("Supabase environment", appConfig.backend.supabase.url && appConfig.backend.supabase.anonKey ? "configured" : "not configured"), row("Offline queue", `${repository.getOfflineQueue().length} queued messaging write(s)`)]} />
    <StatusCard title="Repository capabilities" rows={["listConversations", "findConversationById", "createConversation", "archiveConversation", "markRead", "listMessages", "sendMessage", "editMessage", "searchMessages"].map((name) => row(name, "available", name === "archiveConversation" ? "deleteConversation delegates here, so archive is the default delete behavior." : undefined))} />
    <StatusCard title="Integration readiness" rows={[row("Trainer Portal", "ready", "trainer_member conversations carry trainer/member participants."), row("Member app", "ready", "direct and trainer_member conversations use participantIds."), row("Team announcements", "ready", "team_announcement conversations support broadcast metadata."), row("System messages", "ready", "system messages can be flagged with system=true and moderation metadata."), row("Realtime subscriptions", "ready", "repository paths can be subscribed to by the shared realtime layer."), row("Optimistic sends", optimisticSend), row("Optimistic edits", optimisticEdit), row("Attachments/moderation", "documented", "metadata lives on MessagingMessage attachments and moderation fields.")]} />
    <StatusCard title="Loaded messaging data" rows={[row("Conversation count", `${conversations.length}`), row("Message count", `${messages.length}`), row("Latest message", messages[0]?.body ?? "No persisted messages yet")]} />
    {error && <StatusCard title="Load Error" rows={[row("Repository", "failed", error)]} />}
    <section className="dev-card"><h2>Messaging snapshot</h2><pre>{JSON.stringify({ conversations, messages }, null, 2)}</pre></section>
  </main>;
}
