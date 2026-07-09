import type { MessageConversation } from "../../types/domain";
export function ConversationCard({ conversation, selected, unread, onSelect, onArchive }: { conversation: MessageConversation; selected: boolean; unread: boolean; onSelect: () => void; onArchive: () => void }) {
  return <article className={`message-card ${selected ? "selected" : ""}`}><button type="button" onClick={onSelect}><strong>{conversation.title}</strong><span>{conversation.type.replace("_", " ")}</span><p>{conversation.lastMessagePreview ?? "No messages yet"}</p>{unread && <em>Unread</em>}</button><button type="button" className="ghost-button" onClick={onArchive}>Archive</button></article>;
}
