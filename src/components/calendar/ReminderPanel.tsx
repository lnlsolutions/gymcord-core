import type { CalendarReminder } from "../../repositories/CalendarRepository";
export function ReminderPanel({ reminders }: { reminders: CalendarReminder[] }) {
  return <section className="calendar-panel"><h2>Reminders</h2>{reminders.map((reminder)=><div className="calendar-row" key={reminder.id}><strong>{reminder.channel}</strong><span>{reminder.offsetMinutes} min before · {reminder.enabled ? "enabled" : "disabled"}</span></div>)}</section>;
}
