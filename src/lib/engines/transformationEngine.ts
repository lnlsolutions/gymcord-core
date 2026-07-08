import type { DailyLog, Mission, StreakSnapshot, TransformationSnapshot, XpSnapshot } from "../../types/gymcord";
import { buildMomentumSnapshot } from "./momentumEngine";
import { buildPrediction } from "./predictionEngine";
import { buildProgressSnapshot, projectDate } from "./progressEngine";

export function buildTransformationSnapshot(input: {
  logs: Record<string, DailyLog>;
  startDate: string;
  currentDate: string;
  totalExercises: number;
  score: number;
  mission: Mission;
  xp: XpSnapshot;
  streak: StreakSnapshot;
}): TransformationSnapshot {
  const progress = buildProgressSnapshot(input.logs, input.startDate, input.currentDate, input.totalExercises);
  const momentum = buildMomentumSnapshot(input.score, input.mission, input.xp, input.streak);
  const prediction = buildPrediction({
    consistency: progress.consistency,
    workoutCompletion: progress.workoutCompletion,
    nutrition: progress.nutrition,
    recovery: progress.recovery,
    streak: input.streak.currentStreak,
    currentMomentum: momentum.momentum,
    loggedDays: progress.dayNumber,
  });

  const weightDelta = prediction.projected90DayWeightChange / 90;
  const milestones = [
    { label: "Day 1", days: 0 },
    { label: "Current Day", days: progress.dayNumber - 1 },
    { label: "Projected 30 Days", days: 30 },
    { label: "Projected 90 Days", days: 90 },
    { label: "Projected 1 Year", days: 365 },
  ].map((milestone) => ({
    label: milestone.label,
    date: milestone.days <= progress.dayNumber ? input.currentDate : projectDate(input.currentDate, milestone.days),
    weight: Number((progress.currentWeight - Math.max(0, milestone.days - progress.dayNumber) * weightDelta).toFixed(1)),
    bodyFat: Math.max(12, Number((progress.estimatedBodyFat - milestone.days * 0.018).toFixed(1))),
    strengthProgress: Math.min(100, Math.round(progress.strengthProgress + milestone.days * 0.08)),
    workoutCompletion: Math.min(100, Math.round(progress.workoutCompletion + milestone.days * 0.03)),
    consistency: Math.min(100, Math.round(progress.consistency + milestone.days * 0.025)),
    xpGrowth: Math.round(input.xp.totalXp + milestone.days * (input.mission.earnedXp || 45)),
    missionCompletion: Math.min(100, Math.round(progress.missionCompletion + milestone.days * 0.02)),
    atlasConfidenceScore: milestone.label === "Current Day" ? prediction.confidence : Math.min(97, Math.round(prediction.confidence + milestone.days * 0.03)),
  }));

  return { progress, momentum, prediction, milestones };
}
