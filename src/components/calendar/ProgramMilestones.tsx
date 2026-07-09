import type { CalendarEvent } from "../../repositories/CalendarRepository";
export function ProgramMilestones({ events }: { events: CalendarEvent[] }) {
  const milestones = events.filter((event) => event.type === "program_milestone");
  return <section className="calendar-panel"><h2>Program milestone dates</h2>{milestones.map((event)=><div className="calendar-row" key={event.id}><strong>{event.title}</strong><span>{event.startsAt.slice(0, 10)} · program {event.programId ?? "unassigned"}</span></div>)}</section>;
}
