import type { TrainerMember } from "../../types/domain";
export function MemberProfile({ member }: { member?: TrainerMember }) {
  if (!member) return <section className="panel premium-card"><h2>Select a member</h2></section>;
  return <section className="panel premium-card"><p className="pill">Member detail view</p><h2>{member.name}</h2><p>{member.goal}</p><dl className="data-flow-grid"><div><dt>Status</dt><dd>{member.status}</dd></div><div><dt>Workout</dt><dd>{member.workoutCompliance}%</dd></div><div><dt>Nutrition</dt><dd>{member.nutritionCompliance}%</dd></div><div><dt>Progress</dt><dd>{member.progressScore}%</dd></div></dl></section>;
}
