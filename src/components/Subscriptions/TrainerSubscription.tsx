import { subscriptionRepository } from "../../repositories/SubscriptionRepository";
import { SubscriptionPlanCard } from "./SubscriptionPlanCard";
export function TrainerSubscription() { const plan = subscriptionRepository.findPlan("trainer-business"); return <main className="dev-page"><header className="dev-header"><h1>Trainer subscription</h1><p>Business subscription grants coaching access metadata only and never owns member data.</p></header><SubscriptionPlanCard plan={plan} selected /></main>; }
