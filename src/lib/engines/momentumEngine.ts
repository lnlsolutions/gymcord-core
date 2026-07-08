import type { Mission, MomentumSnapshot, StreakSnapshot, XpSnapshot } from "../../types/gymcord";
import { clampPercentage } from "./constants";

export function buildMomentumSnapshot(score: number, mission: Mission, xp: XpSnapshot, streak: StreakSnapshot): MomentumSnapshot {
  const momentum = clampPercentage(score * 0.42 + mission.completionPercentage * 0.28 + xp.progressPercentage * 0.14 + Math.min(100, streak.currentStreak * 8) * 0.16);

  return {
    momentum,
    xpPercentage: xp.progressPercentage,
    level: xp.currentLevel,
    streak: streak.currentStreak,
    missionPercentage: mission.completionPercentage,
  };
}
