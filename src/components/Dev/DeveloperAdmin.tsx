import { useEffect, useMemo, useState } from "react";
import { adminRepository, type AdminDashboardSnapshot, type AdminImpersonationRole } from "../../repositories/AdminRepository";
import { OrganizationRepository } from "../../repositories/OrganizationRepository";
import { createBackendProvider } from "../../api/client";

function row(label: string, value: string) { return <div><span>{label}</span><strong>{value}</strong></div>; }

export function DeveloperAdmin() {
  const [snapshot, setSnapshot] = useState<AdminDashboardSnapshot>(() => adminRepository.seedDashboard());
  const [query, setQuery] = useState("");
  const [saveStatus, setSaveStatus] = useState("seeded");
  const orgRepo = useMemo(() => new OrganizationRepository(createBackendProvider()), []);

  useEffect(() => { void adminRepository.loadDashboard().then((result) => { setSnapshot(result.data); setSaveStatus(`loaded from ${result.source}`); }); }, []);

  const visibleOrganizations = snapshot.organizations.filter((organization) => !query.trim() || organization.name.toLowerCase().includes(query.toLowerCase()) || organization.slug.toLowerCase().includes(query.toLowerCase()));
  const active = snapshot.activeTenant;

  async function switchTenant(organizationId: string) {
    const result = await adminRepository.switchTenant(snapshot, organizationId);
    setSnapshot(result.data);
    setSaveStatus(`tenant switched via ${result.source}`);
  }

  async function viewAs(role: AdminImpersonationRole) {
    const result = await adminRepository.viewAs(snapshot, role);
    setSnapshot(result.data);
    setSaveStatus(`metadata-only view-as saved via ${result.source}`);
  }

  async function archiveActive() {
    const result = await orgRepo.archive(active.organization.id);
    const next = { ...snapshot, organizations: snapshot.organizations.map((organization) => organization.id === result.data.id ? result.data : organization), organizationStatuses: { ...snapshot.organizationStatuses, [result.data.id]: "archived" as const }, saveStatus: "saved" as const };
    setSnapshot(next);
    setSaveStatus("active organization archived instead of deleted");
  }

  async function restoreActive() {
    const result = await orgRepo.restore(active.organization.id);
    const next = { ...snapshot, organizations: snapshot.organizations.map((organization) => organization.id === result.data.id ? result.data : organization), organizationStatuses: { ...snapshot.organizationStatuses, [result.data.id]: result.data.billing.status }, saveStatus: "saved" as const };
    setSnapshot(next);
    setSaveStatus("active organization restored");
  }

  async function createOrganization() {
    const slug = `created-${Date.now()}`;
    const result = await orgRepo.create({ ...active.organization, name: "Created Admin Org", slug, ownerUserId: "admin-created-owner", memberIds: [], trainerIds: [], gymIds: [], planIds: ["plan-foundation"], billing: { provider: "manual", status: "trialing" }, routing: { subdomains: [slug], customDomains: [] } });
    setSnapshot({ ...snapshot, organizations: [result.data, ...snapshot.organizations], organizationStatuses: { ...snapshot.organizationStatuses, [result.data.id]: "trialing" }, saveStatus: "saved" });
    setSaveStatus("organization created through repository");
  }

  return <main className="dev-page dev-tenancy"><header className="dev-header"><p className="eyebrow">GymCord Developer Verification</p><h1>Admin Platform + Tenant Switching V1</h1><p>Repository-only diagnostics for organization administration, tenant switching, white-label previews, feature visibility, billing state, and metadata-only impersonation without auth or security bypass.</p><div className="button-row"><button type="button" onClick={createOrganization}>Create organization</button><button type="button" onClick={archiveActive}>Archive active</button><button type="button" onClick={restoreActive}>Restore active</button></div></header>
    <section className="status-card"><h2>Runtime</h2>{row("Active provider", snapshot.activeProvider)}{row("Active tenant", `${active.organization.name} (${active.tenantKind})`)}{row("Impersonation target", snapshot.impersonationTarget ? `${snapshot.impersonationTarget.role}: ${snapshot.impersonationTarget.displayName}` : "none")}{row("Pending sync", `${snapshot.pendingSync.length} admin/organization write(s)`)}{row("Save status", saveStatus)}</section>
    <section className="status-card"><h2>Tenant switcher</h2><div className="button-row">{snapshot.organizations.map((organization) => <button type="button" key={organization.id} onClick={() => switchTenant(organization.id)}>{organization.name}</button>)}</div>{row("Branding", `${active.branding.appName} ${active.branding.primaryColor} / ${active.branding.accentColor}`)}{row("Permissions", active.permissions.join(", "))}{row("Enabled features", active.enabledFeatures.join(", "))}{row("Navigation visibility", active.navigation.join(" → "))}{row("Billing state", active.billingState)}<div className="brand-swatch" style={{ background: `linear-gradient(135deg, ${active.branding.primaryColor}, ${active.branding.accentColor})` }} /></section>
    <section className="status-card"><h2>Organization search + status</h2><input aria-label="Organization search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search organizations" />{visibleOrganizations.map((organization) => row(organization.name, `${organization.slug} · ${snapshot.organizationStatuses[organization.id] ?? organization.billing.status}`))}</section>
    <section className="status-card"><h2>Gym management</h2>{row("Gyms", snapshot.gyms.map((gym) => `${gym.name}:${gym.status}`).join("; "))}{row("Trainers", snapshot.trainers.map((trainer) => trainer.name).join("; ") || "none")}{row("Members", snapshot.members.map((member) => member.name).join("; ") || "none")}{row("Subscriptions", snapshot.subscriptions.map((subscription) => `${subscription.planName}:${subscription.billingState}`).join("; "))}{row("Branding", snapshot.organizations.map((organization) => `${organization.name}:${organization.brand.appName}`).join("; "))}{row("Feature flags", Object.entries(snapshot.featureFlags).map(([id, flags]) => `${id}:${(flags as string[]).join("|")}`).join("; "))}</section>
    <section className="status-card"><h2>Metadata-only impersonation</h2><div className="button-row">{(["gym", "trainer", "member"] as AdminImpersonationRole[]).map((role) => <button type="button" key={role} onClick={() => viewAs(role)}>View as {role}</button>)}</div>{snapshot.impersonationTarget && <>{row("Metadata only", String(snapshot.impersonationTarget.metadataOnly))}{row("Security bypass", String(snapshot.impersonationTarget.securityBypass))}{row("Auth bypass", String(snapshot.impersonationTarget.authBypass))}</>}</section>
    <section className="status-card"><h2>Tenant switch history</h2>{snapshot.tenantSwitchHistory.length ? snapshot.tenantSwitchHistory.map((entry) => row(entry.switchedAt, `${entry.fromOrganizationId ?? "none"} → ${entry.toOrganizationId} (${entry.tenantKind})`)) : row("History", "No switches yet")}</section>
  </main>;
}
