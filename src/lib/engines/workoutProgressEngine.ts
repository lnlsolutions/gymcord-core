import type { DailyLog, WorkoutDay } from "../../types/gymcord";
import { getExerciseKey } from "./workoutSessionEngine";

export interface WorkoutProgressSnapshot {
  exercisesCompleted: number;
  totalExercises: number;
  setsCompleted: number;
  totalSets: number;
  estimatedRemainingTime: number;
  xpEarned: number;
  caloriesEstimate: number;
  progressPercentage: number;
}

function setsFromPrescription(prescription: string) {
  return Number(prescription.match(/(\d+)\s*sets?/i)?.[1] || 3);
}

export function buildWorkoutProgress(workout: WorkoutDay, dayLog: DailyLog): WorkoutProgressSnapshot {
  const totalSets = workout.exercises.reduce((sum, exercise) => sum + setsFromPrescription(exercise.prescription), 0);
  const exercisesCompleted = workout.exercises.filter((exercise) => dayLog.completedExercises[getExerciseKey(workout.id, exercise.id)]).length;
  const totalExercises = workout.exercises.length;
  const progressPercentage = totalExercises ? Math.round((exercisesCompleted / totalExercises) * 100) : 0;
  const setsCompleted = Math.round(totalSets * (progressPercentage / 100));

  return {
    exercisesCompleted,
    totalExercises,
    setsCompleted,
    totalSets,
    estimatedRemainingTime: Math.max(0, Math.round(workout.duration * (1 - progressPercentage / 100))),
    xpEarned: exercisesCompleted * 18 + setsCompleted * 2,
    caloriesEstimate: Math.round((workout.duration * 6.5) * (progressPercentage / 100 || 0.12)),
    progressPercentage,
  };
}
