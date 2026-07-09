import type { MemberCheckIn } from "../../repositories/CheckInRepository";
import { Panel } from "./shared";
export function AtlasInsightPanel({ checkIn }: { checkIn: MemberCheckIn }) { return <Panel title="Atlas Insight Metadata"><ul>{checkIn.atlasInsights.map((i) => <li key={i.id}>{i.category}: {i.summary} ({Math.round(i.confidence * 100)}% · {i.source})</li>)}</ul></Panel>; }
