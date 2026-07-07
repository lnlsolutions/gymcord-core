import type { DailyLog } from "../../types/gymcord";
import { getLastSevenDays, shortDate } from "../../lib/storage";

export function DateStrip({
  selectedDate,
  setSelectedDate,
  logs,
}: {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  logs: Record<string, DailyLog>;
}) {
  return (
    <div className="date-strip">
      {getLastSevenDays().map((date) => {
        const log = logs[date];
        const complete =
          log && Object.values(log.completedExercises || {}).filter(Boolean).length > 0;

        return (
          <button
            key={date}
            className={selectedDate === date ? "active" : ""}
            onClick={() => setSelectedDate(date)}
          >
            <span>{shortDate(date)}</span>
            <small>{complete ? "✓" : "•"}</small>
          </button>
        );
      })}
    </div>
  );
}
