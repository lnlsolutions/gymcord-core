import type { AvailabilityBlock } from "../../repositories/CalendarRepository";
export function AvailabilityBlocks({ blocks }: { blocks: AvailabilityBlock[] }) {
  return <section className="calendar-panel"><h2>Availability blocks</h2>{blocks.map((block)=><div className="calendar-row" key={block.id}><strong>{block.title}</strong><span>{new Date(block.startsAt).toLocaleString()} · capacity {block.capacity} · {block.status}</span></div>)}</section>;
}
