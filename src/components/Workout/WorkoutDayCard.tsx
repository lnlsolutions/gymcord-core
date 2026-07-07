import type { WorkoutDay } from "../../types/gymcord";

export function WorkoutDayCard({
  workout,
  onStart,
}: {
  workout: WorkoutDay;
  onStart: () => void;
}) {
  return (
    <button className="workout-card" onClick={onStart}>
      <img src={workout.image} alt={workout.title} />

      <div className="workout-overlay">
        <p className="pill">{workout.day}</p>
        <h3>{workout.title}</h3>
        <span>{workout.focus}</span>

        <div className="workout-meta">
          <small>{workout.duration} min</small>
          <small>{workout.exercises.length} exercises</small>
        </div>
      </div>
    </button>
  );
}
