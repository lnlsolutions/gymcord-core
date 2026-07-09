import type { RecurringEventMetadata } from "../../repositories/CalendarRepository";
export function RecurringEventPanel({ recurrence }: { recurrence?: RecurringEventMetadata }) {
  return <section className="calendar-panel"><h2>Recurring event metadata</h2><pre>{JSON.stringify(recurrence ?? { frequency: "none" }, null, 2)}</pre></section>;
}
