import type { MemberCheckIn } from "../../repositories/CheckInRepository";
import { Panel } from "./shared";
export function GoalReflection({ checkIn }: { checkIn: MemberCheckIn }) { return <Panel title="Goal Reflection"><p>{checkIn.goalReflection || "No reflection yet."}</p></Panel>; }
