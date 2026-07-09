import type { AppNotification } from "../../types/domain";
import { NotificationCard } from "./NotificationCard";
export function NotificationList(props: { notifications: AppNotification[]; selected?: AppNotification | null; onSelect: (notification: AppNotification) => void; onToggleRead: (notification: AppNotification) => void; onArchive: (notification: AppNotification) => void; }) {
  return <section className="page"><h2>Notification list</h2>{props.notifications.length === 0 && <div className="card"><p>No notifications match this view.</p></div>}{props.notifications.map((notification) => <NotificationCard key={notification.id} notification={notification} selected={props.selected?.id === notification.id} onSelect={props.onSelect} onToggleRead={props.onToggleRead} onArchive={props.onArchive} />)}</section>;
}
