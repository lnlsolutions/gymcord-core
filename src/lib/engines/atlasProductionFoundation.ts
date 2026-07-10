import type { AtlasConversationEntry, AtlasMemory } from "../../types/gymcord";

export type AtlasCoachMode = "consumer_self_coaching" | "trainer_assisted_coaching" | "gym_member_coaching" | "admin_debug_mode";
export type AtlasProviderStatus = "mock_active" | "provider_metadata_ready" | "provider_request_pending" | "provider_request_failed";

export interface AtlasSafetyMetadata {
  notMedicalAdvice: boolean;
  emergencyDisclaimer: string;
  trainerReviewRecommended: boolean;
  confidenceLevel: "low" | "medium" | "high";
  escalationNeeded: boolean;
  humanCoachHandoffRecommended: boolean;
}

export interface AtlasProviderRequestMetadata {
  id: string;
  status: "pending" | "failed";
  provider: string;
  reason: string;
  createdAt: string;
}

export interface AtlasFoundationMetadata {
  coachMode: AtlasCoachMode;
  userGoal: string;
  tenantContext: { tenantId: string; relationship: "metadata_only"; ownershipModel: "one_account_user_owned" };
  trainerContext: { trainerId?: string; relationship: "metadata_only"; reviewRecommended: boolean };
  onboardingContext: { completed: boolean; source: string };
  memory: AtlasMemory;
  pendingProviderRequests: AtlasProviderRequestMetadata[];
  failedProviderRequests: AtlasProviderRequestMetadata[];
  safety: AtlasSafetyMetadata;
}

export interface AtlasGeneratedPlans {
  workoutPlan: string;
  nutritionPlan: string;
  weeklyCheckInSummary: string;
  progressInsight: string;
  habitRecommendation: string;
  recoveryRecommendation: string;
}

export const atlasCoachModes: AtlasCoachMode[] = [
  "consumer_self_coaching",
  "trainer_assisted_coaching",
  "gym_member_coaching",
  "admin_debug_mode",
];

export const atlasSafetyMetadata: AtlasSafetyMetadata = {
  notMedicalAdvice: true,
  emergencyDisclaimer: "If you may be experiencing a medical emergency, contact local emergency services immediately.",
  trainerReviewRecommended: true,
  confidenceLevel: "medium",
  escalationNeeded: false,
  humanCoachHandoffRecommended: true,
};

export function buildAtlasFoundationMetadata({
  memory,
  provider,
  userGoal,
  coachMode = "consumer_self_coaching",
}: {
  memory: AtlasMemory;
  provider: string;
  userGoal: string;
  coachMode?: AtlasCoachMode;
}): AtlasFoundationMetadata {
  const now = new Date().toISOString();
  return {
    coachMode,
    userGoal: userGoal || memory.goal || "general fitness",
    tenantContext: { tenantId: "org-gymcord", relationship: "metadata_only", ownershipModel: "one_account_user_owned" },
    trainerContext: { relationship: "metadata_only", reviewRecommended: true },
    onboardingContext: { completed: Boolean(memory.name || memory.goal), source: "local_profile" },
    memory,
    pendingProviderRequests: provider === "mock" ? [] : [{ id: `pending-${now}`, status: "pending", provider, reason: "Provider mode is metadata-ready only; live AI calls are not enabled.", createdAt: now }],
    failedProviderRequests: [],
    safety: atlasSafetyMetadata,
  };
}

export function buildMockAtlasPlans(memory: AtlasMemory): AtlasGeneratedPlans {
  const goal = memory.goal || "your current fitness goal";
  return {
    workoutPlan: `Mock workout plan: complete a balanced strength session aligned to ${goal}, then log effort and recovery notes.`,
    nutritionPlan: "Mock nutrition plan: prioritize protein, hydration, and balanced meals without prescribing medical diets.",
    weeklyCheckInSummary: `Mock weekly check-in: ${memory.workoutHistory.length} workouts and ${memory.nutritionHistory.length} nutrition logs are available for review.`,
    progressInsight: "Mock progress insight: consistency and logged recovery signals are the primary trend inputs.",
    habitRecommendation: "Mock habit recommendation: schedule one small repeatable training, nutrition, or recovery action today.",
    recoveryRecommendation: "Mock recovery recommendation: use sleep, hydration, mobility, and human coach review when pain or concern appears.",
  };
}

export function attachAtlasMetadata(entry: AtlasConversationEntry, metadata: AtlasFoundationMetadata): AtlasConversationEntry {
  return { ...entry, metadata };
}
