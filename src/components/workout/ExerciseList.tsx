import type { DailyLog, WorkoutDay } from "../../types/gymcord";
import { ExerciseCard } from "./ExerciseCard";

export function ExerciseList({ workout, dayLog, onLogChange }: { workout: WorkoutDay; dayLog: DailyLog; onLogChange: (log: DailyLog) => void }) {
  return <div className="workout-v1-list">{workout.exercises.map((exercise) => <ExerciseCard key={exercise.id} workoutId={workout.id} exercise={exercise} dayLog={dayLog} onLogChange={onLogChange} />)}</div>;
}
