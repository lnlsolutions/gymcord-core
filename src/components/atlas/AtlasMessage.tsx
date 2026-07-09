import type { AtlasConversationEntry } from "../../types/gymcord";

export function AtlasMessage({ entry }: { entry: AtlasConversationEntry }) {
  return (
    <article className="atlas-message">
      <div className="atlas-message-user">
        <span>You asked</span>
        <p>{entry.question}</p>
      </div>
      <div className="atlas-message-atlas">
        <span>Atlas · {entry.category} · {new Date(entry.timestamp).toLocaleString()}</span>
        <p>{entry.answer}</p>
      </div>
    </article>
  );
}
