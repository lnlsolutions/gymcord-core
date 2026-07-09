import { useEffect, useMemo, useState } from "react";
import { appConfig } from "../../config";
import { messagingRepository } from "../../repositories/MessagingRepository";
import type { Message, MessageAttachment, MessageConversation } from "../../types/domain";
import { AnnouncementComposer } from "./AnnouncementComposer";
import { AttachmentPanel } from "./AttachmentPanel";
import { ConversationList } from "./ConversationList";
import { MessageSearch } from "./MessageSearch";
import { MessageThread } from "./MessageThread";
import { ModerationPanel } from "./ModerationPanel";

export function MessagingCenter({ developer = false, currentUserId = "trainer_demo", organizationId = "org_demo" }: { developer?: boolean; currentUserId?: string; organizationId?: string }) {
  const [conversations, setConversations] = useState<MessageConversation[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("loading");
  const [saveStatus, setSaveStatus] = useState("ready");
  const selected = conversations.find((c) => c.id === selectedId);
  const attachments = useMemo(() => messages.flatMap((m) => m.attachments ?? []) as MessageAttachment[], [messages]);

  useEffect(() => { messagingRepository.listConversations({ organizationId, userId: currentUserId }).then((r) => { setConversations(r.data.items); setSelectedId((id) => id ?? r.data.items[0]?.id); setSource(r.source); }); }, [currentUserId, organizationId]);
  useEffect(() => { if (!selectedId) return; messagingRepository.listMessages(selectedId).then((r) => { setMessages(r.data.items); setSource(r.source); void messagingRepository.markRead(selectedId, currentUserId).then((updated) => setConversations((items) => items.map((item) => item.id === selectedId ? updated.data : item))); }); }, [currentUserId, selectedId]);
  useEffect(() => { if (!query.trim()) { if (selectedId) void messagingRepository.listMessages(selectedId).then((r) => setMessages(r.data.items)); return; } void messagingRepository.searchMessages(query, { conversationId: selectedId }).then((r) => setMessages(r.data.items)); }, [query, selectedId]);

  function send(body: string, kind: Message["kind"] = selected?.type === "team_announcement" ? "announcement" : selected?.type === "system" ? "system" : "direct") {
    if (!selectedId) return;
    const optimistic: Message = { id: `optimistic-${Date.now()}`, organizationId, conversationId: selectedId, senderUserId: currentUserId, recipientUserIds: selected?.participantUserIds.filter((id) => id !== currentUserId) ?? [], body, kind, status: "queued", attachments: [], moderation: { status: "clear", flags: [], reviewedBy: "automated", reviewedAt: new Date().toISOString() }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    setMessages((items) => [...items, optimistic]); setSaveStatus("optimistic send pending");
    void messagingRepository.sendMessage({ ...optimistic, conversationId: selectedId }).then((result) => { setMessages((items) => items.map((item) => item.id === optimistic.id ? result.data : item)); setSaveStatus("saved"); });
  }

  function edit(id: string, body: string) { setMessages((items) => items.map((m) => m.id === id ? { ...m, body, editedAt: new Date().toISOString(), updatedAt: new Date().toISOString() } : m)); setSaveStatus("optimistic edit pending"); void messagingRepository.editMessage(id, { body }).then(() => setSaveStatus("saved")); }
  function archive(id: string) { setConversations((items) => items.filter((c) => c.id !== id)); setSaveStatus("archive pending"); void messagingRepository.archiveConversation(id, currentUserId).then(() => setSaveStatus("archived")); }

  return <main className={developer ? "dev-page" : "page"}><header className="dev-header"><p className="eyebrow">Messaging V1</p><h1>Messaging Center</h1><p>Repository-backed direct messages, team announcements, system threads, attachments, moderation, offline queue, and realtime-ready topics.</p></header><MessageSearch query={query} onChange={setQuery} /><div className="messaging-grid"><ConversationList conversations={conversations} selectedId={selectedId} currentUserId={currentUserId} onSelect={setSelectedId} onArchive={archive} /><MessageThread conversation={selected} messages={messages} currentUserId={currentUserId} onSend={send} onEdit={edit} /></div><AnnouncementComposer onSend={(body) => send(body, "announcement")} /><AttachmentPanel attachments={attachments} /><ModerationPanel items={messages.map((m) => m.moderation).filter(Boolean) as NonNullable<Message["moderation"]>[]} />{developer && <section className="dev-card"><h2>Developer diagnostics</h2><pre>{JSON.stringify({ activeProvider: appConfig.backend.provider, repositorySource: source, conversationsLoaded: conversations.length, selectedConversation: selected?.id, messagesLoaded: messages.length, readUnreadState: conversations.map((c) => ({ id: c.id, unread: !c.readByUserIds.includes(currentUserId) })), attachmentMetadata: attachments, moderationMetadata: messages.map((m) => m.moderation), pendingSync: saveStatus.includes("pending"), offlineQueue: messagingRepository.getOfflineQueue(), saveStatus }, null, 2)}</pre></section>}</main>;
}
