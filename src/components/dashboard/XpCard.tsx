import type { XpSnapshot } from "../../types/gymcord";
import { DashboardPanel, ProgressBar } from "./cardUtils";
export function XpCard({ xp }: { xp: XpSnapshot }) { return <DashboardPanel title={`Level ${xp.currentLevel}`} eyebrow="XP progress" action={<strong>{xp.totalXp} XP</strong>}><ProgressBar value={xp.progressPercentage} /><p className="muted-line">{xp.currentXp}/{xp.xpNeededForNextLevel} XP to next level</p></DashboardPanel>; }
