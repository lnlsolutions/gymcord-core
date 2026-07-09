import type { MemberCheckIn } from "../../repositories/CheckInRepository";
import { Panel, Metric } from "./shared";
export function ComplianceReview({ checkIn }: { checkIn: MemberCheckIn }) { return <Panel title="Compliance Review"><div className="dev-grid"><Metric label="Workout" value={`${checkIn.compliance.workout} · ${checkIn.compliance.workoutPercent}%`} /><Metric label="Nutrition" value={`${checkIn.compliance.nutrition} · ${checkIn.compliance.nutritionPercent}%`} /><Metric label="Notes" value={checkIn.compliance.notes ?? "No compliance notes."} /></div></Panel>; }
