import { useEffect, useMemo, useState } from "react";
import { appConfig } from "../../config";
import { billingRepository, type BillingSnapshot } from "../../repositories/BillingRepository";
import { useAuth } from "../../auth";
import { BillingCard, MetadataList } from "./shared";
import { MembershipPlans } from "./MembershipPlans";
import { SubscriptionStatus } from "./SubscriptionStatus";
import { InvoiceHistory } from "./InvoiceHistory";
import { PaymentMethodPanel } from "./PaymentMethodPanel";
import { BillingPortalPanel } from "./BillingPortalPanel";
import { TrialStatus } from "./TrialStatus";
import { FailedPaymentAlerts } from "./FailedPaymentAlerts";
import { GymPlanManagement } from "./GymPlanManagement";
import { MemberSubscriptionView } from "./MemberSubscriptionView";
import { TrainerBillingView } from "./TrainerBillingView";
import { WebhookEventPanel } from "./WebhookEventPanel";

export function BillingDashboard() {
  const auth = useAuth();
  const repository = useMemo(() => billingRepository, []);
  const [snapshot, setSnapshot] = useState<BillingSnapshot>(() => repository.seedSamples(auth.session?.organization?.id, auth.session?.user.id));
  const [source, setSource] = useState("seeded samples");
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState(snapshot.subscriptions[0]?.id ?? "");
  const [pendingSync, setPendingSync] = useState("ready");
  const [saveStatus, setSaveStatus] = useState("ready");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    repository.loadSnapshot(auth.session?.organization?.id, auth.session?.user.id).then((result) => {
      if (!active) return;
      setSource(result.source);
      setSnapshot(result.data);
      setSelectedSubscriptionId(result.data.subscriptions[0]?.id ?? "");
    }).catch((unknownError: Error) => active && setError(unknownError.message));
    return () => { active = false; };
  }, [auth.session, repository]);

  const selectedSubscription = snapshot.subscriptions.find((item) => item.id === selectedSubscriptionId) ?? snapshot.subscriptions[0];

  function savePreferenceMetadata() {
    const next = { ...snapshot.account.preferences, renewalReminders: !snapshot.account.preferences.renewalReminders, updatedAt: new Date().toISOString() };
    setSnapshot((current) => ({ ...current, account: { ...current.account, preferences: next } }));
    setSaveStatus("optimistic billing preference metadata saved locally");
    void repository.savePreferences(snapshot.account, next).then((result) => {
      setSnapshot((current) => ({ ...current, account: result.data ?? current.account }));
      setSource(result.source);
      setSaveStatus("repository preference save reconciled");
      setPendingSync(`${repository.getOfflineQueue().length} billing preference write(s) queued`);
    }).catch((saveError: Error) => {
      setSaveStatus(`queued or failed: ${saveError.message}`);
      setPendingSync(`${repository.getOfflineQueue().length} billing preference write(s) queued`);
    });
  }

  function archiveFirstPlan() {
    const plan = snapshot.plans[0];
    if (!plan) return;
    setSnapshot((current) => ({ ...current, plans: current.plans.map((item) => item.id === plan.id ? { ...item, status: "archived", deletedAt: new Date().toISOString() } : item) }));
    setSaveStatus("plan archived optimistically; repository uses archive/cancel over hard delete");
  }

  return <main className="dev-page">
    <header className="dev-header"><p className="eyebrow">GymCord Developer Verification</p><h1>Stripe Billing V1</h1><p>Repository-only Stripe Billing metadata for gyms, memberships, trainers, subscriptions, invoices, trials, failed payments, and webhook routing. No payment processing, Stripe SDK, client-side secrets, or Supabase UI imports are used.</p><button type="button" onClick={savePreferenceMetadata}>Toggle renewal reminder preference</button></header>
    <BillingCard title="Runtime"><MetadataList rows={[{ label: "Active provider", value: appConfig.backend.provider }, { label: "Billing account loaded", value: snapshot.account.id }, { label: "Selected subscription", value: selectedSubscription?.id ?? "none", detail: <select value={selectedSubscriptionId} onChange={(event) => setSelectedSubscriptionId(event.target.value)}>{snapshot.subscriptions.map((subscription) => <option key={subscription.id} value={subscription.id}>{subscription.id}</option>)}</select> }, { label: "Invoices loaded", value: snapshot.invoices.length }, { label: "Payment method metadata", value: snapshot.account.paymentMethod ? "loaded" : "not collected" }, { label: "Billing portal metadata", value: snapshot.account.portal.enabled ? "enabled" : "disabled" }, { label: "Trial status", value: selectedSubscription?.trial?.active ? "active" : "inactive" }, { label: "Failed payment alerts", value: snapshot.failedPaymentAlerts.length }, { label: "Webhook metadata", value: snapshot.webhookEvents.length }, { label: "Pending sync", value: pendingSync }, { label: "Offline queue", value: `${repository.getOfflineQueue().length} billing preference write(s)` }, { label: "Save status", value: saveStatus }, { label: "Repository source", value: source }]} /></BillingCard>
    {error && <BillingCard title="Load error"><MetadataList rows={[{ label: "Repository", value: "failed", detail: error }]} /></BillingCard>}
    <SubscriptionStatus subscription={selectedSubscription} />
    <TrialStatus trial={selectedSubscription?.trial} />
    <MembershipPlans plans={snapshot.plans} />
    <GymPlanManagement plans={snapshot.plans} onArchive={archiveFirstPlan} />
    <InvoiceHistory invoices={snapshot.invoices} />
    <PaymentMethodPanel paymentMethod={snapshot.account.paymentMethod} />
    <BillingPortalPanel portal={snapshot.account.portal} />
    <FailedPaymentAlerts alerts={snapshot.failedPaymentAlerts} />
    <MemberSubscriptionView subscription={selectedSubscription} />
    <TrainerBillingView subscriptions={snapshot.subscriptions} />
    <WebhookEventPanel events={snapshot.webhookEvents} />
    <BillingCard title="Snapshot"><pre>{JSON.stringify(snapshot, null, 2)}</pre></BillingCard>
  </main>;
}
