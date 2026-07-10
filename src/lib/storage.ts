import { keyValueStorage } from "../services/storage";
import type { DailyLog, Profile } from "../types/gymcord";

export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function saved<T>(key: string, fallback: T): T {
  return keyValueStorage.get(key, fallback);
}

export function save<T>(key: string, value: T) {
  keyValueStorage.set(key, value);
}

export function getLastSevenDays() {
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
}

export function shortDate(date: string) {
  const d = new Date(date + "T00:00:00");

  return d.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
  });
}

export const emptyMeasurements = {
  weight: "",
  waist: "",
  hips: "",
  glutes: "",
  thighs: "",
  arms: "",
  chest: "",
};

export const emptyPhotos = {
  front: "",
  side: "",
  back: "",
};

export function createEmptyDay(date: string): DailyLog {
  return {
    date,
    completedExercises: {},
    weights: {},
    notes: {},
    protein: 0,
    calories: 0,
    water: 0,
    sleep: 0,
    steps: 0,
    mood: 0,
    energy: 0,
    ingredients: "",
    mealPhoto: "",
    measurements: { ...emptyMeasurements },
    photos: { ...emptyPhotos },
  };
}

export function createEmptyProfile(): Profile {
  return {
    id: crypto.randomUUID(),
    name: "",
    age: 0,
    gender: "",
    height: "",
    currentWeight: "",
    goalWeight: "",
    activityLevel: "",
    goal: "",
    startDate: todayKey(),
    profilePhoto: "",
  };
}
