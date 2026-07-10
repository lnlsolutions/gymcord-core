import { useMemo, useState } from "react";
import type { PaymentAudience } from "../../repositories/PaymentRepository";
import { paymentRepository } from "../../repositories/PaymentRepository";
import { checkoutRepository } from "../../repositories/CheckoutRepository";
import { subscriptionRepository } from "../../repositories/SubscriptionRepository";
import { SubscriptionPlanCard } from "./SubscriptionPlanCard";
import { PaymentProviderStatus } from "./PaymentProviderStatus";
import { CheckoutMetadataPanel } from "./CheckoutMetadataPanel";
import { PaymentStatusPanel } from "./PaymentStatusPanel";

export function SubscribePage({ audience }: { audience?: PaymentAudience }) {
  const plans = subscriptionRepository.listPlans().data;
  const [selected, setSelected] = useState<PaymentAudience>(audience ?? "consumer");
  const plan = subscriptionRepository.findPlan(selected).data;
  const customer = useMemo(() => paymentRepository.buildCustomerMetadata(selected), [selected]);
  const subscription = useMemo(() => subscriptionRepository.buildSubscriptionMetadata(selected), [selected]);
  const checkout = useMemo(() => checkoutRepository.buildCheckoutMetadata(plan, customer, subscription), [plan, customer, subscription]);
  const [saveStatus, setSaveStatus] = useState("metadata not saved");
  async function saveMetadata() { await Promise.all([paymentRepository.saveCustomerMetadata(customer), subscriptionRepository.saveSubscriptionMetadata(subscription), checkoutRepository.saveCheckoutMetadata(checkout)]); setSaveStatus("metadata queued for future secure backend action"); }
  return <main className="screen"><p className="eyebrow">Payments foundation</p><h1>Subscribe</h1><p>No direct payment processing runs in the UI. Select a plan to prepare checkout metadata only.</p><PaymentProviderStatus status={paymentRepository.getProviderStatus()} /><div className="grid">{plans.map((item) => <SubscriptionPlanCard key={item.id} plan={item} selected={item.audience === selected} onSelect={() => setSelected(item.audience)} />)}</div><button className="primary-button" type="button" onClick={saveMetadata}>Queue checkout metadata</button><p>{saveStatus}</p><PaymentStatusPanel customer={customer} subscription={subscription} /><CheckoutMetadataPanel checkout={checkout} /></main>;
}
