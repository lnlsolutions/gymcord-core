import type { TrainerMember, TrainerProgramAssignment } from "../../types/domain";
export function ProgramAssignment({ member, assignments, onAssign }: { member?: TrainerMember; assignments: TrainerProgramAssignment[]; onAssign: (title: string) => void }) {
  return <section className="panel premium-card"><p className="pill">Program assignment</p><h2>Assigned programs</h2><ul className="check-list">{assignments.map((item) => <li key={item.id}>{item.programTitle} · {item.status}</li>)}</ul><button className="primary-button" disabled={!member} onClick={() => onAssign("Coach Custom Block")}>Assign next block</button></section>;
}
