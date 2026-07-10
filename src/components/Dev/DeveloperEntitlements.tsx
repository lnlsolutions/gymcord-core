import { useMemo, useState } from "react";
import { useAuth } from "../../auth";
import { subscriptionAccessRepository } from "../../repositories/SubscriptionAccessRepository";
import type { EntitlementOwnerType, EntitlementPlan } from "../../repositories/EntitlementRepository";

function formatLimit(value: number | string) { return typeof value === "number" ? value.toLocaleString() : value.replace(/_/g, " "); }
function card(title: string, rows: { label: string; value: string; detail?: string }[]) { return <section className="dev-card"><h2>{title}</h2><div className="dev-grid">{rows.map((row) => <div className="dev-row" key={row.label}><strong>{row.label}</strong><span>{row.value}</span>{row.detail && <small>{row.detail}</small>}</div>)}</div></section>; }

export function DeveloperEntitlements() {
  const auth = useAuth();
  const [ownerType, setOwnerType] = useState<EntitlementOwnerType>("trainer");
  const [plan, setPlan] = useState<EntitlementPlan>("Starter");
  const tenantName = auth.session?.organization?.name ?? "Demo Tenant";
  const tenantId = auth.session?.organization?.id ?? "tenant-demo";
  const snapshot = useMemo(() => subscriptionAccessRepository.loadAccess({ tenantId, tenantName, ownerType, plan }), [ownerType, plan, tenantId, tenantName]);
  const limits = (Object.entries(snapshot.limits) as [string, number | string][]).map(([key, value]) => ({ label: key, value: formatLimit(value) }));

  function selectOwner(nextOwner: EntitlementOwnerType) {
    setOwnerType(nextOwner);
    setPlan(nextOwner === "consumer" ? "Free" : nextOwner === "trainer" ? "Starter" : "Team");
  }

  return <main className="dev-page">
    <header className="dev-header">
      <p className="eyebrow">GymCord Developer Verification</p>
      <h1>Entitlements</h1>
      <p>Provider-agnostic access foundation for current tenant, plan gates, usage limits, upgrades, mock provider status, and Stripe backend readiness. No checkout sessions, secret keys, Stripe SDK imports, or payment processing are created by this UI.</p>
      <div className="quick-actions">
        {(["consumer", "trainer", "gym"] as EntitlementOwnerType[]).map((owner) => <button type="button" key={owner} onClick={() => selectOwner(owner)}>{owner}</button>)}
        {snapshot.upgradesAvailable.map((upgrade) => <button type="button" key={upgrade.id} onClick={() => setPlan(upgrade.plan)}>Preview {upgrade.plan}</button>)}
      </div>
    </header>
    {card("Tenant and plan", [
      { label: "Current tenant", value: snapshot.tenantName, detail: snapshot.tenantId },
      { label: "Consumer ownership", value: ownerType === "consumer" ? "current" : "available", detail: "Free → Pro" },
      { label: "Trainer ownership", value: ownerType === "trainer" ? "current" : "available", detail: "Starter → Growth → Pro" },
      { label: "Gym ownership", value: ownerType === "gym" ? "current" : "available", detail: "Team → Enterprise" },
      { label: "Current plan", value: `${snapshot.ownerType} ${snapshot.currentPlan.plan}` },
      { label: "Mock provider", value: snapshot.mockProvider ? "enabled" : "disabled" },
    ])}
    {card("Active features", snapshot.activeFeatures.map((feature) => ({ label: feature, value: "enabled" })))}
    {card("Locked features", snapshot.lockedFeatures.length ? snapshot.lockedFeatures.map((feature) => ({ label: feature, value: "upgrade required" })) : [{ label: "All features", value: "enabled" }])}
    {card("Usage", [
      { label: "Seat usage", value: `${snapshot.usage.seats} / ${formatLimit(snapshot.limits.seats)}` },
      { label: "Member usage", value: `${snapshot.usage.members} / ${formatLimit(snapshot.limits.members)}` },
      { label: "Trainer usage", value: `${snapshot.usage.trainers} / ${formatLimit(snapshot.limits.trainers)}` },
      { label: "Gym usage", value: `${snapshot.usage.gyms} / ${formatLimit(snapshot.limits.gyms)}` },
      { label: "Message usage", value: `${snapshot.usage.messagesThisMonth} / ${formatLimit(snapshot.limits.messagesPerMonth)}` },
      { label: "Storage usage", value: `${snapshot.usage.storageGb}GB / ${formatLimit(snapshot.limits.storageGb)}GB` },
    ])}
    {card("Limits", limits)}
    {card("Upgrades available", snapshot.upgradesAvailable.length ? snapshot.upgradesAvailable.map((upgrade) => ({ label: `${upgrade.ownerType} ${upgrade.plan}`, value: `${upgrade.activeFeatures.length} features`, detail: (Object.entries(upgrade.limits) as [string, number | string][]).map(([key, value]) => `${key}: ${formatLimit(value)}`).join(" · ") })) : [{ label: "Top plan", value: "no upgrades available" }])}
    {card("Provider readiness", [
      { label: "Mode", value: snapshot.providerReadiness.mode },
      { label: "Stripe SDK imports", value: String(snapshot.providerReadiness.stripeSdkImports) },
      { label: "Secret keys in frontend", value: String(snapshot.providerReadiness.secretKeysInFrontend) },
      { label: "Checkout creation in UI", value: String(snapshot.providerReadiness.checkoutCreationInUi) },
      { label: "Payment processing in UI", value: String(snapshot.providerReadiness.paymentProcessingInUi) },
      { label: "Backend integration", value: snapshot.providerReadiness.backendIntegration },
    ])}
    <section className="dev-card"><h2>Access decisions</h2><pre>{JSON.stringify(snapshot.decisions, null, 2)}</pre></section>
  </main>;
}
