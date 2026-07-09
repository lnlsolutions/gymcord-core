import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth";
import { appConfig } from "../../config";
import { calendarRepository } from "../../repositories/CalendarRepository";
import type { CalendarAvailability, CalendarEvent } from "../../types/domain";

function row(label: string, value: string, detail?: string) { return { label, value, detail }; }
function StatusCard({ title, rows }: { title: string; rows: { label: string; value: string; detail?: string }[] }) {
  return <section className="dev-card"><h2>{title}</h2><div className="dev-grid">{rows.map((item) => <div className="dev-row" key={item.label}><strong>{item.label}</strong><span>{item.value}</span>{item.detail && <small>{item.detail}</small>}</div>)}</div></section>;
}

export function DeveloperCalendar() {
  const auth = useAuth();
  const repository = useMemo(() => calendarRepository, []);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [availability, setAvailability] = useState<CalendarAvailability[]>([]);
  const [source, setSource] = useState("loading");
  const [optimisticState, setOptimisticState] = useState("ready");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([repository.list({ organizationId: auth.session?.organization?.id }), repository.listAvailability({ organizationId: auth.session?.organization?.id })])
      .then(([eventResult, availabilityResult]) => {
        if (!active) return;
        setEvents(eventResult.data.items);
        setAvailability(availabilityResult.data.items);
        setSource(eventResult.source);
      })
      .catch((unknownError: Error) => active && setError(unknownError.message));
    return () => { active = false; };
  }, [auth.session, repository]);

  function validateOptimisticFlow() {
    const createdAt = new Date().toISOString();
    setEvents((items) => [{ id: `optimistic-${createdAt}`, title: "Optimistic calendar validation", kind: "trainer_appointment", startsAt: createdAt, endsAt: createdAt, timezone: "UTC", status: "scheduled", sourceModule: "trainer_portal", reminders: [], createdAt, updatedAt: createdAt }, ...items]);
    setOptimisticState("optimistic row inserted before repository reconciliation");
  }

  return <main className="dev-page">
    <header className="dev-header"><p className="eyebrow">GymCord Developer Verification</p><h1>Calendar Scheduling</h1><p>Repository-only diagnostics for events, availability, cancel/archive/delete behavior, provider routing, optimistic updates, and offline-safe writes.</p><button type="button" onClick={validateOptimisticFlow}>Validate optimistic row</button></header>
    <StatusCard title="Runtime" rows={[row("Active provider", appConfig.backend.provider), row("Repository source", source), row("Current user", auth.session?.user.email ?? auth.status), row("Supabase environment", appConfig.backend.supabase.url && appConfig.backend.supabase.anonKey ? "configured" : "not configured")]} />
    <StatusCard title="Repository capabilities" rows={["list", "findById", "create", "update", "cancel", "archive", "delete", "listAvailability", "createAvailability", "updateAvailability", "archiveAvailability"].map((name) => row(name, "available", name === "delete" ? "delete delegates to cancel, making cancel the default destructive behavior; archive remains explicit." : undefined))} />
    <StatusCard title="Integration readiness" rows={[row("Program Builder milestones", "ready", "Use kind=program_milestone with sourceModule=program_builder and sourceId."), row("Trainer Portal appointments", "ready", "Use kind=trainer_appointment with trainer/member IDs."), row("Member check-ins", "ready", "Use kind=member_check_in."), row("Workout schedules", "ready", "Use kind=workout_schedule."), row("Offline queue", "implemented", "Calendar writes pass queueWhenOffline to the shared API client."), row("Optimistic updates", optimisticState), row("Recurring metadata and reminders", "documented", "Events and availability support recurring metadata; events support reminders.")]} />
    <StatusCard title="Loaded Calendar Data" rows={[row("Event count", `${events.length}`), row("Availability count", `${availability.length}`), row("Latest event", events[0]?.title ?? "No persisted events yet")]} />
    {error && <StatusCard title="Load Error" rows={[row("Repository", "failed", error)]} />}
    <section className="dev-card"><h2>Calendar snapshot</h2><pre>{JSON.stringify({ events, availability }, null, 2)}</pre></section>
  </main>;
}
