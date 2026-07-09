import type { TrainerMember } from "../../types/domain";
export function MemberCard({ member, selected, onSelect }: { member: TrainerMember; selected: boolean; onSelect: (member: TrainerMember) => void }) {
  return <button className={`panel member-card ${selected ? "active" : ""}`} onClick={() => onSelect(member)}><strong>{member.name}</strong><span>{member.goal}</span><small>{member.status.replace("_", " ")} · {member.workoutCompliance}% workout</small></button>;
}
