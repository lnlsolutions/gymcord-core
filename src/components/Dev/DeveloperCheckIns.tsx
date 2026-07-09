import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth";
import { appConfig } from "../../config";
import { CheckInDashboard, CheckInForm } from "../checkins";
import { checkInRepository, type MemberCheckIn } from "../../repositories/CheckInRepository";

function row(label: string, value: string, detail?: string) { return { label, value, detail }; }
function StatusCard({ title, rows }: { title: string; rows: { label: string; value: string; detail?: string }[] }) { return <section className="dev-card"><h2>{title}</h2><div className="dev-grid">{rows.map((item) => <div className="dev-row" key={item.label}><strong>{item.label}</strong><span>{item.value}</span>{item.detail && <small>{item.detail}</small>}</div>)}</div></section>; }

export function DeveloperCheckIns() {
  const auth = useAuth();
  const repository = useMemo(() => checkInRepository, []);
  const memberId = auth.session?.user.id ?? "developer-member";
  const organizationId = auth.session?.organization?.id;
  const [checkIns, setCheckIns] = useState<MemberCheckIn[]>(() => repository.seedSamples(memberId, organizationId));
  const [selectedId, setSelectedId] = useState(checkIns[0]?.id);
  const [source, setSource] = useState("seeded samples");
  const [saveStatus, setSaveStatus] = useState("ready");
  const [error, setError] = useState("");

  useEffect(() => { let active = true; repository.list({ memberId, organizationId }).then((result) => { if (!active) return; setSource(result.source); if (result.data.items.length) { setCheckIns(result.data.items); setSelectedId(result.data.items[0].id); } }).catch((unknownError: Error) => active && setError(unknownError.message)); return () => { active = false; }; }, [memberId, organizationId, repository]);
  const selected = checkIns.find((item) => item.id === selectedId) ?? checkIns[0];
  const queue = repository.getOfflineQueue();

  return <main className="dev-page"><header className="dev-header"><p className="eyebrow">GymCord Developer Verification</p><h1>AI Check-ins</h1><p>Repository-only diagnostics for AI check-in dashboards, member submission, trainer review, Atlas metadata, risk flags, follow-up tasks, optimistic writes, archive-by-default deletes, and offline queue support.</p></header>
    <StatusCard title="Runtime" rows={[row("Active provider", appConfig.backend.provider), row("Repository source", source), row("Check-ins loaded", `${checkIns.length}`), row("Selected check-in", selected?.id ?? "none"), row("Save status", saveStatus), row("Pending sync", `${queue.filter((item) => item.status !== "synced").length}`), row("Offline queue", `${queue.length} queued check-in write(s)`)]} />
    {selected && <StatusCard title="Status workflow" rows={["draft", "submitted", "in_review", "feedback_ready", "action_required", "completed", "archived"].map((status) => row(status, status === selected.status ? "current" : "available"))} />}
    {selected && <StatusCard title="Compliance summary" rows={[row("Workout compliance", `${selected.compliance.workout} · ${selected.compliance.workoutPercent}%`), row("Nutrition compliance", `${selected.compliance.nutrition} · ${selected.compliance.nutritionPercent}%`), row("Progress trend", selected.progressTrend.direction, selected.progressTrend.summary)]} />}
    {selected && <StatusCard title="AI and action metadata" rows={[row("Atlas insight metadata", `${selected.atlasInsights.length} insight(s)`, selected.atlasInsights.map((item) => item.summary).join(" | ")), row("Risk flags", `${selected.riskFlags.length} flag(s)`, selected.riskFlags.map((item) => `${item.level}:${item.category}`).join(", ")), row("Follow-up tasks", `${selected.followUpTasks.length} task(s)`, selected.followUpTasks.map((item) => item.integrationTargets.join("+")).join(", "))]} />}
    <section className="dev-card"><CheckInForm memberId={memberId} organizationId={organizationId} onSubmit={(input) => { const optimistic = { ...repository.seedSamples(memberId, organizationId)[0], ...input, id: crypto.randomUUID(), status: "submitted" as const, submittedAt: new Date().toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }; setCheckIns((items) => [optimistic, ...items]); setSelectedId(optimistic.id); setSaveStatus("optimistic submit queued"); void repository.create(optimistic).then((result) => { setSaveStatus(`saved via ${result.source}`); }).catch((submitError: Error) => setSaveStatus(`queued/offline: ${submitError.message}`)); }} /></section>
    <section className="dev-card"><CheckInDashboard checkIns={checkIns} selectedId={selected?.id} onSelect={setSelectedId} /></section>
    {error && <StatusCard title="Load Error" rows={[row("Repository", "failed", error)]} />}
    <section className="dev-card"><h2>Check-in snapshot</h2><pre>{JSON.stringify({ selected, queue }, null, 2)}</pre></section>
  </main>;
}
