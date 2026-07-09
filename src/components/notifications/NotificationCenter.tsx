import { useEffect, useMemo, useState } from "react";
import { notificationRepository, type NotificationFilters as Filters } from "../../repositories/NotificationRepository";
import type { AppNotification, EntityId, NotificationPreference } from "../../types/domain";
import { NotificationDetail } from "./NotificationDetail";
import { NotificationFilters } from "./NotificationFilters";
import { NotificationList } from "./NotificationList";
import { NotificationPreferences } from "./NotificationPreferences";
import { PushMetadataPanel } from "./PushMetadataPanel";
import { ReminderSettings } from "./ReminderSettings";
import { SystemAlerts } from "./SystemAlerts";

export function NotificationCenter({ userId, organizationId, onStatusChange }: { userId: EntityId; organizationId?: EntityId; onStatusChange?: (status: string) => void; }) {
  const repository = useMemo(() => notificationRepository, []);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [selected, setSelected] = useState<AppNotification | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreference>(() => repository.defaultPreferences(userId, organizationId));
  const [filters, setFilters] = useState<Filters>({ status: "active", channel: "all" });
  const [source, setSource] = useState("loading");
  const [saveStatus, setSaveStatus] = useState("ready");

  useEffect(() => {
    let active = true;
    Promise.all([repository.list({ organizationId, filters }), repository.getPreferences(userId, organizationId)]).then(([list, prefs]) => {
      if (!active) return;
      const items = list.data.items.length ? list.data.items : repository.seedSamples(userId, organizationId);
      setNotifications(items); setSelected(items[0] ?? null); setPreferences(prefs.data); setSource(list.source); onStatusChange?.(`loaded ${items.length} notification(s) from ${list.source}`);
    }).catch((error: Error) => { setSaveStatus(error.message); onStatusChange?.(error.message); });
    return () => { active = false; };
  }, [filters, onStatusChange, organizationId, repository, userId]);

  async function toggleRead(notification: AppNotification) {
    const nextStatus = notification.lifecycleStatus === "read" ? "unread" : "read";
    setNotifications((items) => items.map((item) => item.id === notification.id ? { ...item, lifecycleStatus: nextStatus, readAt: nextStatus === "read" ? new Date().toISOString() : undefined } : item));
    setSelected((item) => item?.id === notification.id ? { ...item, lifecycleStatus: nextStatus } : item);
    setSaveStatus("optimistic read state saved locally");
    await repository.markRead(notification.id, nextStatus === "read").then(() => setSaveStatus("read state synced")).catch((error: Error) => setSaveStatus(error.message));
  }

  async function archive(notification: AppNotification) {
    setNotifications((items) => items.filter((item) => item.id !== notification.id));
    if (selected?.id === notification.id) setSelected(null);
    setSaveStatus("optimistic archive applied locally");
    await repository.archive(notification.id).then(() => setSaveStatus("archive synced")).catch((error: Error) => setSaveStatus(error.message));
  }

  async function savePreferences(next: NotificationPreference) { setPreferences(next); setSaveStatus("preferences staged"); await repository.savePreferences(next).then(() => setSaveStatus("preferences synced")).catch((error: Error) => setSaveStatus(error.message)); }
  const pendingSync = repository.getOfflineQueue();

  return <main className="screen"><header className="topbar"><div><p className="eyebrow">Notification center</p><h1>Alerts</h1></div><div className="avatar">{notifications.filter((item) => item.lifecycleStatus === "unread").length}</div></header>
    <section className="hero-card"><span className="pill">{source} provider</span><h2>Notifications V1</h2><p>In-app center with reminders, trainer alerts, system alerts, optimistic read/archive, offline queue, and push/email/SMS-ready metadata.</p><p>Save status: {saveStatus}</p></section>
    <NotificationFilters filters={filters} onChange={setFilters} />
    <NotificationList notifications={notifications} selected={selected} onSelect={setSelected} onToggleRead={toggleRead} onArchive={archive} />
    <NotificationDetail notification={selected} />
    <PushMetadataPanel notification={selected} />
    <NotificationPreferences preferences={preferences} onChange={savePreferences} />
    <ReminderSettings preferences={preferences} onChange={savePreferences} />
    <SystemAlerts notifications={notifications} />
    <section className="panel"><h2>Offline queue</h2><pre>{JSON.stringify(pendingSync, null, 2)}</pre></section>
  </main>;
}
