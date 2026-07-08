import type { DailyLog } from "../../types/gymcord";

export function MealLogger({ log, onChange }: { log: DailyLog; onChange: (patch: Partial<DailyLog>) => void }) {
  return (
    <section className="panel">
      <h3>Meal logging</h3>
      <textarea className="textarea tall" placeholder="Ingredients, portions, prep notes, sauces, supplements..." value={log.ingredients} onChange={(event) => onChange({ ingredients: event.target.value })} />
      <div className="grid compact-grid">
        <input className="input" type="number" min="0" placeholder="Calories" value={log.calories || ""} onChange={(event) => onChange({ calories: Number(event.target.value) })} />
        <input className="input" type="number" min="0" placeholder="Protein grams" value={log.protein || ""} onChange={(event) => onChange({ protein: Number(event.target.value) })} />
      </div>
    </section>
  );
}
