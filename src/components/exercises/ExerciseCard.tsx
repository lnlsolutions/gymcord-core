import type { Exercise } from "../../types/domain";

export function ExerciseCard({ exercise, selected, onSelect }: { exercise: Exercise; selected: boolean; onSelect: (exercise: Exercise) => void }) {
  return (
    <button className={`dev-row exercise-card${selected ? " is-selected" : ""}`} onClick={() => onSelect(exercise)} type="button">
      <strong>{exercise.name}</strong>
      <span>{exercise.muscleGroups.join(", ") || "No muscles"} · {exercise.difficulty}</span>
      <small>{exercise.equipment.join(", ") || "No equipment"} · {exercise.status}</small>
    </button>
  );
}
