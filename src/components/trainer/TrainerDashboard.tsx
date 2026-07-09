import { useCallback, useEffect, useMemo, useState } from "react";
import { appConfig } from "../../config";
import { memberRepository } from "../../repositories/MemberRepository";
import { trainerRepository, type TrainerPortalState } from "../../repositories/TrainerRepository";
import type { TrainerMember } from "../../types/domain";
import { AtlasAlerts } from "./AtlasAlerts";
import { CoachNotes } from "./CoachNotes";
import { ComplianceCard } from "./ComplianceCard";
import { MemberList } from "./MemberList";
import { MemberProfile } from "./MemberProfile";
import { ProgramAssignment } from "./ProgramAssignment";
import { ProgressOverview } from "./ProgressOverview";
import { QuickActions } from "./QuickActions";
import { TrainerTasks } from "./TrainerTasks";

const trainerId = "trainer_demo";
const organizationId = "org_demo";

export function TrainerDashboard({ developer = false }: { developer?: boolean }) {
  const [members, setMembers] = useState<TrainerMember[]>([]);
  const [state, setState] = useState<TrainerPortalState | null>(null);
  const [selectedId, setSelectedId] = useState<string>();
  const [status, setStatus] = useState("Loading trainer portal…");

  const load = useCallback(() => {
    setStatus("Loading through repositories…");
    void Promise.all([
      memberRepository.list({ trainerId, organizationId }),
      trainerRepository.getPortalState(trainerId, organizationId),
    ]).then(([memberResult, portalResult]) => {
      setMembers(memberResult.data.items);
      setSelectedId((current) => current ?? memberResult.data.items[0]?.id);
      setState({ ...portalResult.data, summary: { ...portalResult.data.summary, activeMembers: memberResult.data.items.length, averageWorkoutCompliance: average(memberResult.data.items.map((member) => member.workoutCompliance)), averageNutritionCompliance: average(memberResult.data.items.map((member) => member.nutritionCompliance)) } });
      setStatus(`Loaded from ${memberResult.source}/${portalResult.source}`);
    }).catch((error: Error) => setStatus(`Trainer portal fallback: ${error.message}`));
  }, []);

  useEffect(load, [load]);
  const selected = useMemo(() => members.find((member) => member.id === selectedId), [members, selectedId]);

  return <main className="page screen trainer-dashboard"><section className="panel premium-card"><p className="pill">{developer ? "Developer page · /dev/trainer" : "Trainer Portal V1"}</p><h1>Trainer dashboard</h1><p className="muted-line">Manage members, assignments, compliance, progress, Atlas alerts, notes, daily tasks, and quick actions without UI backend SDK imports.</p><dl className="data-flow-grid"><div><dt>Active provider</dt><dd>{appConfig.backend.provider}</dd></div><div><dt>Trainer summary</dt><dd>{state ? `${state.summary.activeMembers} members · ${state.summary.openTasks} tasks` : "loading"}</dd></div><div><dt>Members loaded</dt><dd>{members.length}</dd></div><div><dt>Assigned programs</dt><dd>{state?.summary.assignedPrograms ?? "loading"}</dd></div><div><dt>Compliance metrics</dt><dd>{state ? `${state.summary.averageWorkoutCompliance}% workout / ${state.summary.averageNutritionCompliance}% nutrition` : "loading"}</dd></div><div><dt>Pending sync</dt><dd>{state?.pendingSync ?? 0}</dd></div><div><dt>Offline queue</dt><dd>{state?.offlineQueueLength ?? memberRepository.getOfflineQueue().length}</dd></div><div><dt>Save status</dt><dd>{state?.saveStatus ?? status}</dd></div></dl></section><section className="grid two-columns"><MemberList members={members} selectedId={selectedId} onSelect={(member) => setSelectedId(member.id)} /><MemberProfile member={selected} /></section><section className="grid two-columns"><ComplianceCard title="Workout compliance" value={state?.summary.averageWorkoutCompliance ?? 0} detail="Weekly completed sessions across active members." /><ComplianceCard title="Nutrition compliance" value={state?.summary.averageNutritionCompliance ?? 0} detail="Meal, water, and protein adherence across active members." /></section><section className="grid two-columns"><ProgramAssignment member={selected} assignments={state?.assignments ?? []} onAssign={(title) => { if (!selected) return; void trainerRepository.assignProgram({ organizationId, trainerId, memberId: selected.id, programId: `program_${Date.now()}`, programTitle: title, startsOn: new Date().toISOString().slice(0, 10), status: "queued" }).then(load); }} /><ProgressOverview members={members} /></section><section className="grid two-columns"><AtlasAlerts alerts={state?.alerts ?? []} /><CoachNotes notes={state?.notes ?? []} onAdd={(body) => { if (!selected) return; void trainerRepository.saveNote({ organizationId, trainerId, memberId: selected.id, body, pinned: false }).then(load); }} /></section><section className="grid two-columns"><TrainerTasks tasks={state?.tasks ?? []} /><QuickActions onRefresh={load} /></section><p className="muted-line">{status}</p></main>;
}

function average(values: number[]) { return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0; }
