import type { DailyLog } from "../../types/gymcord";
export function WeightTracker({ measurements, history, onChange }: { measurements: DailyLog["measurements"]; history: Array<{ date: string; weight: number }>; onChange: (measurements: DailyLog["measurements"]) => void }) {
  return <div className="panel premium-card"><p className="eyebrow">Weight tracking</p><h3>Current weight</h3><input className="input" value={measurements.weight} onChange={(event) => onChange({ ...measurements, weight: event.target.value })} placeholder="Weight" /><div className="timeline-list">{history.slice(0, 5).map((item) => <div className="timeline-item" key={item.date}><strong>{item.weight}</strong><span>{item.date}</span></div>)}</div></div>;
}
