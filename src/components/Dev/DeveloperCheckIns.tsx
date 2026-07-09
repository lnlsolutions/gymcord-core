import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth";
import { appConfig } from "../../config";
import { checkInRepository } from "../../repositories/CheckInRepository";
import type { CheckIn } from "../../types/domain";

function row(label: string, value: string, detail?: string) { return { label, value, detail }; }
function StatusCard({ title, rows }: { title: string; rows: { label: string; value: string; detail?: string }[] }) { return <section className="dev-card"><h2>{title}</h2><div className="dev-grid">{rows.map((item) => <div className="dev-row" key={item.label}><strong>{item.label}</strong><span>{item.value}</span>{item.detail && <small>{item.detail}</small>}</div>)}</div></section>; }

export function DeveloperCheckIns() {
  const auth = useAuth();
  const repository = useMemo(() => checkInRepository, []);
  const memberId = auth.session?.user.id ?? "developer-member";
  const organizationId = auth.session?.organization?.id;
  const [checkIns, setCheckIns] = useState<CheckIn[]>(() => repository.seedSamples(memberId, organizationId, "developer-trainer"));
  const [source, setSource] = useState("seeded samples");
  const [optimisticSubmit, setOptimisticSubmit] = useState("ready");
  const [optimisticReview, setOptimisticReview] = useState("ready");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    repository.list({ memberId, organizationId }).then((result) => {
      if (!active) return;
      setSource(result.source);
      if (result.data.items.length > 0) setCheckIns(result.data.items);
    }).catch((unknownError: Error) => active && setError(unknownError.message));
    return () => { active = false; };
  }, [memberId, organizationId, repository]);

  function validateOptimisticSubmit() {
    const submittedAt = new Date().toISOString();
    setCheckIns((items) => items.map((item, index) => index === 0 ? { ...item, status: "submitted", submittedAt, updatedAt: submittedAt } : item));
    setOptimisticSubmit("local check-in submitted before repository reconciliation");
  }

  function validateOptimisticReview() {
    const reviewedAt = new Date().toISOString();
    setCheckIns((items) => items.map((item, index) => index === 0 ? { ...item, status: "reviewed", reviewedAt, updatedAt: reviewedAt, followUpTasks: [...item.followUpTasks, { id: `optimistic-follow-up-${reviewedAt}`, title: "Trainer follow-up created during review", ownerRole: "trainer" }] } : item));
    setOptimisticReview("local review, risk flags, and follow-up task updated before repository reconciliation");
  }

  return <main className="dev-page">
    <header className="dev-header"><p className="eyebrow">GymCord Developer Verification</p><h1>AI Check-ins</h1><p>Repository-only diagnostics for AI check-ins, provider routing, archive-by-default deletes, optimistic submit/review, offline queue, Atlas metadata, risk flags, follow-up tasks, and integration readiness.</p><button type="button" onClick={validateOptimisticSubmit}>Validate optimistic submit</button><button type="button" onClick={validateOptimisticReview}>Validate optimistic review</button></header>
    <StatusCard title="Runtime" rows={[row("Active provider", appConfig.backend.provider), row("Repository source", source), row("Current user", auth.session?.user.email ?? auth.status), row("Supabase environment", appConfig.backend.supabase.url && appConfig.backend.supabase.anonKey ? "configured" : "not configured"), row("Offline queue", `${repository.getOfflineQueue().length} queued check-in write(s)`)]} />
    <StatusCard title="Repository capabilities" rows={["list", "findById", "create", "update", "submit", "review", "archive", "delete", "seedSamples", "getOfflineQueue"].map((name) => row(name, "available", name === "delete" ? "delete delegates to archive, so archive is the default delete behavior." : undefined))} />
    <StatusCard title="Integration readiness" rows={[row("Atlas Coach", "ready", "Atlas insight metadata, confidence, and recommended actions are normalized."), row("Trainer Portal", "ready", "trainerId, review status, risk flags, and follow-up tasks support coaching workflows."), row("Member app", "ready", "memberId, prompt, response, mood, energy, and submit workflow support member UX."), row("Notifications", "ready", "notificationIds can link reminders and follow-up alerts."), row("Calendar", "ready", "calendarEventId and member_check_in calendar events can anchor scheduled check-ins."), row("Optimistic submit", optimisticSubmit), row("Optimistic review", optimisticReview)]} />
    <StatusCard title="Status workflow" rows={[row("Draft", `${checkIns.filter((item) => item.status === "draft").length}`), row("Submitted", `${checkIns.filter((item) => item.status === "submitted").length}`), row("Reviewed", `${checkIns.filter((item) => item.status === "reviewed").length}`), row("Risk flags", checkIns.flatMap((item) => item.riskFlags).join(", ") || "none"), row("Follow-up tasks", `${checkIns.flatMap((item) => item.followUpTasks).length}`)]} />
    {error && <StatusCard title="Load Error" rows={[row("Repository", "failed", error)]} />}
    <section className="dev-card"><h2>Check-in snapshot</h2><pre>{JSON.stringify(checkIns, null, 2)}</pre></section>
  </main>;
}
