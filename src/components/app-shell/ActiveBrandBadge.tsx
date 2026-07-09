import type { AppShellSnapshot } from "../../repositories/AppShellRepository";

export function ActiveBrandBadge({ brand }: { brand: AppShellSnapshot["activeBrand"] }) {
  return <div className="active-brand-badge" style={{ borderColor: brand.primaryColor }}><span style={{ background: brand.accentColor }} /> <strong>{brand.name}</strong><small>{brand.subdomain}</small></div>;
}
