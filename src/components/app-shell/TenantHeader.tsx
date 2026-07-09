import type { AppShellSnapshot } from "../../repositories/AppShellRepository";
import { ActiveBrandBadge } from "./ActiveBrandBadge";

export function TenantHeader({ snapshot }: { snapshot: AppShellSnapshot }) {
  return <header className="tenant-header"><div><p className="eyebrow">{snapshot.provider} provider · beta shell</p><h1>{snapshot.activeTenant.name}</h1><p>Active {snapshot.activeTenant.role} context {snapshot.activeTrainer ? `with ${snapshot.activeTrainer.name}` : "without assigned trainer"}</p></div><ActiveBrandBadge brand={snapshot.activeBrand} /></header>;
}
