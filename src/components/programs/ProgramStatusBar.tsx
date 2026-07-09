import type { Program } from "../../repositories";
export function ProgramStatusBar({ program, pendingSync, saveStatus, onPublish, onDraft }: { program?: Program; pendingSync: number; saveStatus: string; onPublish: () => void; onDraft: () => void }) {
  return <section className="program-status-bar panel-card"><div><p className="eyebrow">Draft / Publish</p><h2>{program?.status ?? "No program selected"}</h2><small>{saveStatus} · {pendingSync} pending sync write(s)</small></div><div className="program-actions"><button onClick={onDraft} disabled={!program}>Save draft</button><button className="primary-button" onClick={onPublish} disabled={!program || program.status === "published"}>Publish</button></div></section>;
}
