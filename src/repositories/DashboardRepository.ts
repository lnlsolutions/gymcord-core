import type { AuthSession } from "../auth/types";
import type { DailyLog, Mission, Profile, StreakSnapshot, XpSnapshot } from "../types/gymcord";
import { DailyActivityRepository, type PersistenceState, dailyActivityRepository } from "./DailyActivityRepository";

export interface DashboardRepositoryState extends PersistenceState {
  loadedVia: "DashboardRepository";
}

export class DashboardRepository {
  constructor(private readonly activityRepository: DailyActivityRepository = dailyActivityRepository) {}

  get providerName() { return this.activityRepository.providerName; }

  getLastSaveStatus() { return this.activityRepository.getLastSaveStatus(); }

  getOfflineQueue() { return this.activityRepository.getOfflineQueue(); }

  async load(session: AuthSession | null): Promise<DashboardRepositoryState> {
    const state = await this.activityRepository.load(session);
    return { ...state, loadedVia: "DashboardRepository" };
  }

  async saveProfile(session: AuthSession | null, profile: Profile): Promise<void> {
    await this.activityRepository.saveProfile(session, profile);
  }

  async saveDailyLog(session: AuthSession | null, log: DailyLog, mission: Mission, xp: XpSnapshot, streak: StreakSnapshot): Promise<void> {
    await this.activityRepository.saveDailyLog(session, log, mission, xp, streak);
  }
}

export const dashboardRepository = new DashboardRepository();
