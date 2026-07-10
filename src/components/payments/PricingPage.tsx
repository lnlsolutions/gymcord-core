import { subscriptionRepository } from "../../repositories/SubscriptionRepository";
import { paymentRepository } from "../../repositories/PaymentRepository";
import { PaymentProviderStatus } from "./PaymentProviderStatus";
import { SubscriptionPlanCard } from "./SubscriptionPlanCard";
export function PricingPage() { const plans = subscriptionRepository.listPlans().data; return <main className="screen"><p className="eyebrow">GymCord pricing</p><h1>Metadata-ready subscriptions</h1><p>Consumer subscriptions stay independent. Trainer and gym plans grant access only and never own personal data.</p><PaymentProviderStatus status={paymentRepository.getProviderStatus()} /><div className="grid">{plans.map((plan) => <SubscriptionPlanCard key={plan.id} plan={plan} />)}</div><a className="primary-button" href="/subscribe">Prepare subscription metadata</a></main>; }
