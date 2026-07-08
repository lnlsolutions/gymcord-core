import type { Organization } from "../../types/domain";
import { BrandingEngine } from "../../lib/engines/brandingEngine";
import { PermissionEngine } from "../../lib/engines/permissionEngine";
import type { MembershipRole } from "../../types/domain";

export function OrganizationSettings({ organization, role, onChange }: { organization: Organization; role: MembershipRole; onChange: (organization: Organization) => void; }) {
  const brandPreview = BrandingEngine.preview(organization.brand);
  const canManage = PermissionEngine.can(role, "settings:manage");

  return (
    <section className="page">
      <div className="section-heading">
        <div><p className="eyebrow">Organization</p><h2>Settings</h2></div>
        <span className="pill">{role}</span>
      </div>
      <div className="panel settings-panel">
        <label>App name<input value={organization.brand.appName} disabled={!canManage} onChange={(event) => onChange({ ...organization, brand: { ...organization.brand, appName: event.target.value }, name: event.target.value })} /></label>
        <label>Logo URL<input value={organization.brand.logoUrl ?? ""} disabled={!canManage} onChange={(event) => onChange({ ...organization, brand: { ...organization.brand, logoUrl: event.target.value } })} /></label>
        <label>Primary color<input type="color" value={organization.brand.primaryColor} disabled={!canManage} onChange={(event) => onChange({ ...organization, brand: { ...organization.brand, primaryColor: event.target.value } })} /></label>
        <label>Accent color<input type="color" value={organization.brand.accentColor} disabled={!canManage} onChange={(event) => onChange({ ...organization, brand: { ...organization.brand, accentColor: event.target.value } })} /></label>
        <label>Theme mode<select value={organization.theme.mode} disabled={!canManage} onChange={(event) => onChange({ ...organization, theme: { ...organization.theme, mode: event.target.value as Organization["theme"]["mode"] } })}><option value="dark">Dark mode</option><option value="light">Light mode</option><option value="system">System</option></select></label>
        <label>Typography<input value={organization.brand.typography} disabled={!canManage} onChange={(event) => onChange({ ...organization, brand: { ...organization.brand, typography: event.target.value } })} /></label>
      </div>
      <div className="hero-card brand-preview" style={{ fontFamily: brandPreview.typography }}>
        <span className="pill">Brand preview</span>
        {brandPreview.logoUrl ? <img src={brandPreview.logoUrl} alt={`${brandPreview.appName} logo`} /> : <div className="avatar">{brandPreview.appName.slice(0, 2).toUpperCase()}</div>}
        <h2>{brandPreview.appName}</h2>
        <p>Dynamic tenant branding is applied across logo, colors, typography, and light or dark theme preferences.</p>
        <div className="swatches">{brandPreview.swatches.map((color) => <span key={color} style={{ background: color }} />)}</div>
      </div>
      <div className="panel settings-panel"><h3>Routing readiness</h3><p className="muted">Prepared domains: {organization.routing.subdomains.map((domain) => `${domain}.app`).join(", ")} and {organization.routing.customDomains.join(", ")}.</p></div>
    </section>
  );
}
