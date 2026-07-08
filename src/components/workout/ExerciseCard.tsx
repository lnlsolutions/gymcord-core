import type { DailyLog, Exercise } from "../../types/gymcord";
import { SetLogger, type SetLoggerValue } from "./SetLogger";

function setCount(prescription: string) { return Number(prescription.match(/(\d+)\s*sets?/i)?.[1] ?? 3); }
function targetReps(prescription: string) { return prescription.match(/(?:×|x)\s*([^,]+)/i)?.[1]?.trim() ?? ""; }

export function ExerciseCard({ workoutId, exercise, dayLog, onLogChange }: { workoutId: string; exercise: Exercise; dayLog: DailyLog; onLogChange: (log: DailyLog) => void }) {
  const key = `${workoutId}-${exercise.id}`;
  const sets = setCount(exercise.prescription);
  const values: SetLoggerValue[] = Array.from({ length: sets }).map((_, index) => ({
    completed: Boolean(dayLog.completedExercises[`${key}-set-${index + 1}`]),
    weight: dayLog.weights[`${key}-set-${index + 1}`] ?? "",
    reps: dayLog.notes[`${key}-set-${index + 1}-reps`] ?? "",
  }));
  const completed = values.every((value) => value.completed);

  function saveSets(nextValues: SetLoggerValue[]) {
    const completedExercises = { ...dayLog.completedExercises, [key]: nextValues.every((value) => value.completed) };
    const weights = { ...dayLog.weights };
    const notes = { ...dayLog.notes };
    nextValues.forEach((value, index) => {
      completedExercises[`${key}-set-${index + 1}`] = value.completed;
      weights[`${key}-set-${index + 1}`] = value.weight;
      notes[`${key}-set-${index + 1}-reps`] = value.reps;
    });
    onLogChange({ ...dayLog, completedExercises, weights, notes });
  }

  return (
    <article className={`exercise-card workout-v1-exercise ${completed ? "done" : ""}`}>
      <img className="exercise-image" src={exercise.image} alt={exercise.name} />
      <div className="exercise-header"><div><h3>{exercise.name}</h3><span className="exercise-reps">{exercise.prescription}</span></div><strong>{completed ? "Done" : "Log"}</strong></div>
      <p>{exercise.description}</p>
      <div className="muscle-list">{exercise.muscles.map((muscle) => <span key={muscle}>{muscle}</span>)}</div>
      <SetLogger sets={sets} values={values.map((value) => ({ ...value, reps: value.reps || targetReps(exercise.prescription) }))} onChange={saveSets} />
      <textarea className="input workout-notes" placeholder="Exercise notes" value={dayLog.notes[key] ?? ""} onChange={(event) => onLogChange({ ...dayLog, notes: { ...dayLog.notes, [key]: event.target.value } })} />
    </article>
  );
}
