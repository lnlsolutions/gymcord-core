import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth";
import { appConfig } from "../../config";
import { programRepository } from "../../repositories/ProgramRepository";
import type { Program } from "../../types/domain";

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

export function DeveloperProgramBuilder() {
  const auth = useAuth();
  const repository = useMemo(() => programRepository, []);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [source, setSource] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    repository.list({ organizationId: auth.session?.organization?.id })
      .then((result) => {
        if (!active) return;
        setPrograms(result.data.items);
        setSource(result.source);
      })
      .catch((unknownError: Error) => active && setError(unknownError.message));
    return () => { active = false; };
  }, [auth.session, repository]);

  const latestProgram = programs[0];

  return (
    <main className="dev-page">
      <header className="dev-header">
        <p className="eyebrow">GymCord Developer Verification</p>
        <h1>Program Builder</h1>
        <p>Repository-only diagnostics for program list, draft, publish, duplicate, assignment, and offline-safe write paths.</p>
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
        row("delete", "available"),
        row("duplicate", "available"),
        row("assign", "available"),
        row("publish", "available"),
        row("saveDraft", "available"),
      ]} />

      <StatusCard title="Loaded Programs" rows={[
        row("Program count", `${programs.length}`),
        row("Latest program", latestProgram?.title ?? "No persisted programs yet", latestProgram ? `${latestProgram.status} · ${latestProgram.weeks.length} week(s)` : undefined),
        row("Draft/publish workflow", "documented", "saveDraft keeps status=draft; publish stamps publishedAt."),
        row("Offline queue and optimistic updates", "documented", "Repository writes are queueWhenOffline; UI can update optimistically before awaiting repository results."),
      ]} />

      {error && <StatusCard title="Load Error" rows={[row("Repository", "failed", error)]} />}

      <section className="dev-card">
        <h2>Program snapshot</h2>
        <pre>{JSON.stringify(programs, null, 2)}</pre>
      </section>
    </main>
  );
}
