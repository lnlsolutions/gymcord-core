import type { CalendarEvent } from "../../repositories/CalendarRepository";
import { EventCard } from "./EventCard";
export function WeeklySchedule({ events, onSelect }: { events: CalendarEvent[]; onSelect: (event: CalendarEvent) => void }) {
  return <section className="calendar-panel"><h2>Weekly schedule</h2>{events.slice().sort((a,b)=>a.startsAt.localeCompare(b.startsAt)).map((event)=><EventCard key={event.id} event={event} onSelect={onSelect} />)}</section>;
}
