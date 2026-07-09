import { useEffect, useState } from "react";
import type { Exercise, ExerciseDifficulty } from "../../types/domain";
import type { CreateExerciseInput, UpdateExerciseInput } from "../../repositories/ExerciseRepository";

const splitLines = (value: string) => value.split("\n").map((item) => item.trim()).filter(Boolean);
const splitCsv = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean);

export function ExerciseEditor({ exercise, saveStatus, onCreate, onUpdate, onArchive }: {
  exercise: Exercise | null;
  saveStatus: string;
  onCreate: (input: CreateExerciseInput) => void;
  onUpdate: (id: string, input: UpdateExerciseInput) => void;
  onArchive: (id: string) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [muscleGroups, setMuscleGroups] = useState("");
  const [equipment, setEquipment] = useState("");
  const [difficulty, setDifficulty] = useState<ExerciseDifficulty>("beginner");
  const [coachingCues, setCoachingCues] = useState("");
  const [movementStandards, setMovementStandards] = useState("");
  const [safetyNotes, setSafetyNotes] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");

  useEffect(() => {
    setName(exercise?.name ?? "");
    setDescription(exercise?.description ?? "");
    setMuscleGroups(exercise?.muscleGroups.join(", ") ?? "");
    setEquipment(exercise?.equipment.join(", ") ?? "");
    setDifficulty(exercise?.difficulty ?? "beginner");
    setCoachingCues(exercise?.coachingCues.join("\n") ?? "");
    setMovementStandards(exercise?.movementStandards.join("\n") ?? "");
    setSafetyNotes(exercise?.safetyNotes.join("\n") ?? "");
    setMediaUrl(exercise?.media[0]?.url ?? "");
  }, [exercise]);

  function payload(): CreateExerciseInput {
    return {
      name,
      description,
      muscleGroups: splitCsv(muscleGroups),
      equipment: splitCsv(equipment),
      difficulty,
      coachingCues: splitLines(coachingCues),
      movementStandards: splitLines(movementStandards),
      safetyNotes: splitLines(safetyNotes),
      tags: splitCsv(`${muscleGroups},${equipment}`),
      status: exercise?.status ?? "active",
      media: mediaUrl ? [{ id: exercise?.media[0]?.id ?? crypto.randomUUID(), type: "video", title: `${name} demo`, url: mediaUrl, provider: "metadata" }] : [],
      programBuilder: exercise?.programBuilder ?? { defaultSets: 3, defaultReps: "8-12", defaultRestSeconds: 75, tempo: "controlled" },
    };
  }

  return (
    <section className="dev-card">
      <h2>{exercise ? "Exercise detail editor" : "Create exercise"}</h2>
      <div className="dev-grid">
        <label className="field-stack"><span>Name</span><input value={name} onChange={(event) => setName(event.target.value)} /></label>
        <label className="field-stack"><span>Difficulty</span><select value={difficulty} onChange={(event) => setDifficulty(event.target.value as ExerciseDifficulty)}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></label>
        <label className="field-stack"><span>Muscle groups</span><input value={muscleGroups} onChange={(event) => setMuscleGroups(event.target.value)} /></label>
        <label className="field-stack"><span>Equipment</span><input value={equipment} onChange={(event) => setEquipment(event.target.value)} /></label>
        <label className="field-stack"><span>Description</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} /></label>
        <label className="field-stack"><span>Media URL</span><input value={mediaUrl} onChange={(event) => setMediaUrl(event.target.value)} /></label>
        <label className="field-stack"><span>Coaching cues</span><textarea value={coachingCues} onChange={(event) => setCoachingCues(event.target.value)} /></label>
        <label className="field-stack"><span>Movement standards</span><textarea value={movementStandards} onChange={(event) => setMovementStandards(event.target.value)} /></label>
        <label className="field-stack"><span>Safety notes</span><textarea value={safetyNotes} onChange={(event) => setSafetyNotes(event.target.value)} /></label>
      </div>
      <div className="auth-actions"><button type="button" onClick={() => exercise ? onUpdate(exercise.id, payload()) : onCreate(payload())}>{exercise ? "Save exercise" : "Create exercise"}</button>{exercise && <button type="button" onClick={() => onArchive(exercise.id)}>Archive</button>}<span>{saveStatus}</span></div>
    </section>
  );
}
