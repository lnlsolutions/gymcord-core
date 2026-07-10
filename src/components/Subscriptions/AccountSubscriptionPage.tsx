import { entitlementRepository, featureLabels } from "../../repositories/EntitlementRepository";
import { subscriptionAccessRepository } from "../../repositories/SubscriptionAccessRepository";

export function AccountSubscriptionPage() {
  const snapshot = subscriptionAccessRepository.loadCurrentAccessSnapshot();
  const plan = entitlementRepository.findPlan(snapshot.currentPlan);
  return <main className="dev-page"><header className="dev-header"><p className="eyebrow">Account subscription</p><h1>Current subscription metadata</h1><p>License {snapshot.license.licenseId} is {snapshot.license.status} on {plan.name}. <a href="/upgrade">Review upgrades</a></p></header><section className="dev-card"><h2>Current license</h2><pre>{JSON.stringify(snapshot.license, null, 2)}</pre></section><section className="dev-card"><h2>Active features</h2><ul>{snapshot.activeFeatures.map((feature) => <li key={feature}>{featureLabels[feature]}</li>)}</ul></section><section className="dev-card"><h2>Usage and limits</h2><pre>{JSON.stringify({ usage: snapshot.usage, limits: plan.limits }, null, 2)}</pre></section><section className="dev-card"><h2>Subscription status metadata</h2><pre>{JSON.stringify({ status: snapshot.license.status, cancellation: snapshot.license.cancellationMetadata, archive: { archived: snapshot.license.archived, archivedAt: snapshot.license.archivedAt ?? null } }, null, 2)}</pre></section></main>;
}
