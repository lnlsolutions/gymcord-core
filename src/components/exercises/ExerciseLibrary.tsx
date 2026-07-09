import { useEffect, useMemo, useState } from "react";
import { appConfig } from "../../config";
import { exerciseRepository, type CreateExerciseInput, type UpdateExerciseInput } from "../../repositories/ExerciseRepository";
import type { Exercise } from "../../types/domain";
import { ExerciseCues } from "./ExerciseCues";
import { ExerciseEditor } from "./ExerciseEditor";
import { ExerciseFilters, type ExerciseFilterState } from "./ExerciseFilters";
import { ExerciseList } from "./ExerciseList";
import { ExerciseMediaPanel } from "./ExerciseMediaPanel";
import { ExerciseSafetyNotes } from "./ExerciseSafetyNotes";
import { ExerciseStandards } from "./ExerciseStandards";

const starterExercises: CreateExerciseInput[] = [
  { name: "Goblet Squat", description: "Squat pattern for lower-body strength.", muscleGroups: ["Quads", "Glutes"], equipment: ["Dumbbell"], difficulty: "beginner", coachingCues: ["Brace before descending", "Drive knees over toes"], movementStandards: ["Hip crease below knee", "Full lockout at top"], safetyNotes: ["Keep heels planted"], tags: ["squat"], status: "active", media: [{ id: "media-goblet", type: "video", title: "Goblet squat demo", url: "https://example.com/goblet-squat", provider: "external" }], programBuilder: { defaultSets: 3, defaultReps: "8-12", defaultRestSeconds: 75, loadType: "weight" } },
  { name: "Push-Up", description: "Horizontal press bodyweight staple.", muscleGroups: ["Chest", "Triceps", "Core"], equipment: ["Bodyweight"], difficulty: "beginner", coachingCues: ["Screw hands into floor", "Move as one plank"], movementStandards: ["Chest reaches fist height", "Elbows extend fully"], safetyNotes: ["Elevate hands if shoulders pinch"], tags: ["press"], status: "active", media: [], programBuilder: { defaultSets: 3, defaultReps: "AMRAP", defaultRestSeconds: 60, loadType: "bodyweight" } },
];

export function ExerciseLibrary({ developer = false }: { developer?: boolean }) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selected, setSelected] = useState<Exercise | null>(null);
  const [source, setSource] = useState("loading");
  const [saveStatus, setSaveStatus] = useState("idle");
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<ExerciseFilterState>({ search: "", muscleGroup: "all", equipment: "all", difficulty: "all" });

  async function load() {
    const result = await exerciseRepository.list(filters);
    if (result.data.items.length === 0 && !filters.search && filters.muscleGroup === "all" && filters.equipment === "all" && filters.difficulty === "all") {
      const seeded = await Promise.all(starterExercises.map((exercise) => exerciseRepository.create(exercise)));
      setExercises(seeded.map((item) => item.data));
      setSelected(seeded[0]?.data ?? null);
      setSource(seeded[0]?.source ?? result.source);
      return;
    }
    setExercises(result.data.items);
    setSelected((current) => result.data.items.find((item) => item.id === current?.id) ?? result.data.items[0] ?? null);
    setSource(result.source);
  }

  useEffect(() => { load().catch((caught: Error) => setError(caught.message)); }, [filters.search, filters.muscleGroup, filters.equipment, filters.difficulty]);

  const muscleGroups = useMemo(() => Array.from(new Set(exercises.flatMap((exercise) => exercise.muscleGroups))).sort(), [exercises]);
  const equipment = useMemo(() => Array.from(new Set(exercises.flatMap((exercise) => exercise.equipment))).sort(), [exercises]);
  const queue = exerciseRepository.getOfflineQueue();

  async function createExercise(input: CreateExerciseInput) {
    const optimistic = { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Exercise;
    setExercises((items) => [optimistic, ...items]);
    setSelected(optimistic);
    setSaveStatus("saving optimistically");
    const result = await exerciseRepository.create({ ...input, id: optimistic.id });
    setSelected(result.data); setSaveStatus("saved"); void load();
  }

  async function updateExercise(id: string, input: UpdateExerciseInput) {
    setExercises((items) => items.map((item) => item.id === id ? { ...item, ...input, updatedAt: new Date().toISOString() } : item));
    setSaveStatus("saving optimistically");
    const result = await exerciseRepository.update(id, input);
    setSelected(result.data); setSaveStatus("saved"); void load();
  }

  async function archiveExercise(id: string) {
    setExercises((items) => items.filter((item) => item.id !== id));
    setSaveStatus("archiving optimistically");
    await exerciseRepository.archive(id);
    setSelected(null); setSaveStatus("archived"); void load();
  }

  return (
    <main className="dev-page">
      <header className="dev-header"><p className="eyebrow">{developer ? "GymCord Developer Verification" : "Trainer Tools"}</p><h1>Exercise Library</h1><p>Create, edit, search, filter, archive, and prepare exercises for Program Builder consumption through ExerciseRepository.</p></header>
      <section className="dev-card"><h2>Repository diagnostics</h2><div className="dev-grid"><div className="dev-row"><strong>Active provider</strong><span>{appConfig.backend.provider}</span></div><div className="dev-row"><strong>Exercises loaded</strong><span>{exercises.length}</span></div><div className="dev-row"><strong>Selected exercise</strong><span>{selected?.name ?? "none"}</span></div><div className="dev-row"><strong>Search/filter state</strong><span>{JSON.stringify(filters)}</span></div><div className="dev-row"><strong>Pending sync</strong><span>{queue.length}</span></div><div className="dev-row"><strong>Offline queue</strong><span>{JSON.stringify(queue)}</span></div><div className="dev-row"><strong>Save status</strong><span>{saveStatus}</span></div><div className="dev-row"><strong>Repository source</strong><span>{source}</span></div></div></section>
      {error && <section className="dev-card"><h2>Load error</h2><p>{error}</p></section>}
      <ExerciseFilters filters={filters} muscleGroups={muscleGroups} equipment={equipment} onChange={setFilters} />
      <ExerciseList exercises={exercises} selectedId={selected?.id} onSelect={setSelected} />
      <ExerciseEditor exercise={selected} saveStatus={saveStatus} onCreate={createExercise} onUpdate={updateExercise} onArchive={archiveExercise} />
      {selected && <><ExerciseMediaPanel media={selected.media} /><ExerciseCues cues={selected.coachingCues} /><ExerciseStandards standards={selected.movementStandards} /><ExerciseSafetyNotes notes={selected.safetyNotes} /><section className="dev-card"><h2>Program Builder integration-ready structure</h2><pre>{JSON.stringify(selected.programBuilder, null, 2)}</pre></section></>}
    </main>
  );
}
