import { useMemo } from "react";
import { qaRepository, type QAReadinessItem } from "../../repositories/QARepository";

function StatusList({ title, items }: { title: string; items: QAReadinessItem[] }) {
  return <section className="shell-panel"><h2>{title}</h2><ul>{items.map((item) => <li key={item.id}><strong>{item.label}</strong> — {item.status}: {item.note}</li>)}</ul></section>;
}

export function DeveloperQA() {
  const snapshot = useMemo(() => qaRepository.loadSnapshot(), []);

  return (
    <main className="app-shell-validation">
      <header className="app-shell-header">
        <div>
          <p className="eyebrow">Build 041 beta deploy preview QA</p>
          <h1>Deployment readiness score: {snapshot.score}%</h1>
          <p>Provider: {snapshot.provider} · Deploy preview baseline: PR #66 · Click through the route matrix below for beta demo coverage.</p>
        </div>
      </header>
      <section className="shell-panel beta-readiness-panel"><h2>Beta readiness</h2><div className="readiness-score">{snapshot.score}%</div><p>Ready for a guided clickable beta demo when route smoke tests, mock-mode auth guards, tenant branding, admin operations, billing metadata, and offline queue diagnostics remain pass/warning only.</p></section>
      <StatusList title="Smoke test checklist" items={snapshot.smokeTestChecklist} />
      <section className="shell-panel"><h2>Route availability matrix</h2><div className="module-grid">{snapshot.routeAvailability.map((route) => <a key={route.id} href={route.path}>{route.label}<span>{route.path} · {route.modes.join("/")}</span></a>)}</div></section>
      <StatusList title="Provider diagnostics" items={snapshot.providerDiagnostics} />
      <StatusList title="Environment diagnostics" items={snapshot.environmentDiagnostics} />
      <StatusList title="Supabase readiness" items={snapshot.supabaseReadiness} />
      <StatusList title="Mock mode readiness" items={snapshot.mockModeReadiness} />
      <StatusList title="Offline queue diagnostics" items={snapshot.offlineQueueDiagnostics} />
      <StatusList title="Navigation QA" items={snapshot.navigationQA} />
      <StatusList title="Tenant switching QA" items={snapshot.tenantSwitchingQA} />
      <StatusList title="White-label QA" items={snapshot.whiteLabelQA} />
      <StatusList title="Auth QA" items={snapshot.authQA} />
      <StatusList title="Billing metadata QA" items={snapshot.billingMetadataQA} />
      <section className="shell-panel"><h2>Build 047 QA checks</h2><ul>{["zero-state metrics","fake-score prevention","workout library completeness","muscle group coverage","training split coverage","meal photo journal","multiple photos per meal","sleep zero-state","recovery zero-state","progress zero-state","navigation drawer","pricing visibility","billing visibility","subscription visibility","dead links","route errors","raw JSON exposure on member pages","demo-data isolation","ownership preservation"].map((item) => <li key={item}>{item} — review required in deploy preview</li>)}</ul></section>
      <StatusList title="Known blockers" items={snapshot.knownBlockers} />
    </main>
  );
}
