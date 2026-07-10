import { entitlementRepository, featureLabels } from "../../repositories/EntitlementRepository";
import { subscriptionAccessRepository } from "../../repositories/SubscriptionAccessRepository";

export function UpgradePage() {
  const snapshot = subscriptionAccessRepository.loadCurrentAccessSnapshot();
  const current = entitlementRepository.findPlan(snapshot.currentPlan);
  const upgrades = snapshot.upgradesAvailable.map((id) => entitlementRepository.findPlan(id));
  return <main className="dev-page"><header className="dev-header"><p className="eyebrow">Upgrade</p><h1>Metadata-safe plan upgrade</h1><p>Current plan: {current.name}. Upgrade CTAs save intent metadata only; no checkout session is created.</p></header><section className="dev-card"><h2>Available upgrades</h2>{upgrades.map((plan) => <button key={plan.id} type="button">Save upgrade intent for {plan.name}</button>)}</section><section className="dev-card"><h2>Feature comparison</h2><div className="dev-grid">{[current, ...upgrades].map((plan) => <article key={plan.id}><h3>{plan.name}</h3><ul>{Object.entries(featureLabels).map(([key, label]) => <li key={key}>{plan.features.includes(key as keyof typeof featureLabels) ? "✓" : "Locked"} {label}</li>)}</ul></article>)}</div></section><section className="dev-card"><h2>Limit comparison</h2><pre>{JSON.stringify(Object.fromEntries([current, ...upgrades].map((plan) => [plan.name, plan.limits])), null, 2)}</pre></section></main>;
}
