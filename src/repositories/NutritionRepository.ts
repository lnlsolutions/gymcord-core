import type { AuthSession } from "../auth/types";
import { workouts } from "../lib/program";
import { createEmptyDay, saved } from "../lib/storage";
import { buildDailyMission } from "../lib/engines/missionEngine";
import { buildStreakSnapshot } from "../lib/engines/streakEngine";
import { buildXpSnapshot } from "../lib/engines/xpEngine";
import type { DailyLog } from "../types/gymcord";
import { DailyActivityRepository, dailyActivityRepository } from "./DailyActivityRepository";
import { appConfig } from "../config";

export interface NutritionSaveResult {
  log: DailyLog;
  completionState: "empty" | "in_progress" | "complete";
  xpAward: number;
  missionProgress: number;
  streakCount: number;
  savedAt: string;
}

export class NutritionRepository {
  constructor(private readonly activityRepository: DailyActivityRepository = dailyActivityRepository) {}

  get providerName() { return this.activityRepository.providerName; }
  getLastSaveStatus() { return this.activityRepository.getLastSaveStatus(); }
  getOfflineQueue() { return this.activityRepository.getOfflineQueue(); }

  async loadDay(session: AuthSession | null, date: string) {
    const state = await this.activityRepository.load(session);
    return {
      ...state,
      log: state.logs[date] ?? createEmptyDay(date),
    };
  }

  async saveNutrition(session: AuthSession | null, log: DailyLog): Promise<NutritionSaveResult> {
    const existingLogs = saved<Record<string, DailyLog>>(appConfig.storageKeys.dailyLogs, {});
    const totalExercises = workouts.reduce((sum, workout) => sum + workout.exercises.length, 0);
    const todayWorkout = workouts[new Date(`${log.date}T00:00:00`).getDay() % workouts.length];
    const mergedLogs = { ...existingLogs, [log.date]: log };
    const mission = buildDailyMission({ dayLog: log, todayWorkout, totalExercises });
    const missionHistory = Object.keys(mergedLogs).sort().map((date) => {
      const dayLog = mergedLogs[date] ?? createEmptyDay(date);
      const workout = workouts[new Date(`${date}T00:00:00`).getDay() % workouts.length];
      return buildDailyMission({ dayLog, todayWorkout: workout, totalExercises });
    });
    const previousMission = buildDailyMission({ dayLog: existingLogs[log.date] ?? createEmptyDay(log.date), todayWorkout, totalExercises });
    const xp = buildXpSnapshot(mergedLogs, missionHistory);
    const streak = buildStreakSnapshot(mergedLogs, totalExercises, log.date);

    await this.activityRepository.saveDailyLog(session, log, mission, xp, streak);

    return {
      log,
      completionState: getNutritionCompletionState(log),
      xpAward: Math.max(0, mission.earnedXp - previousMission.earnedXp),
      missionProgress: mission.completionPercentage,
      streakCount: streak.currentStreak,
      savedAt: new Date().toISOString(),
    };
  }
}

export function getNutritionCompletionState(log: DailyLog): NutritionSaveResult["completionState"] {
  const hasAny = log.calories > 0 || log.protein > 0 || log.water > 0 || Boolean(log.ingredients.trim() || log.mealPhoto.trim());
  const complete = log.calories > 0 && log.protein >= 130 && log.water >= 8;
  if (complete) return "complete";
  return hasAny ? "in_progress" : "empty";
}

export const nutritionRepository = new NutritionRepository();
