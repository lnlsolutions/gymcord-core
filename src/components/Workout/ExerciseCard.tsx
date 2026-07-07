import type { DailyLog, Exercise } from "../../types/gymcord";

export function ExerciseCard({
  exercise,
  dayId,
  dayLog,
  updateDay,
}: {
  exercise: Exercise;
  dayId: string;
  dayLog: DailyLog;
  updateDay: (patch: Partial<DailyLog>) => void;
}) {
  const key = `${dayId}-${exercise.id}`;

  return (
    <div className="exercise-card">
      <img className="exercise-image" src={exercise.image} alt={exercise.name} />

      <div className="exercise-header">
        <div>
          <h4>{exercise.name}</h4>
          <span className="exercise-reps">{exercise.prescription}</span>
        </div>
      </div>

      <p className="exercise-description">{exercise.description}</p>

      <div className="muscle-list">
        {exercise.muscles.map((muscle) => (
          <span key={muscle}>{muscle}</span>
        ))}
      </div>

      <div className="cue-list">
        {exercise.cues.map((cue) => (
          <span className="cue-chip" key={cue}>
            ✓ {cue}
          </span>
        ))}
      </div>

      <label className="exercise-row">
        <input
          type="checkbox"
          checked={!!dayLog.completedExercises[key]}
          onChange={() =>
            updateDay({
              completedExercises: {
                ...dayLog.completedExercises,
                [key]: !dayLog.completedExercises[key],
              },
            })
          }
        />

        <span>Completed</span>
      </label>

      <input
        className="input"
        placeholder="Weight used / reps / notes"
        value={dayLog.weights[key] || ""}
        onChange={(e) =>
          updateDay({
            weights: {
              ...dayLog.weights,
              [key]: e.target.value,
            },
          })
        }
      />
    </div>
  );
}
