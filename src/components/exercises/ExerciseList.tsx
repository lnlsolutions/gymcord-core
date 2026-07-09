import type { Exercise } from "../../types/domain";
import { ExerciseCard } from "./ExerciseCard";

export function ExerciseList({ exercises, selectedId, onSelect }: { exercises: Exercise[]; selectedId?: string; onSelect: (exercise: Exercise) => void }) {
  return (
    <section className="dev-card">
      <h2>Exercise library list</h2>
      <div className="dev-grid">
        {exercises.length === 0 ? <p className="muted">No exercises match the current filters.</p> : exercises.map((exercise) => (
          <ExerciseCard key={exercise.id} exercise={exercise} selected={exercise.id === selectedId} onSelect={onSelect} />
        ))}
      </div>
    </section>
  );
}
