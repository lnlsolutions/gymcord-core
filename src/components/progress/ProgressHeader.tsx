export function ProgressHeader({ provider, score, saveStatus }: { provider: string; score: number; saveStatus: string }) {
  return <div className="panel hero-panel"><p className="eyebrow">Progress Experience V1 • {provider}</p><h1>Track your transformation</h1><p>Log measurements, weight, and progress photo metadata through the active repository.</p><div className="stat-row"><strong>{score}%</strong><span>Transformation score</span><span>{saveStatus}</span></div></div>;
}
