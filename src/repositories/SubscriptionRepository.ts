import { offlineEngine, type QueuedWrite } from "../services/sync";
import type { EntityId, IsoDateTimeString } from "../types/domain";
import type { RepositoryResult } from "./base";
import type { PaymentAudience } from "./PaymentRepository";

export type PlanInterval = "month" | "year" | "enterprise";
export type SubscriptionLifecycleStatus = "not_started" | "trialing" | "active" | "past_due" | "paused" | "cancel_at_period_end" | "cancelled";

export interface SubscriptionPlanMetadata {
  id: EntityId;
  audience: PaymentAudience;
  name: string;
  description: string;
  interval: PlanInterval;
  displayPrice: string;
  lookupKey: string;
  trialDays: number;
  features: string[];
  metadata: Record<string, string>;
}

export interface SubscriptionMetadata {
  id: EntityId;
  audience: PaymentAudience;
  planId: EntityId;
  userId: EntityId;
  organizationId?: EntityId;
  status: SubscriptionLifecycleStatus;
  trial: { eligible: boolean; days: number; startsAt?: IsoDateTimeString; endsAt?: IsoDateTimeString; metadata: Record<string, string> };
  coupon: { code?: string; promotionId?: string; metadata: Record<string, string> };
  invoice: { latestInvoiceId?: string; status: "draft" | "open" | "paid" | "failed"; metadata: Record<string, string> };
  failedPayment: { lastFailedAt?: IsoDateTimeString; retryCount: number; metadata: Record<string, string> };
  cancellation: { cancelAtPeriodEnd: boolean; cancelledAt?: IsoDateTimeString; reason?: string; metadata: Record<string, string> };
  upgradeDowngrade: { fromPlanId?: EntityId; toPlanId?: EntityId; effectiveAt?: IsoDateTimeString; metadata: Record<string, string> };
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
}

const subscriptionsPath = "/paymentSubscriptions";
const now = () => new Date().toISOString();

export class SubscriptionRepository {
  listPlans(): RepositoryResult<SubscriptionPlanMetadata[]> { return { data: plans, source: "mock" }; }
  findPlan(audience: PaymentAudience): RepositoryResult<SubscriptionPlanMetadata> { return { data: plans.find((plan) => plan.audience === audience) ?? plans[0], source: "mock" }; }
  buildSubscriptionMetadata(audience: PaymentAudience, userId: EntityId = "user-demo", couponCode = "FOUNDATION"): SubscriptionMetadata {
    const plan = this.findPlan(audience).data;
    const timestamp = now();
    return {
      id: `sub-${audience}-${userId}`,
      audience,
      planId: plan.id,
      userId,
      organizationId: audience === "consumer" ? undefined : "org-demo",
      status: "trialing",
      trial: { eligible: true, days: plan.trialDays, startsAt: timestamp, endsAt: new Date(Date.now() + plan.trialDays * 86400000).toISOString(), metadata: { trialSource: "pricing_foundation", requiresBackendActivation: "true" } },
      coupon: { code: couponCode, promotionId: `promo-${audience}`, metadata: { promoValidation: "backend_required", clientDiscountCalculation: "disabled" } },
      invoice: { status: "draft", metadata: { invoiceCreation: "backend_required", taxCalculation: "backend_required" } },
      failedPayment: { retryCount: 0, metadata: { dunningWorkflow: "future_backend_webhook", accessGracePeriod: "metadata_only" } },
      cancellation: { cancelAtPeriodEnd: false, metadata: { hardDelete: "never", cancellationAction: "metadata_until_backend" } },
      upgradeDowngrade: { toPlanId: plan.id, metadata: { proration: "backend_required", relationshipOwnership: plan.metadata.dataOwnership } },
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  }
  async saveSubscriptionMetadata(input: SubscriptionMetadata): Promise<RepositoryResult<SubscriptionMetadata>> {
    const payload = { ...input, updatedAt: now() };
    offlineEngine.queueWrite({ entity: subscriptionsPath, operation: "create", payload });
    return { data: payload, source: "mock" };
  }
  getOfflineQueue(): QueuedWrite[] { return offlineEngine.getQueue().filter((item) => item.entity === subscriptionsPath || item.entity.startsWith(`${subscriptionsPath}/`)); }
}

export const plans: SubscriptionPlanMetadata[] = [
  { id: "plan-consumer-monthly", audience: "consumer", name: "Consumer Monthly", description: "Independent personal GymCord subscription.", interval: "month", displayPrice: "$19/mo", lookupKey: "consumer_monthly", trialDays: 7, features: ["Mission Control", "Atlas coaching", "Workout, nutrition, and progress tracking"], metadata: { entitlement: "consumer_app", dataOwnership: "consumer_owns_personal_data", relationshipIndependence: "true" } },
  { id: "plan-trainer-business", audience: "trainer", name: "Trainer Business", description: "Business subscription for coaching access grants.", interval: "month", displayPrice: "$99/mo", lookupKey: "trainer_business_monthly", trialDays: 14, features: ["Trainer OS", "Client coaching access grants", "Messaging and check-ins"], metadata: { entitlement: "trainer_os", dataOwnership: "access_grant_only_no_personal_data_ownership", coachingAccess: "grant_only" } },
  { id: "plan-gym-enterprise", audience: "gym", name: "Gym Enterprise", description: "Enterprise subscription for gyms and teams.", interval: "enterprise", displayPrice: "Custom", lookupKey: "gym_enterprise", trialDays: 30, features: ["White-label gyms", "Team roles", "Access grants without owning member data"], metadata: { entitlement: "gym_enterprise", dataOwnership: "access_grant_only_no_personal_data_ownership", gymAccess: "grant_only" } },
];
export const subscriptionRepository = new SubscriptionRepository();
