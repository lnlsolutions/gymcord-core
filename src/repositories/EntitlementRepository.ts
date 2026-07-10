import { appConfig } from "../config";
import type { EntityId, IsoDateTimeString } from "../types/domain";

export type EntitlementOwnerType = "consumer" | "trainer" | "gym";
export type ConsumerPlan = "Free" | "Pro";
export type TrainerPlan = "Starter" | "Growth" | "Pro";
export type GymPlan = "Team" | "Enterprise";
export type EntitlementPlan = ConsumerPlan | TrainerPlan | GymPlan;

export type EntitlementFeature =
  | "Workout Builder"
  | "Nutrition"
  | "Atlas AI"
  | "Messaging"
  | "Community"
  | "Progress"
  | "Check-ins"
  | "Exercise Library"
  | "Trainer Dashboard"
  | "Admin"
  | "White Label"
  | "API Access"
  | "Analytics"
  | "Calendar"
  | "Challenges";

export interface EntitlementLimits {
  seats: number | "unlimited";
  members: number | "unlimited";
  trainers: number | "unlimited";
  gyms: number | "unlimited";
  apiRequestsPerMonth: number | "unlimited";
  storageGb: number | "unlimited";
  messagesPerMonth: number | "unlimited";
  aiTokensPerMonth: number | "metadata_only" | "unlimited";
}

export interface EntitlementUsage {
  seats: number;
  members: number;
  trainers: number;
  gyms: number;
  apiRequestsThisMonth: number;
  storageGb: number;
  messagesThisMonth: number;
}

export interface EntitlementPlanDefinition {
  id: EntityId;
  ownerType: EntitlementOwnerType;
  plan: EntitlementPlan;
  rank: number;
  activeFeatures: EntitlementFeature[];
  limits: EntitlementLimits;
  featureFlags: Record<string, boolean>;
  metadata: Record<string, string>;
}

export interface EntitlementSnapshot {
  tenantId: EntityId;
  tenantName: string;
  ownerType: EntitlementOwnerType;
  currentPlan: EntitlementPlanDefinition;
  activeFeatures: EntitlementFeature[];
  lockedFeatures: EntitlementFeature[];
  usage: EntitlementUsage;
  limits: EntitlementLimits;
  upgradesAvailable: EntitlementPlanDefinition[];
  mockProvider: boolean;
  providerReadiness: {
    mode: "mock" | "provider_ready";
    stripeSdkImports: false;
    secretKeysInFrontend: false;
    checkoutCreationInUi: false;
    paymentProcessingInUi: false;
    backendIntegration: "future_stripe_backend_only";
  };
  updatedAt: IsoDateTimeString;
}

export const entitlementFeatures: EntitlementFeature[] = ["Workout Builder", "Nutrition", "Atlas AI", "Messaging", "Community", "Progress", "Check-ins", "Exercise Library", "Trainer Dashboard", "Admin", "White Label", "API Access", "Analytics", "Calendar", "Challenges"];

const baseLimits: EntitlementLimits = { seats: 1, members: 1, trainers: 0, gyms: 0, apiRequestsPerMonth: 0, storageGb: 1, messagesPerMonth: 50, aiTokensPerMonth: "metadata_only" };

const plan = (ownerType: EntitlementOwnerType, planName: EntitlementPlan, rank: number, activeFeatures: EntitlementFeature[], limits: EntitlementLimits, metadata: Record<string, string> = {}): EntitlementPlanDefinition => ({
  id: `${ownerType}-${planName.toLowerCase()}`,
  ownerType,
  plan: planName,
  rank,
  activeFeatures,
  limits,
  featureFlags: Object.fromEntries(entitlementFeatures.map((feature) => [feature.replace(/ |-/g, "_").toLowerCase(), activeFeatures.includes(feature)])),
  metadata: { billingProvider: "provider_agnostic", checkout: "backend_future_only", ...metadata },
});

export class EntitlementRepository {
  listPlanDefinitions(): EntitlementPlanDefinition[] {
    return [
      plan("consumer", "Free", 0, ["Progress", "Exercise Library", "Community", "Challenges"], { ...baseLimits }, { ownership: "consumer_owned" }),
      plan("consumer", "Pro", 1, ["Workout Builder", "Nutrition", "Atlas AI", "Messaging", "Community", "Progress", "Check-ins", "Exercise Library", "Analytics", "Calendar", "Challenges"], { ...baseLimits, apiRequestsPerMonth: 1000, storageGb: 10, messagesPerMonth: 1000 }, { ownership: "consumer_owned" }),
      plan("trainer", "Starter", 0, ["Workout Builder", "Messaging", "Progress", "Check-ins", "Exercise Library", "Trainer Dashboard", "Calendar"], { ...baseLimits, seats: 1, members: 25, trainers: 1, storageGb: 25, messagesPerMonth: 2500 }, { ownership: "trainer_owned_workspace" }),
      plan("trainer", "Growth", 1, ["Workout Builder", "Nutrition", "Atlas AI", "Messaging", "Community", "Progress", "Check-ins", "Exercise Library", "Trainer Dashboard", "Analytics", "Calendar", "Challenges"], { ...baseLimits, seats: 5, members: 150, trainers: 5, storageGb: 100, apiRequestsPerMonth: 10000, messagesPerMonth: 15000 }, { ownership: "trainer_owned_workspace" }),
      plan("trainer", "Pro", 2, ["Workout Builder", "Nutrition", "Atlas AI", "Messaging", "Community", "Progress", "Check-ins", "Exercise Library", "Trainer Dashboard", "White Label", "API Access", "Analytics", "Calendar", "Challenges"], { ...baseLimits, seats: 15, members: 500, trainers: 15, storageGb: 500, apiRequestsPerMonth: 50000, messagesPerMonth: 50000 }, { ownership: "trainer_owned_workspace" }),
      plan("gym", "Team", 0, ["Workout Builder", "Nutrition", "Atlas AI", "Messaging", "Community", "Progress", "Check-ins", "Exercise Library", "Trainer Dashboard", "Admin", "Analytics", "Calendar", "Challenges"], { ...baseLimits, seats: 25, members: 1000, trainers: 25, gyms: 1, storageGb: 1000, apiRequestsPerMonth: 100000, messagesPerMonth: 100000 }, { ownership: "gym_owned_tenant" }),
      plan("gym", "Enterprise", 1, entitlementFeatures, { seats: "unlimited", members: "unlimited", trainers: "unlimited", gyms: "unlimited", apiRequestsPerMonth: "unlimited", storageGb: "unlimited", messagesPerMonth: "unlimited", aiTokensPerMonth: "metadata_only" }, { ownership: "gym_owned_tenant" }),
    ];
  }

  getSnapshot(input: { tenantId?: EntityId; tenantName?: string; ownerType?: EntitlementOwnerType; plan?: EntitlementPlan } = {}): EntitlementSnapshot {
    const ownerType = input.ownerType ?? "trainer";
    const definitions = this.listPlanDefinitions().filter((definition) => definition.ownerType === ownerType);
    const currentPlan = definitions.find((definition) => definition.plan === input.plan) ?? definitions[0];
    const activeFeatures = currentPlan.activeFeatures;
    return {
      tenantId: input.tenantId ?? "tenant-demo",
      tenantName: input.tenantName ?? "Demo Tenant",
      ownerType,
      currentPlan,
      activeFeatures,
      lockedFeatures: entitlementFeatures.filter((feature) => !activeFeatures.includes(feature)),
      usage: { seats: 1, members: ownerType === "consumer" ? 1 : 18, trainers: ownerType === "gym" ? 4 : ownerType === "trainer" ? 1 : 0, gyms: ownerType === "gym" ? 1 : 0, apiRequestsThisMonth: 0, storageGb: 2, messagesThisMonth: 42 },
      limits: currentPlan.limits,
      upgradesAvailable: definitions.filter((definition) => definition.rank > currentPlan.rank),
      mockProvider: appConfig.backend.provider === "mock",
      providerReadiness: { mode: appConfig.backend.provider === "mock" ? "mock" : "provider_ready", stripeSdkImports: false, secretKeysInFrontend: false, checkoutCreationInUi: false, paymentProcessingInUi: false, backendIntegration: "future_stripe_backend_only" },
      updatedAt: new Date().toISOString(),
    };
  }
}

export const entitlementRepository = new EntitlementRepository();
