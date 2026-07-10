import { subscriptionRepository } from "../../repositories/SubscriptionRepository";
import { SubscriptionPlanCard } from "./SubscriptionPlanCard";
export function SubscribePage() { return <main className="dev-page"><header className="dev-header"><h1>Subscribe</h1><p>Choose a metadata-only subscription path.</p></header><div className="dev-grid">{subscriptionRepository.seedPlans().map((plan) => <SubscriptionPlanCard key={plan.id} plan={plan} />)}</div></main>; }
