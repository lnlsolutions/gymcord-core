import { offlineEngine, type QueuedWrite } from "../services/sync";
import type { EntityId, IsoDateTimeString } from "../types/domain";
import type { PaymentAudience, PaymentCustomerMetadata } from "./PaymentRepository";
import type { SubscriptionMetadata, SubscriptionPlanMetadata } from "./SubscriptionRepository";
import type { RepositoryResult } from "./base";

export interface CheckoutSessionMetadata {
  id: EntityId;
  audience: PaymentAudience;
  planId: EntityId;
  status: "draft_metadata" | "queued_for_backend" | "backend_required";
  successUrl: string;
  cancelUrl: string;
  providerSessionId?: string;
  metadata: Record<string, string>;
  customer: PaymentCustomerMetadata;
  subscription: SubscriptionMetadata;
  billingPortal: { returnUrl: string; status: "metadata_only"; metadata: Record<string, string> };
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
}

const checkoutPath = "/paymentCheckouts";
const now = () => new Date().toISOString();

export class CheckoutRepository {
  buildCheckoutMetadata(plan: SubscriptionPlanMetadata, customer: PaymentCustomerMetadata, subscription: SubscriptionMetadata): CheckoutSessionMetadata {
    const timestamp = now();
    return {
      id: `checkout-${plan.audience}-${plan.id}`,
      audience: plan.audience,
      planId: plan.id,
      status: "backend_required",
      successUrl: `/billing?checkout=${plan.audience}&status=success`,
      cancelUrl: `/subscribe/${plan.audience}?status=cancelled`,
      metadata: { lookupKey: plan.lookupKey, secureAction: "create_checkout_session_required", paymentProcessing: "disabled_in_ui", couponCode: subscription.coupon.code ?? "" },
      customer,
      subscription,
      billingPortal: { returnUrl: "/billing", status: "metadata_only", metadata: { secureAction: "create_billing_portal_session_required", portalAccess: "backend_required" } },
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  }
  async saveCheckoutMetadata(input: CheckoutSessionMetadata): Promise<RepositoryResult<CheckoutSessionMetadata>> {
    const payload = { ...input, updatedAt: now(), status: "queued_for_backend" as const };
    offlineEngine.queueWrite({ entity: checkoutPath, operation: "create", payload });
    return { data: payload, source: "mock" };
  }
  getOfflineQueue(): QueuedWrite[] { return offlineEngine.getQueue().filter((item) => item.entity === checkoutPath || item.entity.startsWith(`${checkoutPath}/`)); }
}
export const checkoutRepository = new CheckoutRepository();
