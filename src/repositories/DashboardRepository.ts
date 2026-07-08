import type { AuthSession } from "../auth/types";
import { workouts } from "../lib/program";
import { calculateTransformationScore, calculateWorkoutCompletion } from "../lib/scoring";
import { buildAchievements, getNextAchievement } from "../lib/engines/achievementEngine";
import { buildAtlasInsights } from "../lib/engines/atlasEngine";
import { buildDailyMission } from "../lib/engines/missionEngine";
import { buildStreakSnapshot } from "../lib/engines/streakEngine";
import { buildTransformationSnapshot } from "../lib/engines/transformationEngine";
import { buildXpSnapshot } from "../lib/engines/xpEngine";
import { createEmptyDay, getLastSevenDays, todayKey } from "../lib/storage";
import type { Achievement, AtlasInsight, DailyLog, Mission, Profile, StreakSnapshot, TransformationSnapshot, WorkoutDay, XpSnapshot } from "../types/gymcord";
import { dailyActivityRepository, type PersistenceState } from "./DailyActivityRepository";

export interface DashboardData {
  loadedAt: string;
  selectedDate: string;
  profile: Profile;
  dayLog: DailyLog;
  logs: Record<string, DailyLog>;
  todayWorkout: WorkoutDay;
  mission: Mission;
  xp: XpSnapshot;
  streak: StreakSnapshot;
  nextAchievement: Achievement;
  atlasInsights: AtlasInsight[];
  transformation: TransformationSnapshot;
  score: number;
  workoutCompletion: number;
  weeklyCompletion: number;
  repositoryState: PersistenceState;
}

export class DashboardRepository {
  constructor(private readonly activityRepository = dailyActivityRepository) {}

  get providerName() { return this.activityRepository.providerName; }
  getOfflineQueue() { return this.activityRepository.getOfflineQueue(); }
  getLastSaveStatus() { return this.activityRepository.getLastSaveStatus(); }

  async load(session: AuthSession | null, selectedDate = todayKey()): Promise<DashboardData> {
    const repositoryState = await this.activityRepository.load(session);
    const logs = repositoryState.logs;
    const profile = repositoryState.profile;
    const dayLog = logs[selectedDate] || createEmptyDay(selectedDate);
    const totalExercises = workouts.reduce((sum, workout) => sum + workout.exercises.length, 0);
    const todayWorkout = workouts[new Date(`${selectedDate}T00:00:00`).getDay() % workouts.length];
    const workoutCompletion = calculateWorkoutCompletion(dayLog, totalExercises);
    const score = calculateTransformationScore(dayLog, workoutCompletion);
    const dates = Array.from(new Set([...getLastSevenDays(), selectedDate, ...Object.keys(logs)])).sort();
    const missionHistory = dates.map((date) => buildDailyMission({
      dayLog: logs[date] || createEmptyDay(date),
      todayWorkout: workouts[new Date(`${date}T00:00:00`).getDay() % workouts.length],
      totalExercises,
    }));
    const mission = buildDailyMission({ dayLog, todayWorkout, totalExercises });
    const xp = buildXpSnapshot(logs, missionHistory);
    const streak = buildStreakSnapshot(logs, totalExercises, selectedDate);
    const achievements = buildAchievements(missionHistory, streak);
    const nextAchievement = getNextAchievement(achievements);
    const transformation = buildTransformationSnapshot({ logs, startDate: profile.startDate || selectedDate, currentDate: selectedDate, totalExercises, score, mission, xp, streak });
    const weeklyCompletion = Math.round(getLastSevenDays().reduce((sum, date) => sum + calculateWorkoutCompletion(logs[date] || createEmptyDay(date), totalExercises), 0) / 7);

    return { loadedAt: new Date().toISOString(), selectedDate, profile, dayLog, logs, todayWorkout, mission, xp, streak, nextAchievement, atlasInsights: buildAtlasInsights(mission, xp, streak, nextAchievement, transformation), transformation, score, workoutCompletion, weeklyCompletion, repositoryState };
  }
}

export const dashboardRepository = new DashboardRepository();
