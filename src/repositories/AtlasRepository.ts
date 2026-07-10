import { appConfig } from "../config";
import type { AuthSession } from "../auth/types";
import type { AtlasMemory, Profile } from "../types/gymcord";
import { saved, save } from "../lib/storage";
import { createBackendProvider } from "../api/client";
import { offlineEngine, type QueuedWrite } from "../services/sync";

export type AtlasCoachMode = "consumer" | "trainer-assisted" | "gym-member" | "admin-debug";
export type AtlasPlanType = "workout" | "nutrition" | "weekly-check-in" | "progress-insight" | "habit-recommendation" | "recovery-recommendation";
export type AtlasProviderMode = "mock" | "provider-metadata-ready";

export interface AtlasSafetyMetadata {
  notMedicalAdvice: boolean;
  emergencyDisclaimer: string;
  trainerReviewRecommended: boolean;
  confidenceLevel: "low" | "medium" | "high";
  escalationNeeded: boolean;
  humanCoachHandoffRecommended: boolean;
}

export interface AtlasTenantContextMetadata { tenantId: string; tenantName: string; ownershipModel: "one-account"; relationshipModel: "metadata-only"; }
export interface AtlasTrainerContextMetadata { trainerId?: string; trainerName?: string; reviewState: "not-requested" | "recommended" | "requested"; relationshipModel: "metadata-only"; }
export interface AtlasOnboardingContextMetadata { completed: boolean; goal?: string; activityLevel?: string; startDate?: string; source: "profile" | "mock"; }
export interface AtlasProviderRequestMetadata { id: string; type: AtlasPlanType | "chat"; mode: AtlasProviderMode; status: "pending" | "failed"; createdAt: string; reason: string; }

export interface AtlasGeneratedPlan { id: string; type: AtlasPlanType; title: string; summary: string; recommendations: string[]; createdAt: string; mode: AtlasCoachMode; safety: AtlasSafetyMetadata; }

export interface AtlasFoundationState {
  activeProvider: string;
  providerStatus: string;
  providerMode: AtlasProviderMode;
  coachMode: AtlasCoachMode;
  tenantContext: AtlasTenantContextMetadata;
  trainerContext: AtlasTrainerContextMetadata;
  onboardingContext: AtlasOnboardingContextMetadata;
  safetyMetadata: AtlasSafetyMetadata;
  pendingProviderRequests: AtlasProviderRequestMetadata[];
  failedProviderRequests: AtlasProviderRequestMetadata[];
  offlineQueue: QueuedWrite[];
  saveStatus: string;
}

const modeKey = "gc.atlas.coachMode";
const statusKey = "gc.atlas.foundationSaveStatus";
const pendingKey = "gc.atlas.pendingProviderRequests";
const failedKey = "gc.atlas.failedProviderRequests";

function orgId(session: AuthSession | null) { return session?.organization?.id ?? session?.user.activeOrganizationId ?? "org-gymcord"; }
function orgName(session: AuthSession | null) { return session?.organization?.name ?? "GymCord Demo Tenant"; }

export const defaultAtlasSafetyMetadata: AtlasSafetyMetadata = {
  notMedicalAdvice: true,
  emergencyDisclaimer: "If this is an emergency or you have chest pain, severe shortness of breath, fainting, or acute injury symptoms, stop and contact emergency services or a qualified clinician.",
  trainerReviewRecommended: true,
  confidenceLevel: "medium",
  escalationNeeded: false,
  humanCoachHandoffRecommended: false,
};

export class AtlasRepository {
  constructor(private readonly backend = createBackendProvider()) {}

  get activeProvider() { return this.backend.name; }
  getProviderStatus() { return this.backend.name === "mock" ? "Mock provider active; live AI calls disabled." : "Provider metadata ready; live AI calls not wired."; }
  getCoachMode() { return saved<AtlasCoachMode>(modeKey, "consumer"); }
  setCoachMode(mode: AtlasCoachMode) { save(modeKey, mode); save(statusKey, `Coach mode saved at ${new Date().toLocaleTimeString()}`); }
  getSaveStatus() { return saved(statusKey, "No Atlas foundation saves yet."); }
  getPendingProviderRequests() { return saved<AtlasProviderRequestMetadata[]>(pendingKey, []); }
  getFailedProviderRequests() { return saved<AtlasProviderRequestMetadata[]>(failedKey, []); }
  getOfflineQueue() { return offlineEngine.getQueue().filter((item) => item.entity.toLowerCase().includes("atlas")); }

  getTenantContext(session: AuthSession | null): AtlasTenantContextMetadata { return { tenantId: orgId(session), tenantName: orgName(session), ownershipModel: "one-account", relationshipModel: "metadata-only" }; }
  getTrainerContext(mode = this.getCoachMode()): AtlasTrainerContextMetadata { return { trainerId: mode === "trainer-assisted" ? "trainer-demo" : undefined, trainerName: mode === "trainer-assisted" ? "Assigned Trainer" : undefined, reviewState: mode === "consumer" ? "recommended" : "not-requested", relationshipModel: "metadata-only" }; }
  getOnboardingContext(profile?: Profile): AtlasOnboardingContextMetadata { return { completed: Boolean(profile?.name && profile?.goal), goal: profile?.goal, activityLevel: profile?.activityLevel, startDate: profile?.startDate, source: profile ? "profile" : "mock" }; }
  getSafetyMetadata(mode = this.getCoachMode()): AtlasSafetyMetadata { return { ...defaultAtlasSafetyMetadata, trainerReviewRecommended: mode !== "consumer", confidenceLevel: mode === "admin-debug" ? "low" : "medium", humanCoachHandoffRecommended: mode === "trainer-assisted" }; }

  createPendingProviderRequest(type: AtlasPlanType | "chat", reason = "Provider mode metadata placeholder; mock mode generated response locally.") {
    const request: AtlasProviderRequestMetadata = { id: crypto.randomUUID(), type, mode: this.backend.name === "mock" ? "mock" : "provider-metadata-ready", status: "pending", createdAt: new Date().toISOString(), reason };
    save(pendingKey, [request, ...this.getPendingProviderRequests()].slice(0, 20));
    return request;
  }

  recordFailedProviderRequest(type: AtlasPlanType | "chat", reason: string) {
    const request: AtlasProviderRequestMetadata = { id: crypto.randomUUID(), type, mode: "provider-metadata-ready", status: "failed", createdAt: new Date().toISOString(), reason };
    save(failedKey, [request, ...this.getFailedProviderRequests()].slice(0, 20));
    return request;
  }

  getFoundationState(session: AuthSession | null, profile?: Profile): AtlasFoundationState {
    const coachMode = this.getCoachMode();
    return { activeProvider: this.activeProvider, providerStatus: this.getProviderStatus(), providerMode: this.backend.name === "mock" ? "mock" : "provider-metadata-ready", coachMode, tenantContext: this.getTenantContext(session), trainerContext: this.getTrainerContext(coachMode), onboardingContext: this.getOnboardingContext(profile), safetyMetadata: this.getSafetyMetadata(coachMode), pendingProviderRequests: this.getPendingProviderRequests(), failedProviderRequests: this.getFailedProviderRequests(), offlineQueue: this.getOfflineQueue(), saveStatus: this.getSaveStatus() };
  }

  describeMemory(memory: AtlasMemory | null) { return { captured: Boolean(memory), goal: memory?.goal ?? "No goal captured", workouts: memory?.workoutHistory.length ?? 0, nutritionDays: memory?.nutritionHistory.length ?? 0, recoveryDays: memory?.recoveryHistory.length ?? 0, prs: memory?.prHistory.length ?? 0 }; }
}

export const atlasRepository = new AtlasRepository();
