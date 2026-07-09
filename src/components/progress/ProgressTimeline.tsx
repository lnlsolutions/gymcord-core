import type { ProgressTimelineItem } from "../../repositories/ProgressRepository";
export function ProgressTimeline({ items }: { items: ProgressTimelineItem[] }) {
  return <div className="panel"><p className="eyebrow">Timeline</p><h3>Progress timeline</h3><div className="timeline-list">{items.map((item) => <div className="timeline-item" key={item.id}><strong>{item.title}</strong><span>{item.date} • {item.detail} • Score {item.score}</span></div>)}</div></div>;
}
