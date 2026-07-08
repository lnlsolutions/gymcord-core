import type { DailyLog, Mission, MissionTask, WorkoutDay } from "../../types/gymcord";
import { calculateWorkoutCompletion } from "../scoring";
import { GOALS, XP_REWARDS, clampPercentage } from "./constants";

interface MissionEngineInput {
  dayLog: DailyLog;
  todayWorkout: WorkoutDay;
  totalExercises: number;
}

function task(id: string, title: string, description: string, xpReward: number, current: number, target: number): MissionTask {
  const progress = Math.min(current, target);
  const completionPercentage = clampPercentage(target ? (progress / target) * 100 : 0);

  return {
    id,
    title,
    description,
    xpReward,
    completed: completionPercentage >= 100,
    progress,
    target,
    completionPercentage,
  };
}

export function buildDailyMission({ dayLog, todayWorkout, totalExercises }: MissionEngineInput): Mission {
  const workoutCompletion = calculateWorkoutCompletion(dayLog, totalExercises);
  const recoveryScore = clampPercentage((dayLog.sleep / GOALS.sleep) * 55 + (dayLog.energy / 5) * 25 + (dayLog.mood / 5) * 20);
  const bonusComplete = Boolean(dayLog.mealPhoto || dayLog.steps >= 8000 || dayLog.measurements.weight);

  const tasks = [
    task("workout", todayWorkout.title, `Complete today's ${todayWorkout.focus.toLowerCase()} session.`, XP_REWARDS.workoutCompleted, workoutCompletion, 100),
    task("protein", "Protein Goal", `Reach ${GOALS.protein}g protein to support recovery.`, XP_REWARDS.proteinGoal, dayLog.protein, GOALS.protein),
    task("water", "Hydration Goal", `Drink ${GOALS.water} glasses of water.`, XP_REWARDS.waterGoal, dayLog.water, GOALS.water),
    task("sleep", "Sleep Goal", `Log ${GOALS.sleep} hours of sleep.`, XP_REWARDS.sleepGoal, dayLog.sleep, GOALS.sleep),
    task("recovery", "Recovery Check", "Keep sleep, mood, and energy in the green.", 40, recoveryScore, GOALS.recovery),
    task("bonus", "Bonus Challenge", "Upload a meal, log weight, or hit 8,000 steps.", 35, bonusComplete ? 1 : 0, 1),
  ];

  const completionPercentage = clampPercentage(tasks.reduce((sum, item) => sum + item.completionPercentage, 0) / tasks.length);
  const completed = tasks.every((item) => item.completed);
  const earnedXp = tasks.filter((item) => item.completed).reduce((sum, item) => sum + item.xpReward, 0) + (completed ? XP_REWARDS.missionCompletion : 0);

  return {
    id: `mission-${dayLog.date}`,
    date: dayLog.date,
    title: "Daily Mission",
    description: `Complete ${todayWorkout.title}, nutrition, hydration, sleep, and recovery targets before reset.`,
    xpReward: tasks.reduce((sum, item) => sum + item.xpReward, 0) + XP_REWARDS.missionCompletion,
    earnedXp,
    completed,
    progress: tasks.filter((item) => item.completed).length,
    target: tasks.length,
    completionPercentage,
    tasks,
  };
}
