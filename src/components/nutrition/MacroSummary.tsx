import type { DailyLog } from "../../types/gymcord";

export function MacroSummary({ log }: { log: DailyLog }) {
  const proteinPercent = Math.min(100, Math.round((log.protein / 130) * 100));
  const waterPercent = Math.min(100, Math.round((log.water / 8) * 100));
  return (
    <section className="panel">
      <h3>Macro totals</h3>
      <div className="dev-grid">
        <div className="dev-row"><strong>Calories</strong><span>{log.calories} kcal</span></div>
        <div className="dev-row"><strong>Protein</strong><span>{log.protein}g · {proteinPercent}%</span></div>
        <div className="dev-row"><strong>Water</strong><span>{log.water}/8 · {waterPercent}%</span></div>
      </div>
    </section>
  );
}
