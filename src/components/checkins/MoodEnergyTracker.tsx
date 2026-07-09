import type { MemberCheckIn } from "../../repositories/CheckInRepository";
import { Panel, Metric } from "./shared";
export function MoodEnergyTracker({ checkIn }: { checkIn: MemberCheckIn }) { return <Panel title="Mood / Energy / Soreness"><div className="dev-grid"><Metric label="Mood" value={`${checkIn.mood.score}/5 ${checkIn.mood.notes ?? ""}`} /><Metric label="Energy" value={`${checkIn.energy.score}/5 ${checkIn.energy.notes ?? ""}`} /><Metric label="Soreness" value={`${checkIn.soreness.score}/5 ${checkIn.soreness.notes ?? ""}`} /></div></Panel>; }
