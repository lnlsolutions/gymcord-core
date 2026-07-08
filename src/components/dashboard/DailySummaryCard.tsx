import { Activity } from "lucide-react";
import type { DailyLog } from "../../types/gymcord";
import { DashboardPanel, ProgressBar } from "./cardUtils";
export function DailySummaryCard({ dayLog, score, weeklyCompletion }: { dayLog: DailyLog; score: number; weeklyCompletion: number }) {
  const recovery = Math.min(100, Math.round((dayLog.sleep / 8) * 55 + (dayLog.energy / 5) * 25 + (dayLog.mood / 5) * 20));
  return <DashboardPanel title="Daily summary" eyebrow="Today" action={<Activity size={20} />}><div className="dashboard-stat-row"><strong>{score}%</strong><span>Momentum</span><strong>{recovery}%</strong><span>Recovery</span><strong>{weeklyCompletion}%</strong><span>Week</span></div><ProgressBar value={score} /><p className="muted-line">{dayLog.steps.toLocaleString()} steps · {dayLog.sleep || 0}h sleep · mood {dayLog.mood}/5</p></DashboardPanel>;
}
