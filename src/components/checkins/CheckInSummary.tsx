import type { MemberCheckIn } from "../../repositories/CheckInRepository";
import { AtlasInsightPanel } from "./AtlasInsightPanel";
import { CoachFeedback } from "./CoachFeedback";
import { ComplianceReview } from "./ComplianceReview";
import { FollowUpTasks } from "./FollowUpTasks";
import { GoalReflection } from "./GoalReflection";
import { MoodEnergyTracker } from "./MoodEnergyTracker";
import { ProgressTrendReview } from "./ProgressTrendReview";
import { RiskFlagPanel } from "./RiskFlagPanel";
export function CheckInSummary({ checkIn }: { checkIn: MemberCheckIn }) { return <div className="grid" style={{ gridTemplateColumns: "1fr" }}><MoodEnergyTracker checkIn={checkIn} /><ComplianceReview checkIn={checkIn} /><ProgressTrendReview checkIn={checkIn} /><GoalReflection checkIn={checkIn} /><CoachFeedback checkIn={checkIn} /><AtlasInsightPanel checkIn={checkIn} /><RiskFlagPanel checkIn={checkIn} /><FollowUpTasks checkIn={checkIn} /></div>; }
