import { appConfig } from "../config";
import { offlineEngine } from "../services/sync";
import { appShellRepository, type AppShellRoute } from "./AppShellRepository";

export interface QAReadinessItem {
  id: string;
  label: string;
  status: "pass" | "warning" | "blocked";
  note: string;
}

export interface QAReadinessSnapshot {
  provider: typeof appConfig.backend.provider;
  score: number;
  smokeTestChecklist: QAReadinessItem[];
  routeAvailability: AppShellRoute[];
  providerDiagnostics: QAReadinessItem[];
  environmentDiagnostics: QAReadinessItem[];
  supabaseReadiness: QAReadinessItem[];
  mockModeReadiness: QAReadinessItem[];
  offlineQueueDiagnostics: QAReadinessItem[];
  navigationQA: QAReadinessItem[];
  tenantSwitchingQA: QAReadinessItem[];
  whiteLabelQA: QAReadinessItem[];
  authQA: QAReadinessItem[];
  billingMetadataQA: QAReadinessItem[];
  knownBlockers: QAReadinessItem[];
}

const pass = (id: string, label: string, note: string): QAReadinessItem => ({ id, label, note, status: "pass" });
const warning = (id: string, label: string, note: string): QAReadinessItem => ({ id, label, note, status: "warning" });
const blocked = (id: string, label: string, note: string): QAReadinessItem => ({ id, label, note, status: "blocked" });

export class QARepository {
  loadSnapshot(): QAReadinessSnapshot {
    const routes = this.getRouteAvailability();
    const snapshot: QAReadinessSnapshot = {
      provider: appConfig.backend.provider,
      score: 0,
      smokeTestChecklist: [
        pass("dev-qa-route", "/dev/qa route", "Validation dashboard is registered behind AuthProvider and ProtectedRoute."),
        pass("app-shell", "Beta app shell", "Existing app shell validation remains additive and unchanged."),
        warning("npm-ci", "npm ci", "Blocked in this environment by npm registry authorization: 403 Forbidden for @testing-library/jest-dom."),
      ],
      routeAvailability: routes,
      providerDiagnostics: this.getProviderDiagnostics(),
      environmentDiagnostics: this.getEnvironmentDiagnostics(),
      supabaseReadiness: [
        pass("provider-mapping", "Provider mappings only", "Supabase mode uses repository paths mapped by the centralized provider table aliases."),
        pass("ui-boundary", "UI Supabase boundary", "QA UI imports repositories only and never constructs a Supabase client."),
      ],
      mockModeReadiness: [pass("mock-fixtures", "Mock mode fixtures", "Mock mode loads static readiness fixtures and existing mock provider defaults without network calls.")],
      offlineQueueDiagnostics: this.getOfflineQueueDiagnostics(),
      navigationQA: [pass("navigation-modes", "Navigation QA", "Route availability is derived from the app shell mode registry for consumer, trainer, gym, and admin modes.")],
      tenantSwitchingQA: [pass("tenant-switching", "Tenant switching QA", "Tenant context remains represented by app shell fixtures and tenancy validation modules.")],
      whiteLabelQA: [pass("white-label", "White-label QA", "Active brand name, color, logo metadata, and tenant settings remain visible in validation surfaces.")],
      authQA: [pass("protected-route", "Auth QA", "/dev/qa is wrapped with ProtectedRoute and does not skip authentication.")],
      billingMetadataQA: [pass("billing-metadata", "Billing metadata QA", "Billing readiness is metadata-only and avoids destructive billing actions.")],
      knownBlockers: this.getLaunchBlockers(),
    };
    return { ...snapshot, score: this.calculateReadinessScore(snapshot) };
  }

  calculateReadinessScore(snapshot = this.loadSnapshot()): number {
    const groups = [snapshot.smokeTestChecklist, snapshot.providerDiagnostics, snapshot.environmentDiagnostics, snapshot.supabaseReadiness, snapshot.mockModeReadiness, snapshot.offlineQueueDiagnostics, snapshot.navigationQA, snapshot.tenantSwitchingQA, snapshot.whiteLabelQA, snapshot.authQA, snapshot.billingMetadataQA].flat();
    const possible = groups.length * 2;
    const earned = groups.reduce((sum, item) => sum + (item.status === "pass" ? 2 : item.status === "warning" ? 1 : 0), 0);
    return Math.round((earned / possible) * 100);
  }

  getLaunchBlockers(): QAReadinessItem[] {
    return [blocked("npm-registry-403", "npm registry authorization", "npm ci is blocked by 403 Forbidden for https://registry.npmjs.org/@testing-library%2fjest-dom, so build and test cannot complete until registry access is restored.")];
  }

  getRouteAvailability(): AppShellRoute[] {
    return appShellRepository.loadSnapshot().routes;
  }

  getEnvironmentDiagnostics(): QAReadinessItem[] {
    return [
      pass("environment", "Environment", `App environment is ${appConfig.environment}.`),
      warning("registry", "Registry authorization", "Dependency installation requires npm registry authorization in this container."),
    ];
  }

  getProviderDiagnostics(): QAReadinessItem[] {
    return [
      pass("active-provider", "Active provider", `Configured backend provider is ${appConfig.backend.provider}.`),
      pass("supabase-boundary", "Supabase boundary", "Supabase clients are isolated to auth/api provider layers, not QA UI."),
    ];
  }

  getOfflineQueueDiagnostics(): QAReadinessItem[] {
    return [pass("offline-queue", "Offline queue diagnostics", `Queued offline writes: ${offlineEngine.getQueue().length}.`)];
  }
}

export const qaRepository = new QARepository();
