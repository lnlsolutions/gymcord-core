import type { Achievement, Mission, XpSnapshot } from "../../types/gymcord";
import type { WorkoutProgressSnapshot } from "./workoutProgressEngine";
import type { PersonalRecord } from "./personalRecordEngine";

export interface CompletionSnapshot {
  xpEarned: number;
  levelProgress: number;
  missionCompletion: number;
  achievementsUnlocked: string[];
  momentumIncrease: number;
  atlasSummary: string;
}

export function buildCompletionSnapshot(progress: WorkoutProgressSnapshot, xp: XpSnapshot, mission: Mission | undefined, achievements: Achievement[], records: PersonalRecord[]): CompletionSnapshot {
  const unlocked = achievements.filter((achievement) => achievement.unlocked).slice(0, 3).map((achievement) => achievement.title);

  return {
    xpEarned: progress.xpEarned,
    levelProgress: xp.progressPercentage,
    missionCompletion: mission?.completionPercentage ?? progress.progressPercentage,
    achievementsUnlocked: [...unlocked, ...records.filter((record) => record.isNew).map((record) => `PR: ${record.title}`)].slice(0, 4),
    momentumIncrease: Math.max(4, Math.round(progress.progressPercentage / 8)),
    atlasSummary: `Atlas logged ${progress.exercisesCompleted}/${progress.totalExercises} exercises, ${progress.setsCompleted} sets, and an estimated ${progress.caloriesEstimate} calories burned.`,
  };
}
