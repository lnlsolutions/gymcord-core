import { describe, expect, it } from "vitest";
import { buildDailyMission } from "../missionEngine";
import { buildXpSnapshot, xpRequiredForLevel } from "../xpEngine";
import { buildStreakSnapshot, isActiveDay } from "../streakEngine";
import { buildAchievements, getNextAchievement } from "../achievementEngine";
import { buildAtlasInsights } from "../atlasEngine";
import { buildTransformationSnapshot } from "../transformationEngine";
import { buildWorkoutSession, getExerciseKey } from "../workoutSessionEngine";
import { createDailyLog, createMission, createWorkoutDay } from "../../../test/utils";

const workout = createWorkoutDay();
const completeLog = createDailyLog({ protein: 140, water: 8, sleep: 8, mood: 5, energy: 5, completedExercises: { [getExerciseKey("day-1", "squat")]: true }, measurements: { weight: "180", waist: "", hips: "", glutes: "", thighs: "", arms: "", chest: "" } });

describe("core engines", () => {
  it("builds daily missions with completed task state and XP", () => {
    const mission = buildDailyMission({ dayLog: completeLog, todayWorkout: workout, totalExercises: 1 });
    expect(mission.completed).toBe(true);
    expect(mission.earnedXp).toBeGreaterThan(0);
    expect(mission.tasks).toHaveLength(6);
  });

  it("calculates XP snapshots across level boundaries", () => {
    const mission = createMission({ earnedXp: xpRequiredForLevel(1) + 20 });
    const snapshot = buildXpSnapshot({ [mission.date]: completeLog }, [mission]);
    expect(snapshot.currentLevel).toBe(2);
    expect(snapshot.totalXp).toBeGreaterThan(xpRequiredForLevel(1));
  });

  it("detects active days and streaks", () => {
    const logs = { "2026-01-01": completeLog, "2026-01-02": createDailyLog({ date: "2026-01-02", water: 8 }) };
    expect(isActiveDay(completeLog, 1)).toBe(true);
    expect(buildStreakSnapshot(logs, 1, "2026-01-02").currentStreak).toBe(2);
  });

  it("builds achievements and next achievement", () => {
    const mission = buildDailyMission({ dayLog: completeLog, todayWorkout: workout, totalExercises: 1 });
    const achievements = buildAchievements([mission], buildStreakSnapshot({ [completeLog.date]: completeLog }, 1, completeLog.date));
    expect(achievements.find((item) => item.id === "first-workout")?.unlocked).toBe(true);
    expect(getNextAchievement(achievements)?.unlocked).toBe(false);
  });

  it("builds Atlas insights from mission, XP, streak, and transformation data", () => {
    const mission = createMission({ xpReward: 200, tasks: [{ id: "water", title: "Hydration", description: "", xpReward: 20, completed: false, progress: 3, target: 8, completionPercentage: 38 }] });
    const insights = buildAtlasInsights(mission, { totalXp: 200, currentXp: 240, currentLevel: 1, xpNeededForNextLevel: 260, progressPercentage: 92 }, { currentStreak: 0, longestStreak: 0, weeklyCalendar: [], streakInDanger: true }, { id: "first", title: "First", description: "", unlocked: false, progress: 0, target: 1, completionPercentage: 0 });
    expect(insights.map((insight) => insight.priority)).toContain("High");
    expect(insights[0].message).toBeTruthy();
  });

  it("builds transformation and workout session snapshots", () => {
    const mission = buildDailyMission({ dayLog: completeLog, todayWorkout: workout, totalExercises: 1 });
    const xp = buildXpSnapshot({ [completeLog.date]: completeLog }, [mission]);
    const streak = buildStreakSnapshot({ [completeLog.date]: completeLog }, 1, completeLog.date);
    const transformation = buildTransformationSnapshot({ logs: { [completeLog.date]: completeLog }, startDate: completeLog.date, currentDate: completeLog.date, totalExercises: 1, score: 80, mission, xp, streak });
    expect(transformation.milestones).toHaveLength(5);

    const session = buildWorkoutSession(workout, completeLog, 99);
    expect(session.activeIndex).toBe(0);
    expect(session.completedExerciseKeys).toContain(getExerciseKey("day-1", "squat"));
  });
});
