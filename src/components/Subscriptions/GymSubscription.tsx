import { subscriptionRepository } from "../../repositories/SubscriptionRepository";
import { SubscriptionPlanCard } from "./SubscriptionPlanCard";
export function GymSubscription() { const plan = subscriptionRepository.findPlan("gym-enterprise"); return <main className="dev-page"><header className="dev-header"><h1>Gym subscription</h1><p>Enterprise subscription grants organization access metadata only and never owns member data.</p></header><SubscriptionPlanCard plan={plan} selected /></main>; }
