import type { Mission } from "../../types/gymcord";
import { DashboardPanel, ProgressBar } from "./cardUtils";
export function MissionCard({ mission }: { mission: Mission }) { return <DashboardPanel title={mission.title} eyebrow="Mission progress" action={<strong>{mission.earnedXp}/{mission.xpReward} XP</strong>}><p>{mission.description}</p><ProgressBar value={mission.completionPercentage} /><p className="muted-line">{mission.tasks.filter((task) => task.completed).length}/{mission.tasks.length} tasks complete</p></DashboardPanel>; }
