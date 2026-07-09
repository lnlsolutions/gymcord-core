import { useEffect, useMemo, useState } from "react";
import { appConfig } from "../../config";
import { adminRepository, type AdminDashboard } from "../../repositories/AdminRepository";
import { OrganizationRepository } from "../../repositories/OrganizationRepository";
import { createBackendProvider } from "../../api/client";

function row(label: string, value: string, detail?: string) { return { label, value, detail }; }
function StatusCard({ title, rows }: { title: string; rows: { label: string; value: string; detail?: string }[] }) { return <section className="dev-card"><h2>{title}</h2><div className="dev-grid">{rows.map((item) => <div className="dev-row" key={item.label}><strong>{item.label}</strong><span>{item.value}</span>{item.detail && <small>{item.detail}</small>}</div>)}</div></section>; }

export function DeveloperAdmin() {
  const repository = useMemo(() => adminRepository, []);
  const organizationRepository = useMemo(() => new OrganizationRepository(createBackendProvider()), []);
  const [dashboard, setDashboard] = useState<AdminDashboard>(() => repository.seedDashboard());
  const [source, setSource] = useState("seeded");
  const [status, setStatus] = useState("ready");

  useEffect(() => { let active = true; repository.loadDashboard().then((result) => { if (!active) return; setDashboard(result.data); setSource(result.source); }).catch((error: Error) => setStatus(error.message)); return () => { active = false; }; }, [repository]);

  function validateTenantSwitch() {
    const switchedAt = new Date().toISOString();
    setDashboard((current) => ({ ...current, tenant: { ...current.tenant, activeTenantId: "gym-enterprise-preview", activeOrganizationId: current.organizations[0]?.id ?? current.tenant.activeOrganizationId, branding: { ...current.tenant.branding, appName: "Gym Enterprise" }, permissions: [...new Set([...current.tenant.permissions, "enterprise:preview"])], enabledFeatures: ["admin_operations", "billing", "trainer_portal", "member_app"], activeOrganizationName: current.organizations[0]?.name ?? current.tenant.activeOrganizationName, navigationVisibility: { memberApp: true, trainerPortal: true, billing: true, adminOperations: true }, billingState: { ...current.tenant.billingState, status: "trialing" }, switchHistory: [{ tenantId: "gym-enterprise-preview", organizationId: current.organizations[0]?.id ?? current.tenant.activeOrganizationId, switchedAt, metadataOnly: true }, ...current.tenant.switchHistory] } }));
    setStatus("optimistic tenant switch updated active tenant, branding, permissions, features, organization, navigation, billing, and history");
    void repository.switchTenant({ tenantId: "gym-enterprise-preview", organizationId: dashboard.tenant.activeOrganizationId });
  }

  function validateAdminUpdate() {
    setDashboard((current) => ({ ...current, organizations: current.organizations.map((item, index) => index === 0 ? { ...item, settings: { ...item.settings, requireTrainerApproval: !item.settings.requireTrainerApproval }, updatedAt: new Date().toISOString() } : item) }));
    setStatus("optimistic admin organization update staged before repository reconciliation");
  }

  const tenant = dashboard.tenant;
  return <main className="dev-page">
    <header className="dev-header"><p className="eyebrow">GymCord Developer Verification</p><h1>Admin Platform Validation</h1><p>Repository-only diagnostics for admin operations, tenant switching, white-label previews, metadata-only impersonation, provider routing, offline queue support, and integration readiness.</p><button type="button" onClick={validateTenantSwitch}>Validate tenant switch</button><button type="button" onClick={validateAdminUpdate}>Validate admin update</button></header>
    <StatusCard title="Runtime" rows={[row("Route", "/dev/admin"), row("Active provider", appConfig.backend.provider), row("Repository source", source), row("Mock mode", appConfig.backend.provider === "mock" ? "works" : "available by config"), row("Supabase mode", "provider mappings only"), row("Offline queue", `${repository.getOfflineQueue().length} admin/organization metadata write(s)`), row("Status", status)]} />
    <StatusCard title="Repository capabilities" rows={[... ["loadDashboard", "seedDashboard", "switchTenant", "viewAs", "getOfflineQueue"].map((name) => row(`AdminRepository.${name}`, "available")), ...["list", "findById", "search", "create", "archive", "restore", "delete"].map((name) => row(`OrganizationRepository.${name}`, typeof (organizationRepository as unknown as Record<string, unknown>)[name] === "function" ? "available" : "missing", name === "delete" ? "delete delegates to archive; no hard delete from admin UI" : undefined))]} />
    <StatusCard title="Tenant switching updates" rows={[row("Active tenant", tenant.activeTenantId), row("Branding", tenant.branding.appName), row("Permissions", tenant.permissions.join(", ")), row("Enabled features", tenant.enabledFeatures.join(", ")), row("Active organization", `${tenant.activeOrganizationName} (${tenant.activeOrganizationId})`), row("Navigation visibility", JSON.stringify(tenant.navigationVisibility)), row("Billing state", `${tenant.billingState.provider}:${tenant.billingState.status}`), row("Tenant switch history", `${tenant.switchHistory.length} metadata-only record(s)`)]} />
    <StatusCard title="White-label preview" rows={(Object.entries(dashboard.whiteLabelPreviews) as [string, { enabledFeatures: string[]; canSwitchWithoutLogout: true }][]).map(([name, preview]) => row(name, "supported", `${preview.enabledFeatures.join(", ")}; switch without logout: ${preview.canSwitchWithoutLogout}`))} />
    <StatusCard title="Admin impersonation safety" rows={[row("Mode", dashboard.impersonation.mode), row("Security bypass", String(dashboard.impersonation.securityBypass)), row("Auth bypass", String(dashboard.impersonation.authBypass)), row("Repository metadata only", String(dashboard.impersonation.repositoryMetadataOnly))]} />
    <StatusCard title="Integration readiness" rows={(Object.entries(dashboard.integrationReadiness) as [string, string][]).map(([surface, value]) => row(surface, value))} />
    <section className="dev-card"><h2>Admin dashboard snapshot</h2><pre>{JSON.stringify(dashboard, null, 2)}</pre></section>
  </main>;
}
