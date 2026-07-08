import type { DailyLog, WorkoutDay } from "../../types/gymcord";
import { getExerciseKey } from "./workoutSessionEngine";

export type PersonalRecordType = "heaviest-weight" | "most-reps" | "longest-session" | "fastest-completion";

export interface PersonalRecord {
  type: PersonalRecordType;
  title: string;
  value: number;
  unit: string;
  isNew: boolean;
}

function numbers(value: string) {
  return (value.match(/\d+(?:\.\d+)?/g) || []).map(Number);
}

export function buildPersonalRecords(workout: WorkoutDay, dayLog: DailyLog, durationMinutes: number): PersonalRecord[] {
  const entries = workout.exercises.map((exercise) => dayLog.weights[getExerciseKey(workout.id, exercise.id)] || "");
  const parsed = entries.flatMap(numbers);
  const heaviest = parsed.length ? Math.max(...parsed) : 0;
  const reps = workout.exercises.flatMap((exercise) => numbers(exercise.prescription));
  const mostReps = reps.length ? Math.max(...reps) : 0;
  const completedCount = workout.exercises.filter((exercise) => dayLog.completedExercises[getExerciseKey(workout.id, exercise.id)]).length;
  const complete = completedCount === workout.exercises.length;

  const records: PersonalRecord[] = [
    { type: "heaviest-weight", title: "Heaviest Weight", value: heaviest, unit: "lb", isNew: heaviest > 0 },
    { type: "most-reps", title: "Most Reps", value: mostReps, unit: "reps", isNew: complete },
    { type: "longest-session", title: "Longest Session", value: durationMinutes, unit: "min", isNew: durationMinutes >= workout.duration },
    { type: "fastest-completion", title: "Fastest Completion", value: durationMinutes, unit: "min", isNew: complete && durationMinutes < workout.duration },
  ];

  return records.filter((record) => record.value > 0);
}
