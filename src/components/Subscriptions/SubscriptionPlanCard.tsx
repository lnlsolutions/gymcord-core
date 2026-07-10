import type { SubscriptionPlan } from "../../repositories/SubscriptionRepository";

export function SubscriptionPlanCard({ plan, selected, onSelect }: { plan: SubscriptionPlan; selected?: boolean; onSelect?: (plan: SubscriptionPlan) => void }) {
  return <article className="dev-card">
    <h2>{plan.name}</h2>
    <p className="readiness-score">{plan.priceLabel}</p>
    <p>{plan.metadata.subscriptionType} · {plan.metadata.cancellation}</p>
    <button type="button" onClick={() => onSelect?.(plan)}>{selected ? "Selected" : "Select metadata plan"}</button>
  </article>;
}
