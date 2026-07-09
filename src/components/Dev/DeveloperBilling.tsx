import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth";
import { appConfig } from "../../config";
import { billingRepository, type BillingSnapshot } from "../../repositories/BillingRepository";

function row(label: string, value: string, detail?: string) { return { label, value, detail }; }
function StatusCard({ title, rows }: { title: string; rows: { label: string; value: string; detail?: string }[] }) {
  return <section className="dev-card"><h2>{title}</h2><div className="dev-grid">{rows.map((item) => <div className="dev-row" key={item.label}><strong>{item.label}</strong><span>{item.value}</span>{item.detail && <small>{item.detail}</small>}</div>)}</div></section>;
}

export function DeveloperBilling() {
  const auth = useAuth();
  const repository = useMemo(() => billingRepository, []);
  const organizationId = auth.session?.organization?.id ?? "org-demo";
  const [snapshot, setSnapshot] = useState<BillingSnapshot>(() => repository.seedSamples(organizationId));
  const [source, setSource] = useState("seeded samples");
  const [optimisticPreferences, setOptimisticPreferences] = useState("ready");
  const [optimisticArchiveCancel, setOptimisticArchiveCancel] = useState("ready");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    repository.loadSnapshot(organizationId)
      .then((result) => {
        if (!active) return;
        setSource(result.source);
        setSnapshot(result.data);
      })
      .catch((unknownError: Error) => active && setError(unknownError.message));
    return () => { active = false; };
  }, [organizationId, repository]);

  function validateOptimisticPreferences() {
    setSnapshot((current) => ({ ...current, preferences: { ...current.preferences, failedPaymentAlerts: !current.preferences.failedPaymentAlerts, updatedAt: new Date().toISOString() } }));
    setOptimisticPreferences("local billing preference metadata updated before repository reconciliation");
  }

  function validateArchiveCancel() {
    const timestamp = new Date().toISOString();
    setSnapshot((current) => ({ ...current, plans: current.plans.map((plan, index) => index === 0 ? { ...plan, status: "archived", archivedAt: timestamp, updatedAt: timestamp } : plan), subscriptions: current.subscriptions.map((subscription, index) => index === 0 ? { ...subscription, status: "cancelled", cancelAtPeriodEnd: true, cancelledAt: timestamp, updatedAt: timestamp } : subscription) }));
    setOptimisticArchiveCancel("archivePlan and cancelSubscription are default lifecycle actions; no hard delete is used");
  }

  return <main className="dev-page">
    <header className="dev-header"><p className="eyebrow">GymCord Developer Verification</p><h1>Stripe Billing Metadata</h1><p>Repository-only diagnostics for metadata contracts, provider routing, optimistic preference updates, archive/cancel lifecycle behavior, and offline queue boundaries. This screen does not process payments or import Stripe/Supabase client SDKs.</p><button type="button" onClick={validateOptimisticPreferences}>Validate optimistic preferences</button><button type="button" onClick={validateArchiveCancel}>Validate archive/cancel</button></header>
    <StatusCard title="Runtime" rows={[row("Route", "/dev/billing"), row("Active provider", appConfig.backend.provider), row("Repository source", source), row("Supabase environment", appConfig.backend.supabase.url && appConfig.backend.supabase.anonKey ? "configured" : "not configured"), row("Offline queue", `${repository.getOfflineQueue().length} billing preference metadata write(s)`)]} />
    <StatusCard title="Repository capabilities" rows={["loadSnapshot", "seedSamples", "savePreferences", "archivePlan", "cancelSubscription", "getOfflineQueue"].map((name) => row(name, "available", name === "getOfflineQueue" ? "limited to /billingPreferences metadata writes" : undefined))} />
    <StatusCard title="Metadata-only safety" rows={[row("Direct payment processing in UI", "not present"), row("Client-side secret keys", "not present"), row("Stripe SDK imports in UI", "not present"), row("Supabase imports in UI", "not present"), row("Supabase mode", "provider mappings only", "billing paths map through backend provider aliases")]} />
    <StatusCard title="Integration readiness" rows={[row("Member app", snapshot.integrationReadiness.memberApp), row("Trainer Portal", snapshot.integrationReadiness.trainerPortal), row("Admin Dashboard", snapshot.integrationReadiness.adminDashboard), row("Notifications", snapshot.integrationReadiness.notifications), row("Optimistic preferences", optimisticPreferences), row("Archive/cancel default", optimisticArchiveCancel)]} />
    <StatusCard title="Stripe metadata contracts" rows={(Object.entries(snapshot.metadataContracts) as [string, string[]][]).map(([key, fields]) => row(key, "documented", fields.join(", ")))} />
    {error && <StatusCard title="Load Error" rows={[row("Repository", "failed", error)]} />}
    <section className="dev-card"><h2>Billing snapshot</h2><pre>{JSON.stringify(snapshot, null, 2)}</pre></section>
  </main>;
}
