import type { SubscriptionPlanMetadata } from "../../repositories/SubscriptionRepository";
export function SubscriptionPlanCard({ plan, selected, onSelect }: { plan: SubscriptionPlanMetadata; selected?: boolean; onSelect?: () => void }) {
  return <section className="card"><p className="eyebrow">{plan.audience}</p><h2>{plan.name}</h2><strong>{plan.displayPrice}</strong><p>{plan.description}</p><ul>{plan.features.map((feature) => <li key={feature}>{feature}</li>)}</ul><small>Trial: {plan.trialDays} days · {plan.lookupKey}</small>{onSelect && <button className="primary-button" type="button" onClick={onSelect}>{selected ? "Selected" : "Select metadata"}</button>}</section>;
}
