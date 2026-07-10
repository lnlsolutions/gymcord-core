import { useState } from "react";
import { paymentRepository } from "../../repositories/PaymentRepository";
import { subscriptionRepository } from "../../repositories/SubscriptionRepository";
import { PaymentProviderStatus } from "../Payments/PaymentProviderStatus";
import { PaymentStatusPanel } from "../Payments/PaymentStatusPanel";
import { CheckoutMetadataPanel } from "../Payments/CheckoutMetadataPanel";
import { SubscriptionPlanCard } from "../Subscriptions/SubscriptionPlanCard";

export function DeveloperPayments() {
  const [snapshot, setSnapshot] = useState(() => paymentRepository.seedSnapshot());
  function saveMetadata() { paymentRepository.saveMetadata(snapshot); setSnapshot({ ...snapshot, offlineQueue: paymentRepository.getOfflineQueue(), saveStatus: "queued metadata write only" }); }
  const selectedPlan = subscriptionRepository.findPlan(snapshot.selectedPlanId);
  return <main className="dev-page"><header className="dev-header"><p className="eyebrow">Payments validation</p><h1>Payments + subscriptions metadata</h1><p>Metadata-ready provider mode and mock mode diagnostics. Offline queue stores payment/subscription metadata writes only, never real financial transactions.</p><button type="button" onClick={saveMetadata}>Queue metadata save</button></header><PaymentProviderStatus status={snapshot.providerStatus} /><PaymentStatusPanel status={snapshot.providerStatus} /><SubscriptionPlanCard plan={selectedPlan} selected /><CheckoutMetadataPanel metadata={snapshot.checkout} />{["customerMetadata","subscriptionMetadata","invoiceMetadata","trialMetadata","failedPaymentMetadata","billingPortalMetadata","cancellationMetadata"].map((key) => <section className="dev-card" key={key}><h2>{key}</h2><pre>{JSON.stringify(snapshot[key as keyof typeof snapshot], null, 2)}</pre></section>)}<section className="dev-card"><h2>Offline queue</h2><p>{snapshot.offlineQueue.length} metadata write(s)</p><p>Save status: {snapshot.saveStatus}</p></section></main>;
}
