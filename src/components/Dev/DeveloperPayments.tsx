import { useMemo, useState } from "react";
import { appConfig } from "../../config";
import type { PaymentAudience } from "../../repositories/PaymentRepository";
import { paymentRepository } from "../../repositories/PaymentRepository";
import { checkoutRepository } from "../../repositories/CheckoutRepository";
import { subscriptionRepository } from "../../repositories/SubscriptionRepository";

function row(label: string, value: string, detail?: string) { return { label, value, detail }; }
function StatusCard({ title, rows }: { title: string; rows: { label: string; value: string; detail?: string }[] }) { return <section className="dev-card"><h2>{title}</h2><div className="dev-grid">{rows.map((item) => <div className="dev-row" key={item.label}><strong>{item.label}</strong><span>{item.value}</span>{item.detail && <small>{item.detail}</small>}</div>)}</div></section>; }

export function DeveloperPayments() {
  const [audience, setAudience] = useState<PaymentAudience>("consumer");
  const plan = subscriptionRepository.findPlan(audience).data;
  const customer = useMemo(() => paymentRepository.buildCustomerMetadata(audience), [audience]);
  const subscription = useMemo(() => subscriptionRepository.buildSubscriptionMetadata(audience), [audience]);
  const checkout = useMemo(() => checkoutRepository.buildCheckoutMetadata(plan, customer, subscription), [plan, customer, subscription]);
  const provider = paymentRepository.getProviderStatus();
  const offlineQueue = [...paymentRepository.getOfflineQueue(), ...subscriptionRepository.getOfflineQueue(), ...checkoutRepository.getOfflineQueue()];
  const [saveStatus, setSaveStatus] = useState("ready");
  async function queueMetadata() { await Promise.all([paymentRepository.saveCustomerMetadata(customer), subscriptionRepository.saveSubscriptionMetadata(subscription), checkoutRepository.saveCheckoutMetadata(checkout)]); setSaveStatus("queued metadata-only writes"); }
  return <main className="dev-page"><header className="dev-header"><p className="eyebrow">GymCord Developer Verification</p><h1>Payments + Subscriptions</h1><p>Validates metadata-only payment foundations. No Stripe or Supabase UI SDKs are imported, no secret keys are present, and secure backend checkout/portal actions remain future integrations.</p><button type="button" onClick={queueMetadata}>Queue metadata</button>{(["consumer", "trainer", "gym"] as PaymentAudience[]).map((item) => <button key={item} type="button" onClick={() => setAudience(item)}>{item}</button>)}</header><StatusCard title="Runtime" rows={[row("Active provider", provider.activeProvider), row("Payment provider status", provider.state, provider.mode), row("Selected plan", plan.name, plan.lookupKey), row("Save status", saveStatus), row("Backend provider", appConfig.backend.provider)]} /><StatusCard title="Safety rules" rows={[row("UI Stripe imports", "not present"), row("UI Supabase imports", "not present"), row("Client-side secret keys", "not present"), row("Direct payment processing", "not present"), row("No hard deletes", "metadata lifecycle only")]} /><StatusCard title="Offline queue" rows={[row("Queued writes", `${offlineQueue.length}`), ...offlineQueue.slice(0, 6).map((item) => row(item.entity, item.status, item.operation))]} /><section className="dev-card"><h2>Checkout metadata</h2><pre>{JSON.stringify(checkout, null, 2)}</pre></section><section className="dev-card"><h2>Customer metadata</h2><pre>{JSON.stringify(customer, null, 2)}</pre></section><section className="dev-card"><h2>Subscription metadata</h2><pre>{JSON.stringify(subscription, null, 2)}</pre></section><section className="dev-card"><h2>Invoice metadata</h2><pre>{JSON.stringify(subscription.invoice, null, 2)}</pre></section><section className="dev-card"><h2>Trial metadata</h2><pre>{JSON.stringify(subscription.trial, null, 2)}</pre></section><section className="dev-card"><h2>Failed payment metadata</h2><pre>{JSON.stringify(subscription.failedPayment, null, 2)}</pre></section><section className="dev-card"><h2>Billing portal metadata</h2><pre>{JSON.stringify(checkout.billingPortal, null, 2)}</pre></section><section className="dev-card"><h2>Cancellation metadata</h2><pre>{JSON.stringify(subscription.cancellation, null, 2)}</pre></section></main>;
}
