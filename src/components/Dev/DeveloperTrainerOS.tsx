import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth";
import { trainerRepository, type TrainerWorkspaceState } from "../../repositories/TrainerRepository";

function row(label: string, value: string, detail?: string) { return { label, value, detail }; }
function StatusCard({ title, rows }: { title: string; rows: { label: string; value: string; detail?: string }[] }) { return <section className="dev-card"><h2>{title}</h2><div className="dev-grid">{rows.map((item) => <div className="dev-row" key={item.label}><strong>{item.label}</strong><span>{item.value}</span>{item.detail && <small>{item.detail}</small>}</div>)}</div></section>; }

export function DeveloperTrainerOS() {
  const auth = useAuth();
  const repository = useMemo(() => trainerRepository, []);
  const [state, setState] = useState<TrainerWorkspaceState | null>(null);
  const [error, setError] = useState("");

  useEffect(() => { let active = true; repository.loadWorkspace(auth.session).then((next) => active && setState(next)).catch((err: Error) => active && setError(err.message)); return () => { active = false; }; }, [auth.session, repository]);

  return <main className="dev-page"><header className="dev-header"><p className="eyebrow">GymCord Developer Verification</p><h1>Trainer OS</h1><p>Repository diagnostics for trainer workspace data, mock fallback, and Supabase table path mappings.</p></header>
    <StatusCard title="Runtime" rows={[row("Active provider", state?.provider ?? repository.providerName), row("Trainer user", state?.trainerUser ?? auth.session?.user.email ?? auth.status), row("Assigned clients", `${state?.assignedClients.length ?? 0}`), row("Sample client detail", state?.sampleClientDetail?.name ?? "loading"), row("Last repository status", state?.lastRepositoryStatus ?? repository.getLastRepositoryStatus())]} />
    {error && <StatusCard title="Load Error" rows={[row("Repository", "failed", error)]} />}
    <section className="dev-card"><h2>Assigned clients</h2><pre>{JSON.stringify(state?.assignedClients ?? [], null, 2)}</pre></section>
    <section className="dev-card"><h2>Sample client detail</h2><pre>{JSON.stringify(state?.sampleClientDetail ?? {}, null, 2)}</pre></section>
  </main>;
}
