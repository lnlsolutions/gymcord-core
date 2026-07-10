import { subscriptionRepository } from "../../repositories/SubscriptionRepository";
import { SubscriptionPlanCard } from "./SubscriptionPlanCard";
export function ConsumerSubscription() { const plan = subscriptionRepository.findPlan("consumer-monthly"); return <main className="dev-page"><header className="dev-header"><h1>Consumer subscription</h1><p>Independent monthly subscription metadata; trainer and gym relationships never own this member data.</p></header><SubscriptionPlanCard plan={plan} selected /></main>; }
