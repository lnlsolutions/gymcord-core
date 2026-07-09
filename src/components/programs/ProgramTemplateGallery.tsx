import type { ProgramTemplate } from "../../repositories";
export function ProgramTemplateGallery({ templates, onUse }: { templates: ProgramTemplate[]; onUse: (template: ProgramTemplate) => void }) {
  return <section className="panel-card"><p className="eyebrow">Program templates</p><h2>Start from a proven structure</h2><div className="template-grid">{templates.map((template) => <article className="program-card" key={template.id}><span className="pill">{template.difficulty}</span><h3>{template.title}</h3><p>{template.description}</p><small>{template.weeks} weeks · {template.schedule.length} days</small><button className="ghost-button" onClick={() => onUse(template)}>Use template</button></article>)}</div></section>;
}
