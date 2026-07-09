import { useMemo } from "react";
import { qaRepository } from "../../repositories/QARepository";
import { AuthQAChecklist } from "./AuthQAChecklist";
import { BillingQAChecklist } from "./BillingQAChecklist";
import { DeploymentReadinessScore } from "./DeploymentReadinessScore";
import { EnvironmentDiagnostics } from "./EnvironmentDiagnostics";
import { KnownBlockersPanel } from "./KnownBlockersPanel";
import { MockModeReadiness } from "./MockModeReadiness";
import { NavigationQAChecklist } from "./NavigationQAChecklist";
import { OfflineQueueDiagnostics } from "./OfflineQueueDiagnostics";
import { ProviderDiagnostics } from "./ProviderDiagnostics";
import { RouteAvailabilityMatrix } from "./RouteAvailabilityMatrix";
import { SmokeTestChecklist } from "./SmokeTestChecklist";
import { SupabaseReadiness } from "./SupabaseReadiness";
import { TenantSwitchingQAChecklist } from "./TenantSwitchingQAChecklist";
import { WhiteLabelQAChecklist } from "./WhiteLabelQAChecklist";

export function BetaQADashboard() {
  const snapshot = useMemo(() => qaRepository.loadSnapshot(), []);
  return <main className="app-shell-validation"><header className="app-shell-header"><div><p className="eyebrow">Build 039</p><h1>Beta QA + deployment readiness</h1><p>Actionable readiness diagnostics for mock and Supabase deployments.</p></div><div><strong>{snapshot.activeProvider}</strong><span>{snapshot.environment}</span></div></header><DeploymentReadinessScore snapshot={snapshot} /><ProviderDiagnostics snapshot={snapshot} /><EnvironmentDiagnostics snapshot={snapshot} /><RouteAvailabilityMatrix snapshot={snapshot} /><SmokeTestChecklist snapshot={snapshot} /><SupabaseReadiness snapshot={snapshot} /><MockModeReadiness snapshot={snapshot} /><AuthQAChecklist snapshot={snapshot} /><NavigationQAChecklist snapshot={snapshot} /><TenantSwitchingQAChecklist snapshot={snapshot} /><WhiteLabelQAChecklist snapshot={snapshot} /><BillingQAChecklist snapshot={snapshot} /><OfflineQueueDiagnostics snapshot={snapshot} /><KnownBlockersPanel snapshot={snapshot} /></main>;
}
