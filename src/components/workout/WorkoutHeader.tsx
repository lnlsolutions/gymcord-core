import type { WorkoutDay } from "../../types/gymcord";

export function WorkoutHeader({ workout, progress, saveStatus, provider }: { workout: WorkoutDay; progress: number; saveStatus: string; provider: string }) {
  return (
    <header className="workout-v1-header panel">
      <p className="pill">Workout experience v1 · {provider}</p>
      <h2>{workout.title}</h2>
      <p>{workout.focus}</p>
      <div className="workout-v1-progress"><span style={{ width: `${progress}%` }} /></div>
      <small>{progress}% complete · {workout.duration} min · {saveStatus}</small>
    </header>
  );
}
