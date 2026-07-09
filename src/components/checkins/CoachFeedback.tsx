import type { MemberCheckIn } from "../../repositories/CheckInRepository";
import { Panel } from "./shared";
export function CoachFeedback({ checkIn }: { checkIn: MemberCheckIn }) { return <Panel title="Coach Feedback"><p>{checkIn.coachFeedbackNotes ?? "Awaiting trainer review."}</p></Panel>; }
