import type { CalendarEvent } from "../../repositories/CalendarRepository";
import { EventCard } from "./EventCard";
export function DailyAgenda({ date, events, onSelect }: { date: string; events: CalendarEvent[]; onSelect: (event: CalendarEvent) => void }) {
  const agenda = events.filter((event) => event.startsAt.slice(0, 10) === date);
  return <section className="calendar-panel"><h2>Daily agenda</h2><p>{date}</p>{agenda.length ? agenda.map((event)=><EventCard key={event.id} event={event} onSelect={onSelect} />) : <small>No events scheduled.</small>}</section>;
}
