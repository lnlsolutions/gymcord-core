import type { ReactNode } from "react";
import type { DataAccessRule, TenantBranding, TenantRelationship, TenancySnapshot } from "../../repositories/TenancyRepository";

export function Card({ title, children }: { title: string; children: ReactNode }) { return <section className="dev-card"><h2>{title}</h2>{children}</section>; }
export function Rows({ rows }: { rows: { label: string; value: ReactNode; detail?: ReactNode }[] }) { return <div className="dev-grid">{rows.map((row) => <div className="dev-row" key={row.label}><strong>{row.label}</strong><span>{row.value}</span>{row.detail && <small>{row.detail}</small>}</div>)}</div>; }
export function JsonBlock({ value }: { value: unknown }) { return <pre>{JSON.stringify(value, null, 2)}</pre>; }
export function relationshipRows(items: TenantRelationship[]) { return items.map((item) => ({ label: item.displayName, value: `${item.kind} · ${item.status}`, detail: `${item.role} · ${item.permissions.join(", ")}` })); }
export function brandRows(items: TenantBranding[]) { return items.map((brand) => ({ label: brand.brandName, value: `${brand.ownerType} · ${brand.primaryColor} / ${brand.accentColor}`, detail: brand.domain ?? brand.subdomain ?? "default app domain" })); }
export function ruleRows(items: DataAccessRule[]) { return items.map((rule) => ({ label: rule.label, value: `${rule.owner} · ${rule.revoked ? "revoked" : "visible"}`, detail: `exportReady=${rule.exportReady}; visibleTo=${rule.visibleTo.join(",") || "none"}` })); }
export type TenancyPanelProps = { snapshot: TenancySnapshot; onSwitchTenant?: (id: string) => void; onSwitchTrainer?: (id: string) => void; onRevoke?: (id: string) => void; onSaveBranding?: (brand: TenantBranding) => void; saveStatus?: string; };
