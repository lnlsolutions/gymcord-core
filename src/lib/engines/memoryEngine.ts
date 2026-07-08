import type { Achievement, AtlasMemory, DailyLog, MemoryWorkoutEntry, Mission, Profile } from "../../types/gymcord";
import { workouts } from "../program";

function numeric(value: string | number | undefined) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function completedExerciseNames(log: DailyLog) {
  return workouts
    .flatMap((day) => day.exercises)
    .filter((exercise) => log.completedExercises[exercise.id])
    .map((exercise) => exercise.name);
}

function extractFavoriteExercises(logs: Record<string, DailyLog>) {
  const counts = new Map<string, number>();

  Object.values(logs).forEach((log) => {
    completedExerciseNames(log).forEach((name) => counts.set(name, (counts.get(name) || 0) + 1));
  });

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => name);
}

function extractInjuries(logs: Record<string, DailyLog>) {
  const injuryTerms = ["injury", "injured", "pain", "sore", "strain", "ache", "tweak", "hurt"];
  const injuries = new Set<string>();

  Object.values(logs).forEach((log) => {
    Object.values(log.notes).forEach((note) => {
      const normalized = note.trim();
      if (injuryTerms.some((term) => normalized.toLowerCase().includes(term))) {
        injuries.add(normalized);
      }
    });
  });

  return [...injuries].slice(0, 6);
}

function buildWorkoutHistory(logs: Record<string, DailyLog>): MemoryWorkoutEntry[] {
  return Object.values(logs)
    .map((log) => ({
      date: log.date,
      completedExercises: completedExerciseNames(log),
      totalVolume: Object.values(log.weights).reduce((sum, weight) => sum + numeric(weight), 0),
      notes: Object.values(log.notes).filter(Boolean),
    }))
    .filter((entry) => entry.completedExercises.length > 0 || entry.notes.length > 0)
    .sort((a, b) => b.date.localeCompare(a.date));
}

function buildPrHistory(logs: Record<string, DailyLog>, nextAchievement?: Achievement) {
  const bestWeights = new Map<string, { exerciseId: string; weight: number; date: string }>();

  Object.values(logs).forEach((log) => {
    Object.entries(log.weights).forEach(([exerciseId, weightValue]) => {
      const weight = numeric(weightValue);
      const existing = bestWeights.get(exerciseId);
      if (weight > 0 && (!existing || weight > existing.weight)) {
        bestWeights.set(exerciseId, { exerciseId, weight, date: log.date });
      }
    });
  });

  const exerciseLookup = new Map(workouts.flatMap((day) => day.exercises).map((exercise) => [exercise.id, exercise.name]));

  const prs = [...bestWeights.values()]
    .sort((a, b) => b.weight - a.weight)
    .map((record) => ({
      exercise: exerciseLookup.get(record.exerciseId) || record.exerciseId,
      value: `${record.weight} lb`,
      date: record.date,
    }));

  if (nextAchievement?.unlocked) {
    prs.unshift({ exercise: nextAchievement.title, value: "Achievement unlocked", date: new Date().toISOString().slice(0, 10) });
  }

  return prs;
}

export function buildAtlasMemory({ profile, logs, mission, nextAchievement }: { profile: Profile; logs: Record<string, DailyLog>; mission?: Mission; nextAchievement?: Achievement }): AtlasMemory {
  const orderedLogs = Object.values(logs).sort((a, b) => b.date.localeCompare(a.date));

  return {
    name: profile.name,
    goal: profile.goal,
    injuries: extractInjuries(logs),
    favoriteExercises: extractFavoriteExercises(logs),
    workoutHistory: buildWorkoutHistory(logs),
    nutritionHistory: orderedLogs.map((log) => ({ date: log.date, protein: log.protein, calories: log.calories, water: log.water })),
    sleepHistory: orderedLogs.map((log) => ({ date: log.date, sleep: log.sleep })),
    recoveryHistory: orderedLogs.map((log) => ({ date: log.date, mood: log.mood, energy: log.energy, sleep: log.sleep })),
    prHistory: buildPrHistory(logs, nextAchievement),
    missionSnapshot: mission,
  };
}
