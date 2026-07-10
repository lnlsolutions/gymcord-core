import type { AuthSession } from "../auth/types";
import type { AtlasContext, AtlasConversationEntry, Profile } from "../types/gymcord";
import { AtlasStore } from "../lib/atlasStore";
import { atlasRepository, type AtlasCoachMode, type AtlasSafetyMetadata } from "./AtlasRepository";

export interface AtlasConversationEnvelope { entry: AtlasConversationEntry; coachMode: AtlasCoachMode; userGoal?: string; tenantContext: unknown; trainerContext: unknown; onboardingContext: unknown; memoryMetadata: unknown; safety: AtlasSafetyMetadata; pendingProviderRequest: unknown; failedProviderRequest?: unknown; }

export class AtlasConversationRepository {
  loadHistory() { return AtlasStore.loadConversation(); }
  saveHistory(entries: AtlasConversationEntry[]) { AtlasStore.saveConversation(entries); }
  sendMessage(input: { session: AuthSession | null; profile: Profile; message: string; category?: AtlasConversationEntry["category"]; atlasContext?: AtlasContext; memoryMetadata?: unknown; }) {
    const pendingProviderRequest = atlasRepository.createPendingProviderRequest("chat");
    const mode = atlasRepository.getCoachMode();
    const answer = this.mockResponse(input.message, input.profile, mode, input.atlasContext);
    const entry: AtlasConversationEntry = { id: crypto.randomUUID(), question: input.message, answer, timestamp: new Date().toISOString(), category: input.category ?? "general" };
    const envelope: AtlasConversationEnvelope = { entry, coachMode: mode, userGoal: input.profile.goal, tenantContext: atlasRepository.getTenantContext(input.session), trainerContext: atlasRepository.getTrainerContext(mode), onboardingContext: atlasRepository.getOnboardingContext(input.profile), memoryMetadata: input.memoryMetadata ?? {}, safety: atlasRepository.getSafetyMetadata(mode), pendingProviderRequest };
    this.saveHistory([entry, ...this.loadHistory()].slice(0, 50));
    return envelope;
  }
  private mockResponse(message: string, profile: Profile, mode: AtlasCoachMode, context?: AtlasContext) {
    const goal = profile.goal || "your current goal";
    const prefix = mode === "trainer-assisted" ? "Trainer-assisted draft:" : mode === "gym-member" ? "Gym-member coaching note:" : mode === "admin-debug" ? "Debug mock response:" : "Atlas mock coach:";
    return `${prefix} I can help with ${goal}. Based on ${context?.todayFocus ?? "your current plan"}, start with one safe, specific action today. This is general fitness and nutrition guidance, not medical advice. Your message was: “${message}”.`;
  }
}
export const atlasConversationRepository = new AtlasConversationRepository();
