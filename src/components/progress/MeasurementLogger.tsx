import type { DailyLog } from "../../types/gymcord";
export function MeasurementLogger({ measurements, onChange }: { measurements: DailyLog["measurements"]; onChange: (measurements: DailyLog["measurements"]) => void }) {
  return <div className="panel premium-card"><div className="card-heading"><div><p className="eyebrow">Measurements</p><h3>Body measurements</h3></div></div><div className="measurement-grid">{["waist","hips","glutes","thighs","arms","chest"].map((field) => <label key={field}><span>{field}</span><input className="input" value={measurements[field as keyof typeof measurements]} onChange={(event) => onChange({ ...measurements, [field]: event.target.value })} placeholder="cm" /></label>)}</div></div>;
}
