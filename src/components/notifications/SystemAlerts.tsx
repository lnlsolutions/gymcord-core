import type { AppNotification } from "../../types/domain";
export function SystemAlerts({ notifications }: { notifications: AppNotification[] }) { const alerts = notifications.filter((item) => item.kind === "system_alert"); return <section className="panel"><h2>System alerts</h2>{alerts.map((alert) => <p key={alert.id}>⚠️ {alert.title}: {alert.body}</p>)}</section>; }
