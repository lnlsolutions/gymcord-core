import type { MemberCheckIn } from "../../repositories/CheckInRepository";
import { Panel } from "./shared";
export function RiskFlagPanel({ checkIn }: { checkIn: MemberCheckIn }) { return <Panel title="Risk Flags"><ul>{checkIn.riskFlags.map((r) => <li key={r.id}>{r.level} {r.category}: {r.summary}</li>)}</ul></Panel>; }
