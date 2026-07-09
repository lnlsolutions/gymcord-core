import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth";
import { appConfig } from "../../config";
import { exerciseRepository } from "../../repositories/ExerciseRepository";
import type { Exercise } from "../../types/domain";

function row(label: string, value: string, detail?: string) {
  return { label, value, detail };
}

function StatusCard({ title, rows }: { title: string; rows: { label: string; value: string; detail?: string }[] }) {
  return (
    <section className="dev-card">
      <h2>{title}</h2>
      <div className="dev-grid">
        {rows.map((item) => (
          <div className="dev-row" key={item.label}>
            <strong>{item.label}</strong>
            <span>{item.value}</span>
            {item.detail && <small>{item.detail}</small>}
          </div>
        ))}
      </div>
    </section>
  );
}

export function DeveloperExerciseLibrary() {
  const auth = useAuth();
  const repository = useMemo(() => exerciseRepository, []);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [source, setSource] = useState("loading");
  const [error, setError] = useState("");
  const [optimisticState, setOptimisticState] = useState("ready");

  useEffect(() => {
    let active = true;
    repository.list({ organizationId: auth.session?.organization?.id })
      .then((result) => {
        if (!active) return;
        setExercises(result.data.items);
        setSource(result.source);
      })
      .catch((unknownError: Error) => active && setError(unknownError.message));
    return () => { active = false; };
  }, [auth.session, repository]);

  function validateOptimisticFlow() {
    const createdAt = new Date().toISOString();
    const optimisticExercise: Exercise = {
      id: `optimistic-${createdAt}`,
      organizationId: auth.session?.organization?.id,
      trainerId: auth.session?.user.id,
      name: "Optimistic validation exercise",
      description: "Local-only validation row for repository optimistic update behavior.",
      category: "strength",
      muscleGroups: ["core"],
      equipment: ["bodyweight"],
      instructions: ["Create locally", "Reconcile after repository response"],
      status: "active",
      createdAt,
      updatedAt: createdAt,
    };

    setExercises((items) => [optimisticExercise, ...items]);
    setOptimisticState("optimistic row inserted before repository reconciliation");
  }

  const latestExercise = exercises[0];

  return (
    <main className="dev-page">
      <header className="dev-header">
        <p className="eyebrow">GymCord Developer Verification</p>
        <h1>Exercise Library</h1>
        <p>Repository-only diagnostics for exercise list, create, update, archive, delete-as-archive, provider routing, and offline-safe write paths.</p>
        <button type="button" onClick={validateOptimisticFlow}>Validate optimistic row</button>
      </header>

      <StatusCard title="Runtime" rows={[
        row("Active provider", appConfig.backend.provider),
        row("Repository source", source),
        row("Current user", auth.session?.user.email ?? auth.status),
        row("Organization", auth.session?.organization?.name ?? "not loaded"),
        row("Supabase environment", appConfig.backend.supabase.url && appConfig.backend.supabase.anonKey ? "configured" : "not configured"),
      ]} />

      <StatusCard title="Repository capabilities" rows={[
        row("list", "available"),
        row("findById", "available"),
        row("create", "available"),
        row("update", "available"),
        row("archive", "available"),
        row("delete", "available", "delete delegates to archive so archive is the default delete behavior."),
      ]} />

      <StatusCard title="Loaded Exercises" rows={[
        row("Exercise count", `${exercises.length}`),
        row("Latest exercise", latestExercise?.name ?? "No persisted exercises yet", latestExercise ? `${latestExercise.status} · ${latestExercise.muscleGroups.join(", ")}` : undefined),
        row("Optimistic updates", optimisticState, "The developer action inserts local state before repository reconciliation."),
        row("Offline queue", "documented", "Repository create, update, archive, and delete writes use queueWhenOffline."),
      ]} />

      {error && <StatusCard title="Load Error" rows={[row("Repository", "failed", error)]} />}

      <section className="dev-card">
        <h2>Exercise snapshot</h2>
        <pre>{JSON.stringify(exercises, null, 2)}</pre>
      </section>
    </main>
  );
}
