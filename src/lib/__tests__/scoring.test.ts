import { describe, expect, it } from "vitest";
import {
  calculateTransformationScore,
  calculateWorkoutCompletion,
  getCoachInsights,
  getRewards,
} from "../scoring";
import type { DailyLog } from "../../types/gymcord";

const buildDayLog = (overrides: Partial<DailyLog> = {}): DailyLog => ({
  date: "2026-07-08",
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
  mealPhoto: null,
  photos: { front: null, side: null, back: null },
  measurements: { weight: "", waist: "", hips: "", glutes: "", thighs: "", arms: "", chest: "" },
  ...overrides,
});

describe("scoring utilities", () => {
  it("calculates workout completion as a rounded percentage", () => {
    expect(
      calculateWorkoutCompletion(
        buildDayLog({ completedExercises: { squat: true, bench: false, row: true } }),
        3,
      ),
    ).toBe(67);
  });

  it("returns zero workout completion when there are no exercises", () => {
    expect(calculateWorkoutCompletion(buildDayLog(), 0)).toBe(0);
  });

  it("caps transformation score at 100", () => {
    const score = calculateTransformationScore(
      buildDayLog({
        protein: 200,
        water: 20,
        sleep: 10,
        mealPhoto: "meal.jpg",
        photos: { front: "front.jpg", side: "side.jpg", back: "back.jpg" },
        measurements: { weight: "150", waist: "30", hips: "38", glutes: "40", thighs: "22", arms: "12", chest: "36" },
      }),
      100,
    );

    expect(score).toBe(100);
  });

  it("returns coaching insights and unlocked rewards based on progress", () => {
    expect(getCoachInsights(buildDayLog({ protein: 120, water: 8, mealPhoto: "meal.jpg" }), 100, 90)).toEqual(
      expect.arrayContaining([expect.objectContaining({ title: "Progress photos" })]),
    );
    expect(getRewards(95).every((reward) => reward.unlocked)).toBe(true);
  });
});
