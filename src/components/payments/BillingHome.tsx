import { paymentRepository } from "../../repositories/PaymentRepository";
import { checkoutRepository } from "../../repositories/CheckoutRepository";
import { subscriptionRepository } from "../../repositories/SubscriptionRepository";
import { PaymentProviderStatus } from "./PaymentProviderStatus";
export function BillingHome() { const status = paymentRepository.getProviderStatus(); const sub = subscriptionRepository.buildSubscriptionMetadata("consumer"); return <main className="screen"><p className="eyebrow">Billing</p><h1>Subscription billing metadata</h1><PaymentProviderStatus status={status} /><section className="panel"><h2>Current subscription</h2><pre>{JSON.stringify(sub, null, 2)}</pre></section><section className="panel"><h2>Offline queue</h2><p>{paymentRepository.getOfflineQueue().length + subscriptionRepository.getOfflineQueue().length + checkoutRepository.getOfflineQueue().length} payment metadata write(s)</p></section></main>; }
