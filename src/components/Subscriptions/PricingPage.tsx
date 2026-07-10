import { useState } from "react";
import { subscriptionRepository, type SubscriptionPlan } from "../../repositories/SubscriptionRepository";
import { SubscriptionPlanCard } from "./SubscriptionPlanCard";

export function PricingPage() {
  const [selected, setSelected] = useState<SubscriptionPlan>(() => subscriptionRepository.seedPlans()[0]);
  const plans = subscriptionRepository.seedPlans();
  return <main className="dev-page"><header className="dev-header"><p className="eyebrow">Pricing</p><h1>Subscription metadata plans</h1><p>Mock, metadata-safe pricing preview. No payment processing or checkout session creation occurs in the UI.</p></header><div className="dev-grid">{plans.map((plan) => <SubscriptionPlanCard key={plan.id} plan={plan} selected={selected.id === plan.id} onSelect={setSelected} />)}</div></main>;
}
