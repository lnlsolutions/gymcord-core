import type { EntityId, IsoDateTimeString } from "../types/domain";

export type SubscriptionPlanAudience = "consumer" | "trainer" | "gym";

export interface SubscriptionPlan {
  id: EntityId;
  name: string;
  audience: SubscriptionPlanAudience;
  cadence: "monthly" | "business" | "enterprise";
  priceLabel: string;
  metadata: Record<string, string>;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
}

const now = () => new Date().toISOString();

export class SubscriptionRepository {
  seedPlans(): SubscriptionPlan[] {
    const timestamp = now();
    return [
      { id: "consumer-monthly", name: "Consumer Monthly", audience: "consumer", cadence: "monthly", priceLabel: "$19/mo", metadata: { subscriptionType: "consumer_monthly", relationshipBoundary: "independent_from_trainer_and_gym", ownsMemberData: "user_only", cancellation: "archive_metadata_only" }, createdAt: timestamp, updatedAt: timestamp },
      { id: "trainer-business", name: "Trainer Business", audience: "trainer", cadence: "business", priceLabel: "$99/mo", metadata: { subscriptionType: "trainer_business", accessGrant: "coaching_access_metadata_only", ownsMemberData: "false", cancellation: "archive_metadata_only" }, createdAt: timestamp, updatedAt: timestamp },
      { id: "gym-enterprise", name: "Gym Enterprise", audience: "gym", cadence: "enterprise", priceLabel: "Enterprise", metadata: { subscriptionType: "gym_enterprise", accessGrant: "organization_access_metadata_only", ownsMemberData: "false", cancellation: "archive_metadata_only" }, createdAt: timestamp, updatedAt: timestamp },
    ];
  }

  findPlan(id: EntityId): SubscriptionPlan {
    return this.seedPlans().find((plan) => plan.id === id) ?? this.seedPlans()[0];
  }
}

export const subscriptionRepository = new SubscriptionRepository();
