import { Area, AreaChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import type { ProgressSnapshot } from "../../types/gymcord";

export function ProgressCharts({ progress }: { progress: ProgressSnapshot }) {
  const data = progress.chartData.filter((point) => point.weight || point.mood || point.energy || point.recovery);
  return (
    <div className="chart-grid">
      <article className="panel premium-card"><p className="eyebrow">Weight History</p><h3>{progress.currentWeight || "—"} lbs</h3><ResponsiveContainer width="100%" height={150}><AreaChart data={data}><Tooltip/><XAxis dataKey="date" hide/><Area dataKey="weight" stroke="#ff7ab8" fill="rgba(255,79,160,.16)" strokeWidth={3}/></AreaChart></ResponsiveContainer></article>
      <article className="panel premium-card"><p className="eyebrow">Mood · Energy · Recovery</p><h3>Readiness history</h3><ResponsiveContainer width="100%" height={150}><LineChart data={data}><Tooltip/><XAxis dataKey="date" hide/><Line dataKey="mood" stroke="#ff8a65" strokeWidth={3}/><Line dataKey="energy" stroke="#75f0b2" strokeWidth={3}/><Line dataKey="recovery" stroke="#ff4fa0" strokeWidth={3}/></LineChart></ResponsiveContainer></article>
    </div>
  );
}
