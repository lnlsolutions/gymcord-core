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
          <p className="eyebrow">Build 039 beta QA validation</p>
          <h1>Deployment readiness score: {snapshot.score}%</h1>
          <p>Provider: {snapshot.provider}</p>
        </div>
      </header>
      <StatusList title="Smoke test checklist" items={snapshot.smokeTestChecklist} />
      <section className="shell-panel"><h2>Route availability matrix</h2><ul>{snapshot.routeAvailability.map((route) => <li key={route.id}>{route.label}: {route.path} · {route.modes.join("/")} · mapping {route.guard.providerMapping}</li>)}</ul></section>
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
      <StatusList title="Known blockers" items={snapshot.knownBlockers} />
    </main>
  );
}
