import type { CalendarEvent } from "../../repositories/CalendarRepository";

export function EventCard({ event, selected, onSelect }: { event: CalendarEvent; selected?: boolean; onSelect?: (event: CalendarEvent) => void }) {
  const start = new Date(event.startsAt);
  const end = new Date(event.endsAt);
  return (
    <button className={`calendar-event-card ${selected ? "selected" : ""}`} onClick={() => onSelect?.(event)} type="button">
      <span className="pill">{event.type.replace("_", " ")}</span>
      <strong>{event.title}</strong>
      <small>{start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}–{end.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</small>
      <small>{event.status} · {event.reminders.length} reminder(s){event.recurrence ? " · recurring" : ""}</small>
    </button>
  );
}
