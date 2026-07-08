import type { DailyLog, Mission, XpSnapshot } from "../../types/gymcord";
import { XP_REWARDS, clampPercentage } from "./constants";

const BASE_LEVEL_XP = 260;
const LEVEL_CURVE = 90;

export function xpRequiredForLevel(level: number) {
  return BASE_LEVEL_XP + Math.max(0, level - 1) * LEVEL_CURVE;
}

export function calculateDailyXp(dayLog: DailyLog, mission: Mission) {
  return XP_REWARDS.dailyLogin + mission.earnedXp;
}

export function buildXpSnapshot(logs: Record<string, DailyLog>, missions: Mission[]): XpSnapshot {
  let currentXp = missions.reduce((sum, mission) => sum + calculateDailyXp(logs[mission.date], mission), 0);
  let currentLevel = 1;
  let needed = xpRequiredForLevel(currentLevel);

  while (currentXp >= needed) {
    currentXp -= needed;
    currentLevel += 1;
    needed = xpRequiredForLevel(currentLevel);
  }

  return {
    totalXp: missions.reduce((sum, mission) => sum + calculateDailyXp(logs[mission.date], mission), 0),
    currentXp,
    currentLevel,
    xpNeededForNextLevel: needed,
    progressPercentage: clampPercentage((currentXp / needed) * 100),
  };
}
