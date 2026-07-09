import type { TrainerMember } from "../../types/domain";
export function ProgressOverview({ members }: { members: TrainerMember[] }) {
  const avg = members.length ? Math.round(members.reduce((sum, member) => sum + member.progressScore, 0) / members.length) : 0;
  return <section className="panel premium-card"><p className="pill">Progress overview</p><h2>{avg}% average progress</h2><p className="muted-line">Aggregated through member repositories for trainer review.</p></section>;
}
