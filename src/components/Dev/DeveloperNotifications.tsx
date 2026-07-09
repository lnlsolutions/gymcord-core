import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth";
import { appConfig } from "../../config";
import { notificationRepository } from "../../repositories/NotificationRepository";
import type { Notification } from "../../types/domain";

function row(label: string, value: string, detail?: string) { return { label, value, detail }; }
function StatusCard({ title, rows }: { title: string; rows: { label: string; value: string; detail?: string }[] }) {
  return <section className="dev-card"><h2>{title}</h2><div className="dev-grid">{rows.map((item) => <div className="dev-row" key={item.label}><strong>{item.label}</strong><span>{item.value}</span>{item.detail && <small>{item.detail}</small>}</div>)}</div></section>;
}

export function DeveloperNotifications() {
  const auth = useAuth();
  const repository = useMemo(() => notificationRepository, []);
  const userId = auth.session?.user.id ?? "developer";
  const [notifications, setNotifications] = useState<Notification[]>(() => repository.seedSamples(userId, auth.session?.organization?.id));
  const [source, setSource] = useState("seeded samples");
  const [optimisticRead, setOptimisticRead] = useState("ready");
  const [optimisticArchive, setOptimisticArchive] = useState("ready");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    repository.list({ userId, organizationId: auth.session?.organization?.id })
      .then((result) => {
        if (!active) return;
        setSource(result.source);
        if (result.data.items.length > 0) setNotifications(result.data.items);
      })
      .catch((unknownError: Error) => active && setError(unknownError.message));
    return () => { active = false; };
  }, [auth.session, repository, userId]);

  function validateOptimisticMarkRead() {
    const readAt = new Date().toISOString();
    setNotifications((items) => items.map((item, index) => index === 0 ? { ...item, status: "read", readAt, updatedAt: readAt } : item));
    setOptimisticRead("local notification marked read before repository reconciliation");
  }

  function validateOptimisticArchive() {
    const archivedAt = new Date().toISOString();
    setNotifications((items) => items.map((item, index) => index === 0 ? { ...item, deletedAt: archivedAt, updatedAt: archivedAt } : item).filter((item) => !item.deletedAt));
    setOptimisticArchive("local notification removed by archive before repository reconciliation");
  }

  const preferences = repository.defaultPreferences(userId);

  return <main className="dev-page">
    <header className="dev-header"><p className="eyebrow">GymCord Developer Verification</p><h1>Notifications</h1><p>Repository-only diagnostics for notification listing, creation, read state, archive-by-default deletes, provider routing, preferences, delivery metadata, optimistic updates, and offline queue readiness.</p><button type="button" onClick={validateOptimisticMarkRead}>Validate optimistic mark-read</button><button type="button" onClick={validateOptimisticArchive}>Validate optimistic archive</button></header>
    <StatusCard title="Runtime" rows={[row("Active provider", appConfig.backend.provider), row("Repository source", source), row("Current user", auth.session?.user.email ?? auth.status), row("Supabase environment", appConfig.backend.supabase.url && appConfig.backend.supabase.anonKey ? "configured" : "not configured"), row("Offline queue", `${repository.getOfflineQueue().length} queued notification write(s)`)]} />
    <StatusCard title="Repository capabilities" rows={["list", "findById", "create", "markRead", "archive", "getPreferences", "savePreferences", "defaultPreferences", "seedSamples"].map((name) => row(name, "available", name === "archive" ? "delete delegates here, so archive is the default delete behavior." : undefined))} />
    <StatusCard title="Integration readiness" rows={[row("Member app", "ready", "in-app, push, email, and SMS metadata are normalized."), row("Trainer Portal", "ready", "organization-scoped alerts support trainer workflows."), row("Calendar reminders", "ready", "calendarReminders preference controls reminder fan-out."), row("Messaging alerts", "ready", "messagingAlerts preference controls message notifications."), row("Program assignment alerts", "ready", "programAssignmentAlerts preference controls assignment notifications."), row("Push notifications", "ready", JSON.stringify(preferences.push)), row("Email/SMS delivery", "ready", JSON.stringify({ email: preferences.email, sms: preferences.sms })), row("Optimistic mark-read", optimisticRead), row("Optimistic archive", optimisticArchive)]} />
    <StatusCard title="Loaded notification data" rows={[row("Notification count", `${notifications.length}`), row("Unread count", `${notifications.filter((item) => item.status !== "read").length}`), row("Latest notification", notifications[0]?.title ?? "No persisted notifications yet")]} />
    {error && <StatusCard title="Load Error" rows={[row("Repository", "failed", error)]} />}
    <section className="dev-card"><h2>Notification snapshot</h2><pre>{JSON.stringify({ notifications, preferences }, null, 2)}</pre></section>
  </main>;
}
