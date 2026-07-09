import type { MessageModerationMetadata } from "../../types/domain";
export function ModerationPanel({ items }: { items: MessageModerationMetadata[] }) { return <section className="panel"><h3>Moderation metadata</h3>{items.map((m, i) => <p key={`${m.status}-${i}`}>{m.status} · flags: {m.flags.join(", ") || "none"} · reviewer: {m.reviewedBy ?? "unreviewed"}</p>)}</section>; }
