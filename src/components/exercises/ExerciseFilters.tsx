import type { ExerciseDifficulty } from "../../types/domain";

export interface ExerciseFilterState {
  search: string;
  muscleGroup: string;
  equipment: string;
  difficulty: ExerciseDifficulty | "all";
}

interface Props {
  filters: ExerciseFilterState;
  muscleGroups: string[];
  equipment: string[];
  onChange: (filters: ExerciseFilterState) => void;
}

export function ExerciseFilters({ filters, muscleGroups, equipment, onChange }: Props) {
  return (
    <section className="dev-card">
      <h2>Search & filters</h2>
      <div className="dev-grid">
        <label className="field-stack">
          <span>Search exercises</span>
          <input value={filters.search} onChange={(event) => onChange({ ...filters, search: event.target.value })} placeholder="Search by name, tag, cue, muscle..." />
        </label>
        <label className="field-stack">
          <span>Muscle group</span>
          <select value={filters.muscleGroup} onChange={(event) => onChange({ ...filters, muscleGroup: event.target.value })}>
            <option value="all">All muscle groups</option>
            {muscleGroups.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label className="field-stack">
          <span>Equipment</span>
          <select value={filters.equipment} onChange={(event) => onChange({ ...filters, equipment: event.target.value })}>
            <option value="all">All equipment</option>
            {equipment.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label className="field-stack">
          <span>Difficulty</span>
          <select value={filters.difficulty} onChange={(event) => onChange({ ...filters, difficulty: event.target.value as ExerciseDifficulty | "all" })}>
            <option value="all">All difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </label>
      </div>
    </section>
  );
}
