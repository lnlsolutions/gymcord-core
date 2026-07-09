import type { Program } from "../../repositories";
import { ProgramCard } from "./ProgramCard";
export function ProgramList({ programs, selectedId, onSelect, onCreate, onDuplicate }: { programs: Program[]; selectedId?: string; onSelect: (id: string) => void; onCreate: () => void; onDuplicate: (id: string) => void }) {
  return <section className="panel-card program-list"><div className="section-heading"><div><p className="eyebrow">Program list</p><h2>{programs.length} loaded</h2></div><button className="primary-button" onClick={onCreate}>Create program</button></div>{programs.map((program) => <ProgramCard key={program.id} program={program} selected={program.id === selectedId} onSelect={() => onSelect(program.id)} onDuplicate={() => onDuplicate(program.id)} />)}</section>;
}
