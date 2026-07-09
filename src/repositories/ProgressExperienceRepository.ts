import type { AuthSession } from "../auth/types";
import type { DailyLog, Mission, StreakSnapshot, XpSnapshot } from "../types/gymcord";
import { DailyActivityRepository, dailyActivityRepository } from "./DailyActivityRepository";

export class ProgressExperienceRepository {
  constructor(private readonly activityRepository: DailyActivityRepository = dailyActivityRepository) {}

  get providerName() { return this.activityRepository.providerName; }

  async saveProgressLog(session: AuthSession | null, log: DailyLog, mission: Mission, xp: XpSnapshot, streak: StreakSnapshot): Promise<void> {
    await this.activityRepository.saveDailyLog(session, log, mission, xp, streak);
  }
}

export const progressExperienceRepository = new ProgressExperienceRepository();
