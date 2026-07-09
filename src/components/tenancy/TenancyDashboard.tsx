import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth";
import { appConfig } from "../../config";
import { tenancyRepository, type TenancySnapshot } from "../../repositories/TenancyRepository";
import { AccountOwnershipPanel } from "./AccountOwnershipPanel";
import { ConsumerSubscriptionPanel } from "./ConsumerSubscriptionPanel";
import { DataAccessRulesPanel } from "./DataAccessRulesPanel";
import { FeatureTogglePanel } from "./FeatureTogglePanel";
import { GymRelationshipPanel } from "./GymRelationshipPanel";
import { InviteAcceptancePanel } from "./InviteAcceptancePanel";
import { JoinPathSelector } from "./JoinPathSelector";
import { RelationshipSwitcher } from "./RelationshipSwitcher";
import { RelationshipTransferPanel } from "./RelationshipTransferPanel";
import { RolePermissionPanel } from "./RolePermissionPanel";
import { TenantBrandingPanel } from "./TenantBrandingPanel";
import { TrainerRelationshipPanel } from "./TrainerRelationshipPanel";
import { WhiteLabelPreview } from "./WhiteLabelPreview";
import { Card, JsonBlock, Rows } from "./TenancyShared";

export function TenancyDashboard() {
  const auth = useAuth();
  const repository = useMemo(() => tenancyRepository, []);
  const userId = auth.session?.user.id ?? "user-demo";
  const [snapshot, setSnapshot] = useState<TenancySnapshot>(() => repository.seedSnapshot(userId));
  const [source, setSource] = useState("seeded samples");
  const [saveStatus, setSaveStatus] = useState("ready");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    repository.loadSnapshot(userId).then((result) => {
      if (!active) return;
      setSnapshot(result.data);
      setSource(result.source);
    }).catch((unknownError: Error) => active && setError(unknownError.message));
    return () => { active = false; };
  }, [repository, userId]);

  function switchTenant(id: string) { setSnapshot((current) => ({ ...current, activeTenantContextId: id, saveStatus: "optimistic tenant switch" })); setSaveStatus("optimistic tenant context updated"); void repository.saveTenantSettings({ userId, activeTenantContextId: id }).then(() => setSaveStatus("tenant context saved")); }
  function switchTrainer(id: string) { setSnapshot((current) => ({ ...current, activeTrainerContextId: id, saveStatus: "optimistic trainer switch" })); setSaveStatus("optimistic trainer context updated"); void repository.saveTenantSettings({ userId, activeTrainerContextId: id }).then(() => setSaveStatus("trainer context saved")); }
  function revoke(id: string) { const timestamp = new Date().toISOString(); setSnapshot((current) => ({ ...current, relationships: current.relationships.map((relationship) => relationship.id === id ? { ...relationship, status: "ended", endedAt: timestamp, revokedAccessMetadata: { revokedAt: timestamp, actor: "user", keepsPersonalHistory: "true" }, updatedAt: timestamp } : relationship), saveStatus: "optimistic revoke" })); setSaveStatus("optimistic revoke/end queued"); void repository.endRelationship(id).then(() => setSaveStatus("relationship ended without hard delete")); }

  return <main className="dev-page">
    <header className="dev-header"><p className="eyebrow">GymCord Developer Verification</p><h1>Multi-tenant identity + white-label foundation</h1><p>Repository-only diagnostics for user-owned identity, gym/trainer access relationships, active context switching, invite metadata, white-label branding, feature toggles, role permissions, data access rules, revocation, and offline queue behavior.</p></header>
    <Card title="Runtime"><Rows rows={[{ label: "Route", value: "/dev/tenancy" }, { label: "Active provider", value: appConfig.backend.provider }, { label: "Repository source", value: source }, { label: "Current user", value: userId }, { label: "Pending sync", value: `${snapshot.pendingSync.length} tenancy item(s)` }, { label: "Offline queue", value: `${repository.getOfflineQueue().length} relationship/settings metadata write(s)` }, { label: "Save status", value: saveStatus }]} /></Card>
    <AccountOwnershipPanel snapshot={snapshot} />
    <JoinPathSelector snapshot={snapshot} />
    <RelationshipSwitcher snapshot={snapshot} onSwitchTenant={switchTenant} onSwitchTrainer={switchTrainer} />
    <GymRelationshipPanel snapshot={snapshot} onRevoke={revoke} />
    <TrainerRelationshipPanel snapshot={snapshot} onRevoke={revoke} />
    <ConsumerSubscriptionPanel snapshot={snapshot} />
    <TenantBrandingPanel snapshot={snapshot} />
    <WhiteLabelPreview snapshot={snapshot} />
    <FeatureTogglePanel snapshot={snapshot} />
    <RolePermissionPanel snapshot={snapshot} />
    <DataAccessRulesPanel snapshot={snapshot} />
    <InviteAcceptancePanel snapshot={snapshot} />
    <RelationshipTransferPanel snapshot={snapshot} />
    {error && <Card title="Load error"><Rows rows={[{ label: "Repository", value: "failed", detail: error }]} /></Card>}
    <Card title="Raw tenancy snapshot"><JsonBlock value={snapshot} /></Card>
  </main>;
}
