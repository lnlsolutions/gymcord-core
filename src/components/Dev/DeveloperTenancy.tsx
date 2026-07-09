import { useEffect, useState } from "react";
import { appConfig } from "../../config";
import { tenancyRepository, type TenancySnapshot } from "../../repositories/TenancyRepository";

function row(label: string, value: string) { return <div><span>{label}</span><strong>{value}</strong></div>; }

export function DeveloperTenancy() {
  const [snapshot, setSnapshot] = useState<TenancySnapshot>(() => tenancyRepository.seedSnapshot());
  const [status, setStatus] = useState("seeded");

  useEffect(() => { void tenancyRepository.loadSnapshot().then((result) => { setSnapshot(result.data); setStatus(`loaded from ${result.source}`); }); }, []);

  const validateSwitch = () => {
    const next = { ...snapshot, activeGymId: snapshot.gyms[0].id, activeTrainerId: "trainer-demo" };
    setSnapshot(next);
    setStatus("optimistic tenant/trainer switch validated");
    void tenancyRepository.switchTenantContext(next.activeGymId);
    void tenancyRepository.switchTrainerContext(next.activeTrainerId ?? "trainer-demo");
  };

  const branding = snapshot.branding;
  return <main className="dev-page dev-tenancy"><header className="dev-header"><p className="eyebrow">GymCord Developer Verification</p><h1>Tenancy + White-label Validation</h1><p>Repository-only diagnostics for user-owned accounts, relationship-scoped access, white-label metadata, provider routing, optimistic switching, and archive/end lifecycle behavior.</p><button type="button" onClick={validateSwitch}>Validate optimistic switch</button></header>
    <section className="status-card"><h2>Runtime</h2>{row("Route", "/dev/tenancy")}{row("Active provider", appConfig.backend.provider)}{row("Supabase environment", appConfig.backend.supabase.url && appConfig.backend.supabase.anonKey ? "configured" : "not configured")}{row("Offline queue", `${tenancyRepository.getOfflineQueue().length} relationship/settings/branding metadata write(s)`)}{row("Status", status)}</section>
    <section className="status-card"><h2>White-label preview</h2>{row("Active brand name", branding.activeBrandName)}{row("Logo/media placeholder", branding.logoMediaPlaceholder)}{row("Primary color", branding.primaryColor)}{row("Accent color", branding.accentColor)}{row("Domain/subdomain", `${branding.domain} / ${branding.subdomain}`)}{row("Enabled features", branding.enabledFeatures.join(", "))}{row("Role permissions", Object.entries(branding.rolePermissions).map(([role, permissions]) => `${role}:${(permissions as string[]).join("|")}`).join("; "))}{row("Onboarding path", branding.onboardingPath)}<div className="brand-swatch" style={{ background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.accentColor})` }} /></section>
    <section className="status-card"><h2>User-owned account model</h2>{snapshot.userOwnedAccountModel.map((item) => row(item, "confirmed"))}</section>
    <section className="status-card"><h2>Join paths + metadata</h2>{Object.entries(snapshot.joinPaths).map(([path, metadata]) => row(path, Object.entries(metadata).map(([key, value]) => `${key}: ${value}`).join("; ")))}</section>
    <section className="status-card"><h2>Integration readiness</h2>{Object.entries(snapshot.integrationReadiness).map(([surface, value]) => row(surface, String(value)))}</section>
  </main>;
}
