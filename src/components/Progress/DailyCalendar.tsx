import type { DailyLog } from "../../types/gymcord";
import { getLastSevenDays, shortDate } from "../../lib/storage";

export function DailyCalendar({
  logs,
  selectedDate,
  setSelectedDate,
}: {
  logs: Record<string, DailyLog>;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
}) {
  return (
    <div className="panel">
      <h3>Daily History</h3>

      <div className="calendar-list">
        {getLastSevenDays().map((date) => {
          const log = logs[date];
          const completed = log
            ? Object.values(log.completedExercises || {}).filter(Boolean).length
            : 0;

          return (
            <button
              key={date}
              className={selectedDate === date ? "active" : ""}
              onClick={() => setSelectedDate(date)}
            >
              <strong>{shortDate(date)}</strong>
              <span>
                {completed} exercises · {log?.protein || 0}g protein ·{" "}
                {log?.water || 0}/8 water
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
