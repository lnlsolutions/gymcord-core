import type { AppShellSnapshot } from "../../repositories/AppShellRepository";
export function BetaStatusPanel({ snapshot }: { snapshot: AppShellSnapshot }) {
  return <section className="panel beta-status"><h3>Beta status</h3><div className="grid"><div className="card"><p>Pending sync</p><strong>{snapshot.pendingSync}</strong><span>{snapshot.saveStatus}</span></div><div className="card"><p>Visible routes</p><strong>{snapshot.visibleRoutes.length}</strong><span>{snapshot.hiddenRoutes.length} hidden</span></div></div><ul>{snapshot.betaReadinessChecklist.map((item) => <li key={item.label}>{item.ready ? "✅" : "⏳"} {item.label}</li>)}</ul></section>;
}
