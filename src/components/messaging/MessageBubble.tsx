import type { Message } from "../../types/domain";
export function MessageBubble({ message, currentUserId, onEdit }: { message: Message; currentUserId: string; onEdit: (id: string, body: string) => void }) {
  const own = message.senderUserId === currentUserId;
  return <article className={`message-bubble ${own ? "own" : ""}`}><p>{message.body}</p><small>{message.kind ?? "direct"} · {message.status}{message.editedAt ? " · edited" : ""}</small>{message.attachments?.map((a) => <span key={a.id} className="pill">{a.name} · {Math.round(a.sizeBytes / 1024)}kb</span>)}{own && <button type="button" className="ghost-button" onClick={() => onEdit(message.id, `${message.body} (edited)`)}>Edit</button>}</article>;
}
