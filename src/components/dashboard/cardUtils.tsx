import type { ReactNode } from "react";

export function DashboardPanel({ title, eyebrow, action, children }: { title: string; eyebrow?: string; action?: ReactNode; children: ReactNode }) {
  return <article className="panel premium-card member-dashboard-card"><div className="card-heading"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h3>{title}</h3></div>{action}</div>{children}</article>;
}

export function ProgressBar({ value }: { value: number }) {
  return <div className="progress-track" aria-label={`${Math.round(value)}% complete`}><span style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div>;
}
