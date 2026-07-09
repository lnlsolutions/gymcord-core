import { useState } from "react";
import { useAuth } from "../../auth";
import { appConfig } from "../../config";
import { notificationRepository } from "../../repositories/NotificationRepository";
import { NotificationCenter } from "../notifications/NotificationCenter";

export function DeveloperNotifications() {
  const auth = useAuth();
  const [status, setStatus] = useState("loading");
  const userId = auth.session?.user.id ?? "developer-user";
  const organizationId = auth.session?.organization?.id;
  return <main className="dev-page"><header className="dev-header"><p className="eyebrow">GymCord Developer Verification</p><h1>Notifications</h1><p>Repository-only diagnostics for notification center, preferences, metadata, optimistic actions, pending sync, and offline queue.</p></header>
    <section className="dev-card"><h2>Runtime</h2><div className="dev-grid"><div className="dev-row"><strong>Active provider</strong><span>{appConfig.backend.provider}</span></div><div className="dev-row"><strong>Notifications loaded</strong><span>{status}</span></div><div className="dev-row"><strong>Pending sync</strong><span>{notificationRepository.getOfflineQueue().length} queued write(s)</span></div><div className="dev-row"><strong>Offline queue</strong><span>enabled via repository queueWhenOffline writes</span></div></div></section>
    <NotificationCenter userId={userId} organizationId={organizationId} onStatusChange={setStatus} />
  </main>;
}
