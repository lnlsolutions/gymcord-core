import type { DailyLog } from "../../types/gymcord";
import { DailyCalendar } from "./DailyCalendar";
import { ProgressPhotoUpload } from "./ProgressPhotoUpload";

export function Progress({
  logs,
  selectedDate,
  setSelectedDate,
  dayLog,
  updateDay,
}: {
  logs: Record<string, DailyLog>;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  dayLog: DailyLog;
  updateDay: (patch: Partial<DailyLog>) => void;
}) {
  return (
    <section className="page">
      <DailyCalendar
        logs={logs}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />

      <div className="panel">
        <h3>Measurements</h3>

        {["weight", "waist", "hips", "glutes", "thighs", "arms", "chest"].map(
          (field) => (
            <input
              key={field}
              className="input"
              placeholder={field}
              value={dayLog.measurements[field as keyof typeof dayLog.measurements]}
              onChange={(event) =>
                updateDay({
                  measurements: {
                    ...dayLog.measurements,
                    [field]: event.target.value,
                  },
                })
              }
            />
          )
        )}
      </div>

      <ProgressPhotoUpload
        type="front"
        label="Front Progress Photo"
        dayLog={dayLog}
        updateDay={updateDay}
      />

      <ProgressPhotoUpload
        type="side"
        label="Side Progress Photo"
        dayLog={dayLog}
        updateDay={updateDay}
      />

      <ProgressPhotoUpload
        type="back"
        label="Back Progress Photo"
        dayLog={dayLog}
        updateDay={updateDay}
      />
    </section>
  );
}
