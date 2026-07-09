import { useState } from "react";
import type { CalendarEvent, CalendarEventType } from "../../repositories/CalendarRepository";

const types: CalendarEventType[] = ["workout", "check_in", "appointment", "program_milestone", "availability", "custom"];

export function EventEditor({ event, onSave, onCancelEvent, onArchive }: { event?: CalendarEvent; onSave: (input: Partial<CalendarEvent> & Pick<CalendarEvent, "title" | "type" | "startsAt" | "endsAt" | "timezone">) => void; onCancelEvent?: (event: CalendarEvent) => void; onArchive?: (event: CalendarEvent) => void }) {
  const [title, setTitle] = useState(event?.title ?? "Trainer/member appointment");
  const [type, setType] = useState<CalendarEventType>(event?.type ?? "appointment");
  const [startsAt, setStartsAt] = useState((event?.startsAt ?? new Date().toISOString()).slice(0, 16));
  const [endsAt, setEndsAt] = useState((event?.endsAt ?? new Date(Date.now() + 3_600_000).toISOString()).slice(0, 16));
  return <section className="calendar-panel"><h2>{event ? "Edit event" : "Create event"}</h2><label>Title<input value={title} onChange={(e)=>setTitle(e.target.value)} /></label><label>Type<select value={type} onChange={(e)=>setType(e.target.value as CalendarEventType)}>{types.map((item)=><option key={item} value={item}>{item}</option>)}</select></label><label>Starts<input type="datetime-local" value={startsAt} onChange={(e)=>setStartsAt(e.target.value)} /></label><label>Ends<input type="datetime-local" value={endsAt} onChange={(e)=>setEndsAt(e.target.value)} /></label><button className="primary-button" type="button" onClick={()=>onSave({ title, type, startsAt: new Date(startsAt).toISOString(), endsAt: new Date(endsAt).toISOString(), timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, reminders: event?.reminders ?? [{ id: crypto.randomUUID(), channel: "push", offsetMinutes: 60, enabled: true }], metadata: event?.metadata ?? { integrationReady: ["program-builder", "trainer-portal"] } })}>Save event</button>{event && <div className="calendar-actions"><button type="button" onClick={()=>onCancelEvent?.(event)}>Cancel</button><button type="button" onClick={()=>onArchive?.(event)}>Archive</button></div>}</section>;
}
