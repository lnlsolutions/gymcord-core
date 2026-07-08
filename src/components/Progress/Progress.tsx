import type { DailyLog, TransformationSnapshot } from "../../types/gymcord";
import { DailyCalendar } from "./DailyCalendar";
import { ProgressPhotoUpload } from "./ProgressPhotoUpload";
import { ProgressCharts } from "../Transformation/ProgressCharts";

export function Progress({
  logs,
  selectedDate,
  setSelectedDate,
  dayLog,
  updateDay,
  transformation,
}: {
  logs: Record<string, DailyLog>;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  dayLog: DailyLog;
  updateDay: (patch: Partial<DailyLog>) => void;
  transformation: TransformationSnapshot;
}) {
  return (
    <section className="page transformation-progress-page">
      <DailyCalendar logs={logs} selectedDate={selectedDate} setSelectedDate={setSelectedDate} />

      <ProgressCharts progress={transformation.progress} />

      <div className="panel premium-card measurement-panel">
        <div className="card-heading"><div><p className="eyebrow">Body Progress</p><h3>Measurements</h3></div><strong>Day {transformation.progress.dayNumber}</strong></div>
        <div className="measurement-grid">
          {["weight", "waist", "hips", "glutes", "thighs", "arms", "chest"].map((field) => (
            <label key={field}>
              <span>{field}</span>
              <input
                className="input"
                placeholder={field}
                value={dayLog.measurements[field as keyof typeof dayLog.measurements]}
                onChange={(event) => updateDay({ measurements: { ...dayLog.measurements, [field]: event.target.value } })}
              />
            </label>
          ))}
        </div>
      </div>

      <div className="photo-grid">
        <ProgressPhotoUpload type="front" label="Front Progress Photo" dayLog={dayLog} updateDay={updateDay} />
        <ProgressPhotoUpload type="side" label="Side Progress Photo" dayLog={dayLog} updateDay={updateDay} />
        <ProgressPhotoUpload type="back" label="Back Progress Photo" dayLog={dayLog} updateDay={updateDay} />
      </div>
    </section>
  );
}
