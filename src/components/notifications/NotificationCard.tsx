import type { AppNotification } from "../../types/domain";
export function NotificationCard({ notification, selected, onSelect, onToggleRead, onArchive }: { notification: AppNotification; selected?: boolean; onSelect: (notification: AppNotification) => void; onToggleRead: (notification: AppNotification) => void; onArchive: (notification: AppNotification) => void; }) {
  return <article className="card" style={{ borderColor: selected ? "var(--pink)" : undefined }}>
    <p className="eyebrow">{notification.kind.replace(/_/g, " ")} · {notification.priority}</p>
    <h3>{notification.title}</h3><p>{notification.body}</p>
    <div className="muscle-list"><span>{notification.lifecycleStatus}</span><span>{notification.audience}</span>{notification.channels.map((channel) => <span key={channel}>{channel}</span>)}</div>
    <button className="primary-button" type="button" onClick={() => onSelect(notification)}>View details</button>
    <button className="back-btn" type="button" onClick={() => onToggleRead(notification)}>{notification.lifecycleStatus === "read" ? "Mark unread" : "Mark read"}</button>
    <button className="back-btn" type="button" onClick={() => onArchive(notification)}>Archive</button>
  </article>;
}
