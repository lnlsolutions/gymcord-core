import type { DailyLog, StreakSnapshot } from "../../types/gymcord";
import { calculateWorkoutCompletion } from "../scoring";
import { getLastSevenDays, todayKey } from "../storage";

export function isActiveDay(log: DailyLog | undefined, totalExercises: number) {
  if (!log) return false;
  return calculateWorkoutCompletion(log, totalExercises) >= 100 || log.protein >= 130 || log.water >= 8;
}

export function buildStreakSnapshot(logs: Record<string, DailyLog>, totalExercises: number, today = todayKey()): StreakSnapshot {
  const dates = Object.keys(logs).sort();
  let longestStreak = 0;
  let running = 0;

  dates.forEach((date) => {
    if (isActiveDay(logs[date], totalExercises)) {
      running += 1;
      longestStreak = Math.max(longestStreak, running);
    } else {
      running = 0;
    }
  });

  let currentStreak = 0;
  const cursor = new Date(`${today}T00:00:00`);
  while (isActiveDay(logs[cursor.toISOString().slice(0, 10)], totalExercises)) {
    currentStreak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  const weeklyCalendar = getLastSevenDays().map((date) => ({ date, active: isActiveDay(logs[date], totalExercises), missed: date < today && !isActiveDay(logs[date], totalExercises) }));

  return { currentStreak, longestStreak: Math.max(longestStreak, currentStreak), weeklyCalendar, streakInDanger: !isActiveDay(logs[today], totalExercises) };
}
