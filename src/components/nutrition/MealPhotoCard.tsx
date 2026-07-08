import type { DailyLog } from "../../types/gymcord";

export function MealPhotoCard({ log, onChange }: { log: DailyLog; onChange: (patch: Partial<DailyLog>) => void }) {
  const metadata = log.mealPhoto ? { path: log.mealPhoto, date: log.date, taggedFor: "nutrition_log" } : null;
  return (
    <section className="panel">
      <h3>Meal photo metadata</h3>
      <input className="input" placeholder="Photo URL or storage path" value={log.mealPhoto} onChange={(event) => onChange({ mealPhoto: event.target.value })} />
      {metadata ? <pre>{JSON.stringify(metadata, null, 2)}</pre> : <p className="muted">Add a photo path to attach metadata to this meal log.</p>}
    </section>
  );
}
