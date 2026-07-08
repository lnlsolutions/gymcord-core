import type { DailyLog, Exercise, WorkoutDay } from "../../types/gymcord";

export interface SessionExercise extends Exercise {
  sets: number;
  reps: string;
  targetWeight: string;
}

export interface WorkoutSessionSnapshot {
  workout: WorkoutDay;
  activeIndex: number;
  activeExercise: SessionExercise;
  exercises: SessionExercise[];
  canGoPrevious: boolean;
  canGoNext: boolean;
  completedExerciseKeys: string[];
}

function parsePrescription(prescription: string) {
  const setsMatch = prescription.match(/(\d+)\s*sets?/i);
  const repsMatch = prescription.match(/[×x]\s*([^,]+)/i);

  return {
    sets: setsMatch ? Number(setsMatch[1]) : 3,
    reps: repsMatch ? repsMatch[1].trim() : prescription,
  };
}

export function getExerciseKey(dayId: string, exerciseId: string) {
  return `${dayId}-${exerciseId}`;
}

export function buildWorkoutSession(workout: WorkoutDay, dayLog: DailyLog, activeIndex: number): WorkoutSessionSnapshot {
  const exercises = workout.exercises.map((exercise) => {
    const prescription = parsePrescription(exercise.prescription);
    return {
      ...exercise,
      sets: prescription.sets,
      reps: prescription.reps,
      targetWeight: dayLog.weights[getExerciseKey(workout.id, exercise.id)] || "Bodyweight / log after set",
    };
  });

  const safeIndex = Math.min(Math.max(activeIndex, 0), exercises.length - 1);
  const completedExerciseKeys = workout.exercises
    .map((exercise) => getExerciseKey(workout.id, exercise.id))
    .filter((key) => dayLog.completedExercises[key]);

  return {
    workout,
    activeIndex: safeIndex,
    activeExercise: exercises[safeIndex],
    exercises,
    canGoPrevious: safeIndex > 0,
    canGoNext: safeIndex < exercises.length - 1,
    completedExerciseKeys,
  };
}
