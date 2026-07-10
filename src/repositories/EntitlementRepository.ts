import type { EntityId, IsoDateTimeString } from "../types/domain";

export type PlanAudience = "consumer" | "trainer" | "gym";
export type PlanId = "consumer-free" | "consumer-pro" | "trainer-starter" | "trainer-growth" | "trainer-pro" | "gym-team" | "gym-enterprise";
export type FeatureKey = "workout_builder" | "nutrition" | "atlas_ai" | "messaging" | "community" | "progress" | "check_ins" | "exercise_library" | "trainer_dashboard" | "admin" | "white_label" | "api_access" | "analytics" | "calendar" | "challenges";
export type LimitKey = "seatCount" | "memberLimit" | "trainerLimit" | "gymLimit" | "apiLimit" | "storageLimit" | "messageLimit" | "aiTokenLimit";
export type AccessDecisionReason = "allowed" | "locked" | "upgrade_required" | "limit_reached";

export interface PlanLimits { seatCount: number; memberLimit: number; trainerLimit: number; gymLimit: number; apiLimit: number; storageLimit: number; messageLimit: number; aiTokenLimit: number; }
export type UsageSnapshot = PlanLimits;
export interface EntitlementPlan { id: PlanId; name: string; audience: PlanAudience; tier: string; features: FeatureKey[]; limits: PlanLimits; upgradeTo: PlanId[]; metadata: Record<string, string>; }
export interface FeatureAccessDecision { feature: FeatureKey; allowed: boolean; locked: boolean; upgradeRequired: boolean; limitReached: boolean; currentUsage: number; applicablePlan: PlanId; ownershipScope: string; reason: AccessDecisionReason; }

export const featureLabels: Record<FeatureKey, string> = {
  workout_builder: "Workout Builder", nutrition: "Nutrition", atlas_ai: "Atlas AI", messaging: "Messaging", community: "Community", progress: "Progress", check_ins: "Check-ins", exercise_library: "Exercise Library", trainer_dashboard: "Trainer Dashboard", admin: "Admin", white_label: "White Label", api_access: "API Access", analytics: "Analytics", calendar: "Calendar", challenges: "Challenges",
};

const allFeatures = Object.keys(featureLabels) as FeatureKey[];
const limits = (seatCount: number, memberLimit: number, trainerLimit: number, gymLimit: number, apiLimit: number, storageLimit: number, messageLimit: number, aiTokenLimit: number): PlanLimits => ({ seatCount, memberLimit, trainerLimit, gymLimit, apiLimit, storageLimit, messageLimit, aiTokenLimit });

export class EntitlementRepository {
  listPlans(): EntitlementPlan[] {
    return [
      { id: "consumer-free", name: "Free", audience: "consumer", tier: "Free", features: ["nutrition", "progress", "exercise_library", "community", "challenges"], limits: limits(1, 1, 0, 0, 100, 1, 25, 0), upgradeTo: ["consumer-pro"], metadata: { ownershipScope: "consumer owns personal data", providerMode: "metadata_ready_mock" } },
      { id: "consumer-pro", name: "Pro", audience: "consumer", tier: "Pro", features: ["workout_builder", "nutrition", "atlas_ai", "messaging", "community", "progress", "check_ins", "exercise_library", "analytics", "calendar", "challenges"], limits: limits(1, 1, 0, 0, 1000, 10, 500, 100000), upgradeTo: ["trainer-starter", "gym-team"], metadata: { ownershipScope: "consumer owns personal data", aiTokens: "metadata_only" } },
      { id: "trainer-starter", name: "Starter", audience: "trainer", tier: "Starter", features: ["workout_builder", "nutrition", "atlas_ai", "messaging", "progress", "check_ins", "exercise_library", "trainer_dashboard", "analytics", "calendar"], limits: limits(2, 15, 1, 0, 2500, 25, 1500, 250000), upgradeTo: ["trainer-growth", "trainer-pro"], metadata: { ownershipScope: "trainer owns workspace access only; never member personal data" } },
      { id: "trainer-growth", name: "Growth", audience: "trainer", tier: "Growth", features: ["workout_builder", "nutrition", "atlas_ai", "messaging", "community", "progress", "check_ins", "exercise_library", "trainer_dashboard", "api_access", "analytics", "calendar", "challenges"], limits: limits(5, 75, 3, 0, 10000, 100, 7500, 1000000), upgradeTo: ["trainer-pro", "gym-team"], metadata: { ownershipScope: "trainer owns workspace access only; never member personal data" } },
      { id: "trainer-pro", name: "Pro", audience: "trainer", tier: "Pro", features: allFeatures.filter((feature) => feature !== "white_label" && feature !== "admin"), limits: limits(10, 250, 8, 0, 25000, 250, 25000, 2500000), upgradeTo: ["gym-team", "gym-enterprise"], metadata: { ownershipScope: "trainer owns workspace access only; never member personal data" } },
      { id: "gym-team", name: "Team", audience: "gym", tier: "Team", features: allFeatures.filter((feature) => feature !== "white_label"), limits: limits(25, 1000, 25, 1, 100000, 1000, 100000, 5000000), upgradeTo: ["gym-enterprise"], metadata: { ownershipScope: "gym owns tenant access only; never member personal data" } },
      { id: "gym-enterprise", name: "Enterprise", audience: "gym", tier: "Enterprise", features: allFeatures, limits: limits(250, 10000, 250, 25, 1000000, 10000, 1000000, 50000000), upgradeTo: [], metadata: { ownershipScope: "gym owns tenant access only; never member personal data", whiteLabel: "metadata_only" } },
    ];
  }
  findPlan(id: EntityId): EntitlementPlan { return this.listPlans().find((plan) => plan.id === id) ?? this.listPlans()[0]; }
  listFeatureLabels() { return featureLabels; }
  evaluateFeature(planId: PlanId, feature: FeatureKey, usage: UsageSnapshot): FeatureAccessDecision {
    const plan = this.findPlan(planId); const allowed = plan.features.includes(feature); const limitKey = feature === "api_access" ? "apiLimit" : feature === "messaging" ? "messageLimit" : feature === "atlas_ai" ? "aiTokenLimit" : "seatCount"; const limitReached = usage[limitKey] >= plan.limits[limitKey];
    return { feature, allowed: allowed && !limitReached, locked: !allowed, upgradeRequired: !allowed, limitReached: allowed && limitReached, currentUsage: usage[limitKey], applicablePlan: plan.id, ownershipScope: plan.metadata.ownershipScope, reason: !allowed ? "upgrade_required" : limitReached ? "limit_reached" : "allowed" };
  }
}
export const entitlementRepository = new EntitlementRepository();
export const entitlementTimestamp = (): IsoDateTimeString => new Date().toISOString();
