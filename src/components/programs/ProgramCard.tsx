import type { Program } from "../../repositories";
export function ProgramCard({ program, selected, onSelect, onDuplicate }: { program: Program; selected: boolean; onSelect: () => void; onDuplicate: () => void }) {
  return <article className={`program-card ${selected ? "selected" : ""}`}><button onClick={onSelect}><span className="pill">{program.status}</span><h3>{program.title}</h3><p>{program.goal} · {program.durationWeeks} weeks · {program.schedule.length} days</p><small>{program.assignments.length} assignment(s)</small></button><button className="ghost-button" onClick={onDuplicate}>Duplicate</button></article>;
}
