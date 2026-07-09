import type { QADiagnosticSnapshot } from "../../repositories/QARepository";
import { QAPanel } from "./QAPanel";
export function SmokeTestChecklist({ snapshot }: { snapshot: QADiagnosticSnapshot }) { return <>{snapshot.smokeTests.map((section) => <QAPanel key={section.id} title={`Smoke test checklist · ${section.title}`} items={section.items} />)}</>; }
