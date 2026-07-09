import type { MemberCheckIn } from "../../repositories/CheckInRepository";
import { Panel, Metric } from "./shared";
export function ProgressTrendReview({ checkIn }: { checkIn: MemberCheckIn }) { return <Panel title="Progress Trend"><div className="dev-grid"><Metric label="Direction" value={checkIn.progressTrend.direction} /><Metric label="Summary" value={checkIn.progressTrend.summary} /></div></Panel>; }
