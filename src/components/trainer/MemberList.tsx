import type { TrainerMember } from "../../types/domain";
import { MemberCard } from "./MemberCard";
export function MemberList({ members, selectedId, onSelect }: { members: TrainerMember[]; selectedId?: string; onSelect: (member: TrainerMember) => void }) {
  return <section className="panel premium-card"><p className="pill">Members loaded: {members.length}</p><h2>Member list</h2><div className="stacked-list">{members.map((member) => <MemberCard key={member.id} member={member} selected={member.id === selectedId} onSelect={onSelect} />)}</div></section>;
}
