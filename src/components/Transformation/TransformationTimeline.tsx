import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import type { TransformationSnapshot } from "../../types/gymcord";

export function TransformationTimeline({ snapshot }: { snapshot: TransformationSnapshot }) {
  return (
    <article className="panel premium-card transformation-timeline">
      <div className="card-heading"><div><p className="eyebrow">Transformation Timeline</p><h3>Future self trajectory</h3></div><strong>{snapshot.prediction.confidence}% confidence</strong></div>
      <div className="timeline-chart">
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={snapshot.milestones}>
            <defs><linearGradient id="weightGlow" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#75f0b2" stopOpacity={0.7}/><stop offset="100%" stopColor="#ff4fa0" stopOpacity={0.06}/></linearGradient></defs>
            <XAxis dataKey="label" tick={{ fill: "rgba(255,255,255,.64)", fontSize: 10 }} interval={0} />
            <Tooltip contentStyle={{ background: "#130b17", border: "1px solid rgba(255,255,255,.14)", borderRadius: 14 }} />
            <Area type="monotone" dataKey="weight" stroke="#75f0b2" fill="url(#weightGlow)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="milestone-grid">
        {snapshot.milestones.map((item) => <div className="milestone-card" key={item.label}>
          <strong>{item.label}</strong><span>{item.weight || "—"} lbs · {item.bodyFat}% BF</span>
          <div className="mini-bars"><i style={{height: `${item.strengthProgress}%`}}/><i style={{height: `${item.workoutCompletion}%`}}/><i style={{height: `${item.consistency}%`}}/><i style={{height: `${item.missionCompletion}%`}}/></div>
          <small>XP {item.xpGrowth} · Atlas {item.atlasConfidenceScore}%</small>
        </div>)}
      </div>
    </article>
  );
}
