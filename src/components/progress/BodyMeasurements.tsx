import type { DailyLog } from "../../types/gymcord";
export function BodyMeasurements({ measurements }: { measurements: DailyLog["measurements"] }) {
  return <div className="panel"><p className="eyebrow">Summary</p><h3>Latest body measurements</h3><div className="metric-grid">{Object.entries(measurements).map(([key, value]) => <div className="metric" key={key}><span>{key}</span><strong>{value || "—"}</strong></div>)}</div></div>;
}
