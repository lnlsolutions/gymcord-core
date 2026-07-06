export function WorkoutDayCard({ workout, onStart }: any) {
  return (
    <div className="workout-card">
      <img src={workout.image} alt={workout.title} />

      <div className="workout-overlay">
        <p className="pill">{workout.day}</p>
        <h3>{workout.title}</h3>
        <span>{workout.focus}</span>

        <button onClick={onStart}>Start Workout</button>
      </div>
    </div>
  );
}
