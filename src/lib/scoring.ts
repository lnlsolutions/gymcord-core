import type { DailyLog } from "../types/gymcord";

export function calculateDailyScore(dayLog: DailyLog, workoutPct: number) {
  let score = 0;

  score += Math.min(40, workoutPct * 0.4);
  score += Math.min(20, Number(dayLog.protein) / 6.5);
  score += Math.min(15, Number(dayLog.water) * 2);
  score += dayLog.photos?.front ? 8 : 0;
  score += dayLog.photos?.side ? 5 : 0;
  score += dayLog.photos?.back ? 7 : 0;
  score += dayLog.measurements?.weight || dayLog.measurements?.glutes ? 5 : 0;

  return Math.min(100, Math.round(score));
}

export function getCoachFeedback(score: number, workoutPct: number, dayLog: DailyLog) {
  if (score >= 85) {
    return "You are reward eligible. Keep consistency high and verify progress with updated photos.";
  }

  if (workoutPct < 50) {
    return "Finish more workouts today. Training consistency is your biggest opportunity.";
  }

  if (dayLog.protein < 100) {
    return "Increase protein closer to 100–130g per day to support muscle growth.";
  }

  if (!dayLog.photos.front) {
    return "Upload your front progress photo to improve progress verification.";
  }

  if (!dayLog.measurements.weight) {
    return "Add measurements so the coach can better track progress.";
  }

  return "You are close. Keep logging meals and training consistently.";
}
