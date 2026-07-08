export const GOALS = {
  protein: 130,
  water: 8,
  sleep: 8,
  recovery: 75,
} as const;

export const XP_REWARDS = {
  workoutCompleted: 120,
  proteinGoal: 70,
  waterGoal: 45,
  sleepGoal: 55,
  dailyLogin: 25,
  missionCompletion: 150,
} as const;

export function clampPercentage(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}
