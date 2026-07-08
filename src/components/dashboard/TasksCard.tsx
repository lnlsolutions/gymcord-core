import { CheckCircle2 } from "lucide-react";
import type { Mission } from "../../types/gymcord";
import { DashboardPanel, ProgressBar } from "./cardUtils";
export function TasksCard({ mission }: { mission: Mission }) { return <DashboardPanel title="Upcoming tasks" eyebrow="Next actions">{mission.tasks.map((task) => <div className={`mission-task ${task.completed ? "complete" : ""}`} key={task.id}><CheckCircle2 size={18} /><div><strong>{task.title}</strong><span>{task.description}</span><ProgressBar value={task.completionPercentage} /></div><em>{task.completionPercentage}%</em></div>)}</DashboardPanel>; }
