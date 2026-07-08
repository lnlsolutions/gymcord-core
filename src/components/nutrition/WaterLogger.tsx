import type { DailyLog } from "../../types/gymcord";

export function WaterLogger({ log, onChange }: { log: DailyLog; onChange: (patch: Partial<DailyLog>) => void }) {
  return (
    <section className="panel">
      <h3>Water tracking</h3>
      <div className="counter">
        <button onClick={() => onChange({ water: Math.max(0, log.water - 1) })}>−</button>
        <strong>{log.water}/8</strong>
        <button onClick={() => onChange({ water: log.water + 1 })}>+</button>
      </div>
      <p className="muted">Each serving represents one glass or bottle checkpoint.</p>
    </section>
  );
}
