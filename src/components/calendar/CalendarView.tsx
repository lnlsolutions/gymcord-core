import type { CalendarEvent } from "../../repositories/CalendarRepository";
import { EventCard } from "./EventCard";

export function CalendarView({ events, selectedEventId, onSelect }: { events: CalendarEvent[]; selectedEventId?: string; onSelect: (event: CalendarEvent) => void }) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(); day.setDate(day.getDate() + index); return day;
  });
  return <section className="calendar-panel"><h2>Calendar view</h2><div className="calendar-days">{days.map((day) => {
    const key = day.toISOString().slice(0, 10);
    const dayEvents = events.filter((event) => event.startsAt.slice(0, 10) === key);
    return <div className="calendar-day" key={key}><strong>{day.toLocaleDateString([], { weekday: "short" })}</strong><small>{key}</small>{dayEvents.map((event) => <EventCard key={event.id} event={event} selected={event.id === selectedEventId} onSelect={onSelect} />)}</div>;
  })}</div></section>;
}
