import { useEffect, useMemo, useState } from "react";
import { appConfig } from "../../config";
import { calendarRepository, type AvailabilityBlock, type CalendarEvent } from "../../repositories/CalendarRepository";
import { CalendarView } from "./CalendarView";
import { WeeklySchedule } from "./WeeklySchedule";
import { DailyAgenda } from "./DailyAgenda";
import { EventEditor } from "./EventEditor";
import { AvailabilityBlocks } from "./AvailabilityBlocks";
import { ReminderPanel } from "./ReminderPanel";
import { RecurringEventPanel } from "./RecurringEventPanel";
import { ProgramMilestones } from "./ProgramMilestones";

function seedEvents(): CalendarEvent[] {
  const today = new Date(); const iso = (h: number) => { const d = new Date(today); d.setHours(h, 0, 0, 0); return d.toISOString(); };
  const base = { organizationId: "dev-org", trainerId: "trainer-demo", memberId: "member-demo", timezone: "UTC", status: "scheduled" as const, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), reminders: [{ id: "reminder-demo", offsetMinutes: 60, channel: "push" as const, enabled: true }], metadata: { source: "calendar-dev-seed" } };
  return [
    { ...base, id: "workout-demo", type: "workout", title: "Lower Body Strength", startsAt: iso(9), endsAt: iso(10), workoutId: "workout-lower" },
    { ...base, id: "checkin-demo", type: "check_in", title: "Weekly Check-in", startsAt: iso(12), endsAt: iso(12), metadata: { questionnaireId: "checkin-weekly" } },
    { ...base, id: "milestone-demo", type: "program_milestone", title: "Program Phase 2 Starts", startsAt: iso(15), endsAt: iso(15), programId: "program-demo", recurrence: { frequency: "weekly", interval: 1, timezone: "UTC" } },
  ];
}

export function CalendarScheduler({ developer = false }: { developer?: boolean }) {
  const [events, setEvents] = useState<CalendarEvent[]>(seedEvents());
  const [availability, setAvailability] = useState<AvailabilityBlock[]>([]);
  const [selected, setSelected] = useState<CalendarEvent | undefined>(events[0]);
  const [source, setSource] = useState("mock-seed");
  const [saveStatus, setSaveStatus] = useState("idle");

  useEffect(() => { let active = true; calendarRepository.list().then((result)=>{ if (!active) return; if (result.data.items.length) { setEvents(result.data.items); setSelected(result.data.items[0]); } setSource(result.source); }); calendarRepository.listAvailability().then((result)=> active && setAvailability(result.data.items)); return () => { active = false; }; }, []);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const queue = calendarRepository.getOfflineQueue();

  async function saveEvent(input: Partial<CalendarEvent> & Pick<CalendarEvent, "title" | "type" | "startsAt" | "endsAt" | "timezone">) {
    setSaveStatus("saving optimistically");
    if (selected) { const optimistic = { ...selected, ...input, updatedAt: new Date().toISOString() }; setEvents(events.map((event)=>event.id === selected.id ? optimistic : event)); setSelected(optimistic); await calendarRepository.update(selected.id, input); }
    else { const result = await calendarRepository.create(input); setEvents([result.data, ...events]); setSelected(result.data); }
    setSaveStatus("saved");
  }

  async function cancelEvent(event: CalendarEvent) { setEvents(events.map((item)=>item.id === event.id ? { ...item, status: "cancelled" } : item)); setSaveStatus("cancel queued"); await calendarRepository.cancel(event.id); setSaveStatus("cancelled"); }
  async function archiveEvent(event: CalendarEvent) { setEvents(events.filter((item)=>item.id !== event.id)); setSaveStatus("archive queued"); await calendarRepository.archive(event.id); setSelected(undefined); setSaveStatus("archived"); }

  return <main className={developer ? "dev-page" : "page calendar-scheduler"}><header className="dev-header"><p className="eyebrow">Calendar & Scheduling V1</p><h1>Calendar Scheduler</h1><p>Repository-backed scheduling for trainers, members, workouts, check-ins, appointments, availability, recurring metadata, reminders, and program milestones.</p></header>{developer && <section className="dev-card"><h2>Developer diagnostics</h2><div className="dev-grid"><div className="dev-row"><strong>Active provider</strong><span>{appConfig.backend.provider}</span></div><div className="dev-row"><strong>Events loaded</strong><span>{events.length}</span></div><div className="dev-row"><strong>Selected event</strong><span>{selected?.title ?? "none"}</span></div><div className="dev-row"><strong>Pending sync</strong><span>{queue.filter((item)=>item.status !== "synced").length}</span></div><div className="dev-row"><strong>Offline queue</strong><span>{queue.length}</span></div><div className="dev-row"><strong>Save status</strong><span>{saveStatus}</span></div></div></section>}<CalendarView events={events} selectedEventId={selected?.id} onSelect={setSelected} /><div className="calendar-grid"><WeeklySchedule events={events} onSelect={setSelected} /><DailyAgenda date={today} events={events} onSelect={setSelected} /><EventEditor event={selected} onSave={saveEvent} onCancelEvent={cancelEvent} onArchive={archiveEvent} /><AvailabilityBlocks blocks={availability} /><ReminderPanel reminders={selected?.reminders ?? []} /><RecurringEventPanel recurrence={selected?.recurrence} /><ProgramMilestones events={events} /></div></main>;
}
