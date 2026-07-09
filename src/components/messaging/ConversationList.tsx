import type { MessageConversation } from "../../types/domain";
import { ConversationCard } from "./ConversationCard";
export function ConversationList({ conversations, selectedId, currentUserId, onSelect, onArchive }: { conversations: MessageConversation[]; selectedId?: string; currentUserId: string; onSelect: (id: string) => void; onArchive: (id: string) => void }) {
  return <section className="panel messaging-list"><h3>Conversations</h3>{conversations.map((conversation) => <ConversationCard key={conversation.id} conversation={conversation} selected={conversation.id === selectedId} unread={!conversation.readByUserIds.includes(currentUserId)} onSelect={() => onSelect(conversation.id)} onArchive={() => onArchive(conversation.id)} />)}</section>;
}
