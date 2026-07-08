import type { DailyLog, ProgressSnapshot } from "../../types/gymcord";
import { createEmptyDay } from "../storage";
import { clampPercentage, GOALS } from "./constants";

function numeric(value: string | number | undefined, fallback = 0) {
  const parsed = typeof value === "number" ? value : Number.parseFloat(value || "");
  return Number.isFinite(parsed) ? parsed : fallback;
}

function dateOffset(date: string, days: number) {
  const next = new Date(`${date}T00:00:00`);
  next.setDate(next.getDate() + days);
  return next.toISOString().slice(0, 10);
}

function getRange(startDate: string, endDate: string) {
  const days: string[] = [];
  const cursor = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  while (cursor <= end) {
    days.push(cursor.toISOString().slice(0, 10));
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

export function buildProgressSnapshot(logs: Record<string, DailyLog>, startDate: string, currentDate: string, totalExercises: number): ProgressSnapshot {
  const dates = getRange(startDate, currentDate);
  const activeLogs = dates.map((date) => logs[date] || createEmptyDay(date));
  const logsWithWorkout = activeLogs.filter((log) => Object.values(log.completedExercises).some(Boolean));
  const workoutCompletion = clampPercentage((logsWithWorkout.length / Math.max(1, dates.length)) * 100);
  const missionCompletion = clampPercentage(activeLogs.filter((log) => {
    const exercisePercent = totalExercises ? Object.values(log.completedExercises).filter(Boolean).length / totalExercises : 0;
    return exercisePercent >= 0.6 && log.protein >= GOALS.protein * 0.7 && log.water >= GOALS.water * 0.75;
  }).length / Math.max(1, dates.length) * 100);

  const measurementLogs = activeLogs.filter((log) => numeric(log.measurements.weight) > 0);
  const firstWeight = numeric(measurementLogs[0]?.measurements.weight, numeric(activeLogs[0]?.measurements.weight));
  const currentWeight = numeric(measurementLogs[measurementLogs.length - 1]?.measurements.weight, firstWeight);
  const strengthEntries = activeLogs.flatMap((log) => Object.values(log.weights).map((entry) => numeric(entry)).filter(Boolean));
  const avgStrength = strengthEntries.length ? Math.round(strengthEntries.reduce((sum, value) => sum + value, 0) / strengthEntries.length) : 0;

  const avg = (field: "mood" | "energy" | "sleep") => activeLogs.reduce((sum, log) => sum + numeric(log[field]), 0) / Math.max(1, activeLogs.length);

  return {
    startDate,
    currentDate,
    dayNumber: Math.max(1, dates.length),
    currentWeight,
    startWeight: firstWeight || currentWeight,
    estimatedBodyFat: clampPercentage(32 - Math.max(0, (firstWeight || currentWeight) - currentWeight) * 0.45 - workoutCompletion * 0.05),
    strengthProgress: clampPercentage(avgStrength ? 45 + Math.min(35, avgStrength / 4) : workoutCompletion * 0.5),
    workoutCompletion,
    consistency: clampPercentage((workoutCompletion * 0.46) + (missionCompletion * 0.34) + (avg("energy") / 5) * 20),
    missionCompletion,
    recovery: clampPercentage((avg("sleep") / GOALS.sleep) * 55 + (avg("energy") / 5) * 25 + (avg("mood") / 5) * 20),
    nutrition: clampPercentage(activeLogs.reduce((sum, log) => sum + Math.min(1, log.protein / GOALS.protein), 0) / Math.max(1, activeLogs.length) * 100),
    chartData: activeLogs.map((log) => ({
      date: log.date,
      weight: numeric(log.measurements.weight) || null,
      mood: log.mood,
      energy: log.energy,
      recovery: clampPercentage((log.sleep / GOALS.sleep) * 60 + (log.energy / 5) * 40),
    })),
  };
}

export function projectDate(currentDate: string, targetDays: number) {
  return dateOffset(currentDate, targetDays);
}
