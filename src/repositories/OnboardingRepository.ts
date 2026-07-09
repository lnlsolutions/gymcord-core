import { apiClient } from "../api/client";
import { appConfig } from "../config";
import { offlineEngine } from "../services/sync";
import { keyValueStorage } from "../services/storage";
import type { AuthSession } from "../auth/types";
import type { Profile } from "../types/gymcord";
import type { InvitationRecord } from "./InvitationRepository";

export type OnboardingPath = "consumer" | "trainer" | "gym";
export type RelationshipKind = "none" | "trainer" | "gym";

export interface RelationshipMetadata {
  kind: RelationshipKind;
  tenantId?: string;
  tenantName?: string;
  invitationCode?: string;
  invitationStatus?: InvitationRecord["status"];
  startedAt?: string;
  archivedAt?: string;
}

export interface UniversalOnboardingState {
  id: string;
  userId: string;
  selectedPath: OnboardingPath;
  step: 1 | 2 | 3 | 4;
  profile: Partial<Profile> & { goals?: string[]; units?: "imperial" | "metric"; experience?: string };
  relationship: RelationshipMetadata;
  pendingInvitation?: InvitationRecord | null;
  completedAt?: string;
  updatedAt: string;
}

const storageKey = "gc.publicBeta.onboarding";

export class UniversalOnboardingRepository {
  getLocal(): UniversalOnboardingState {
    return keyValueStorage.get<UniversalOnboardingState>(storageKey, {
      id: crypto.randomUUID(), userId: "pending-account", selectedPath: "consumer", step: 1, profile: {}, relationship: { kind: "none" }, updatedAt: new Date().toISOString(),
    });
  }

  completionPercentage(state = this.getLocal()): number {
    const checks = [state.selectedPath, state.profile.name, state.profile.goals?.length || state.profile.goal, state.profile.units, state.profile.experience, state.relationship.kind, state.completedAt];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }

  async saveDraft(patch: Partial<UniversalOnboardingState>): Promise<UniversalOnboardingState> {
    const next = { ...this.getLocal(), ...patch, profile: { ...this.getLocal().profile, ...patch.profile }, relationship: { ...this.getLocal().relationship, ...patch.relationship }, updatedAt: new Date().toISOString() };
    keyValueStorage.set(storageKey, next);
    offlineEngine.queueWrite({ entity: "/onboardingDrafts", operation: "update", payload: next });
    await apiClient.post("/onboardingDrafts", next, { queueWhenOffline: true, retryAttempts: appConfig.backend.retryAttempts, timeoutMs: appConfig.backend.timeoutMs }).catch(() => undefined);
    return next;
  }

  async complete(session: AuthSession | null): Promise<UniversalOnboardingState> {
    const current = this.getLocal();
    const completed: UniversalOnboardingState = { ...current, userId: session?.user.id ?? current.userId, step: 4, completedAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    keyValueStorage.set(storageKey, completed);
    offlineEngine.queueWrite({ entity: "/accountRelationships", operation: "create", payload: completed.relationship });
    await apiClient.post("/accountOnboarding", completed, { queueWhenOffline: true }).catch(() => undefined);
    return completed;
  }

  async archiveRelationship(): Promise<UniversalOnboardingState> {
    const next = await this.saveDraft({ relationship: { ...this.getLocal().relationship, archivedAt: new Date().toISOString() } });
    offlineEngine.queueWrite({ entity: "/accountRelationships", operation: "update", payload: next.relationship });
    return next;
  }
}

export const universalOnboardingRepository = new UniversalOnboardingRepository();
