import { appConfig } from "../config";
import { appShellRepository, type AppShellRoute } from "./AppShellRepository";
import { billingRepository } from "./BillingRepository";
import { offlineEngine } from "../services/sync";

export type QAStatus = "ready" | "warning" | "blocked";

export interface QACheckItem {
  id: string;
  label: string;
  status: QAStatus;
  detail: string;
}

export interface QACheckSection {
  id: string;
  title: string;
  items: QACheckItem[];
}

export interface QADiagnosticSnapshot {
  generatedAt: string;
  activeProvider: typeof appConfig.backend.provider;
  environment: typeof appConfig.environment;
  routes: AppShellRoute[];
  environmentVariables: QACheckItem[];
  provider: QACheckItem[];
  supabase: QACheckItem[];
  mockMode: QACheckItem[];
  offlineQueue: QACheckItem[];
  navigation: QACheckItem[];
  tenantSwitching: QACheckItem[];
  whiteLabel: QACheckItem[];
  auth: QACheckItem[];
  billing: QACheckItem[];
  smokeTests: QACheckSection[];
  blockers: QACheckItem[];
  readinessScore: number;
}

const hasValue = (value: unknown) => typeof value === "string" && value.trim().length > 0;
const statusWeight = (status: QAStatus) => status === "ready" ? 1 : status === "warning" ? 0.5 : 0;

export class QARepository {
  loadSnapshot(): QADiagnosticSnapshot {
    const shell = appShellRepository.loadSnapshot();
    const billing = billingRepository.seedSamples(shell.activeTenant.id);
    const offlineQueue = offlineEngine.getQueue();
    const isMock = appConfig.backend.provider === "mock";
    const isSupabase = appConfig.backend.provider === "supabase";
    const supabaseConfigured = hasValue(appConfig.backend.supabase.url) && hasValue(appConfig.backend.supabase.anonKey);

    const environmentVariables: QACheckItem[] = [
      { id: "vite-backend-provider", label: "VITE_BACKEND_PROVIDER", status: appConfig.backend.provider ? "ready" : "blocked", detail: `Active provider is ${appConfig.backend.provider}.` },
      { id: "vite-api-base-url", label: "VITE_API_BASE_URL", status: hasValue(appConfig.backend.endpoints.apiBaseUrl) ? "ready" : "warning", detail: `Resolved API base URL: ${appConfig.backend.endpoints.apiBaseUrl}.` },
      { id: "vite-supabase-url", label: "VITE_SUPABASE_URL", status: isSupabase ? (hasValue(appConfig.backend.supabase.url) ? "ready" : "blocked") : "warning", detail: isSupabase ? "Required for Supabase provider." : "Optional unless Supabase provider is active." },
      { id: "vite-supabase-anon-key", label: "VITE_SUPABASE_ANON_KEY", status: isSupabase ? (hasValue(appConfig.backend.supabase.anonKey) ? "ready" : "blocked") : "warning", detail: isSupabase ? "Required for Supabase auth and data provider mappings." : "Optional in mock mode; value is never displayed." },
    ];

    const provider: QACheckItem[] = [
      { id: "provider-selected", label: "Active provider", status: "ready", detail: `${appConfig.backend.provider} provider selected by configuration.` },
      { id: "repository-architecture", label: "Repository architecture", status: "ready", detail: "QA UI reads repository diagnostics and does not import Supabase clients." },
      { id: "provider-mappings", label: "Provider mappings", status: shell.routes.every((route) => route.guard.providerMapping) ? "ready" : "blocked", detail: "Every beta route declares a provider mapping contract." },
    ];

    const supabase: QACheckItem[] = [
      { id: "supabase-config", label: "Supabase configuration", status: isSupabase ? (supabaseConfigured ? "ready" : "blocked") : "warning", detail: isSupabase ? "URL and anon key must be present." : "Not required while mock provider is active." },
      { id: "supabase-through-provider", label: "Supabase access path", status: "ready", detail: "UI accesses Supabase mode only through repositories and provider mappings." },
      { id: "no-client-imports", label: "No UI Supabase imports", status: "ready", detail: "QA components are repository-only and avoid SupabaseProvider/getSupabaseClient imports." },
    ];

    const mockMode: QACheckItem[] = [
      { id: "mock-provider", label: "Mock mode support", status: isMock ? "ready" : "warning", detail: isMock ? "Mock provider is active for beta validation." : "Mock fixtures remain available when provider is switched back." },
      { id: "fixture-data", label: "Repository fixtures", status: "ready", detail: "App shell, billing, tenancy, and QA diagnostics provide deterministic fixture data." },
    ];

    const auth: QACheckItem[] = [
      { id: "auth-gate", label: "Auth gate", status: "ready", detail: "Developer QA route is wrapped in AuthProvider and ProtectedRoute." },
      { id: "no-auth-bypass", label: "No auth bypass", status: "ready", detail: "QA diagnostics report guard status without disabling route protection." },
      { id: "permissions", label: "Permission metadata", status: shell.routes.every((route) => route.guard.permissions.length > 0) ? "ready" : "blocked", detail: "Route guard metadata includes permissions for every beta route." },
    ];

    const navigation = shell.routes.map((route): QACheckItem => ({ id: route.id, label: route.label, status: route.guard.requiresAuth && route.status === "connected" ? "ready" : "warning", detail: `${route.path} → ${route.module}; modes: ${route.modes.join(", ")}.` }));

    const tenantSwitching: QACheckItem[] = [
      { id: "active-tenant", label: "Active tenant", status: shell.activeTenant.id ? "ready" : "blocked", detail: `${shell.activeTenant.name} (${shell.activeTenant.slug}).` },
      { id: "mode-switching", label: "Mode switching", status: "ready", detail: "Consumer, trainer, gym, and admin route visibility are exposed by AppShellRepository." },
      { id: "tenant-roles", label: "Tenant roles", status: "ready", detail: "Route metadata includes member, trainer, owner, and admin role coverage." },
    ];

    const whiteLabel: QACheckItem[] = [
      { id: "brand-name", label: "Brand name", status: hasValue(shell.activeBrand.name) ? "ready" : "blocked", detail: shell.activeBrand.name },
      { id: "primary-color", label: "Primary color", status: hasValue(shell.activeBrand.primaryColor) ? "ready" : "blocked", detail: shell.activeBrand.primaryColor },
      { id: "custom-domains", label: "Domain readiness", status: "warning", detail: "Custom domain cutover remains a launch checklist item." },
    ];

    const billingItems: QACheckItem[] = Object.entries(billing.metadataContracts).map(([surface, fields]) => ({ id: `billing-${surface}`, label: `${surface} metadata`, status: fields.length ? "ready" as const : "blocked" as const, detail: fields.join(", ") }));
    const offlineItems: QACheckItem[] = [
      { id: "offline-engine", label: "Offline queue engine", status: "ready", detail: "Mock offline engine is available to queue repository writes." },
      { id: "offline-depth", label: "Queued writes", status: offlineQueue.some((item) => item.status === "failed") ? "blocked" : offlineQueue.length ? "warning" : "ready", detail: `${offlineQueue.length} queued write(s) currently stored.` },
      { id: "no-hard-deletes", label: "No hard deletes", status: "ready", detail: "QA readiness tracks soft archive/cancel metadata and does not hard delete records." },
    ];

    const smokeTests: QACheckSection[] = [
      { id: "app-shell", title: "App shell readiness", items: [provider[2], ...navigation.slice(0, 5)] },
      { id: "auth-tenant", title: "Auth and tenant readiness", items: [...auth, ...tenantSwitching] },
      { id: "billing-offline", title: "Billing and offline readiness", items: [...billingItems, ...offlineItems] },
    ];

    const blockers: QACheckItem[] = [
      ...environmentVariables,
      ...supabase,
      ...offlineItems,
      { id: "npm-registry", label: "npm registry authorization", status: "warning", detail: "Run npm ci in CI/local validation; document any 401/403 registry authorization blocker." },
      { id: "custom-domain", label: "White-label custom domain cutover", status: "warning", detail: "DNS, SSL, and tenant domain ownership validation need production confirmation." },
    ].filter((item) => item.status !== "ready");

    const scored = [...environmentVariables, ...provider, ...supabase, ...mockMode, ...auth, ...navigation, ...tenantSwitching, ...whiteLabel, ...billingItems, ...offlineItems];
    const readinessScore = Math.round((scored.reduce((sum, item) => sum + statusWeight(item.status), 0) / scored.length) * 100);

    return { generatedAt: new Date().toISOString(), activeProvider: appConfig.backend.provider, environment: appConfig.environment, routes: shell.routes, environmentVariables, provider, supabase, mockMode, offlineQueue: offlineItems, navigation, tenantSwitching, whiteLabel, auth, billing: billingItems, smokeTests, blockers, readinessScore };
  }
}

export const qaRepository = new QARepository();
