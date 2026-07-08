import { apiClient } from "../api/client";
import { appConfig } from "../config";
import type { AuthRole, AuthSession } from "../auth/types";
import type { DailyLog, Profile } from "../types/gymcord";

export interface OnboardingState {
  profile: Profile | null;
  profileRow: Record<string, unknown> | null;
  complete: boolean;
  savedAt?: string;
}

function roleTable(role?: AuthRole) {
  return role === "trainer" ? "trainerProfiles" : "memberProfiles";
}

export class OnboardingRepository {
  async save(session: AuthSession | null, profile: Profile, dayLog?: DailyLog): Promise<OnboardingState> {
    const savedAt = new Date().toISOString();
    const role = session?.user.roles[0];
    const organizationId = session?.user.activeOrganizationId;
    const body = {
      id: profile.id || crypto.randomUUID(),
      userId: session?.user.id ?? profile.id,
      organizationId,
      displayName: profile.name,
      goals: [profile.goal].filter(Boolean),
      measurements: dayLog?.measurements ?? { weight: profile.currentWeight },
      preferences: { activityLevel: profile.activityLevel, goalWeight: profile.goalWeight, height: profile.height, age: profile.age, gender: profile.gender },
      injuries: [],
      settings: { profilePhoto: profile.profilePhoto, startDate: profile.startDate },
      completedAt: savedAt,
    };

    const result = await apiClient.post<Record<string, unknown>>(`/${roleTable(role)}`, body, { retryAttempts: appConfig.backend.retryAttempts, timeoutMs: appConfig.backend.timeoutMs, queueWhenOffline: true });

    return { profile, profileRow: result.data, complete: true, savedAt };
  }
}

export const onboardingRepository = new OnboardingRepository();
