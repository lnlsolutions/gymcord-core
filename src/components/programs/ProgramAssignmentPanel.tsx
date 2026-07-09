import { useState } from "react";
import type { Program } from "../../repositories";
export function ProgramAssignmentPanel({ program, onAssign }: { program?: Program; onAssign: (memberId: string, startsOn: string) => void }) {
  const [memberId, setMemberId] = useState("member_demo");
  const [startsOn, setStartsOn] = useState(new Date().toISOString().slice(0, 10));
  return <section className="panel-card"><p className="eyebrow">Assign program to member</p><h2>Assignment status</h2><div className="set-grid"><input value={memberId} onChange={(e) => setMemberId(e.target.value)} placeholder="Member ID" /><input type="date" value={startsOn} onChange={(e) => setStartsOn(e.target.value)} /><button className="primary-button" disabled={!program} onClick={() => onAssign(memberId, startsOn)}>Assign</button></div><p>{program ? `${program.assignments.length} assignment(s) on ${program.title}` : "Select a program to assign."}</p>{program?.assignments.map((assignment) => <small key={assignment.id} className="assignment-row">{assignment.memberId} · {assignment.status} · starts {assignment.startsOn}</small>)}</section>;
}
