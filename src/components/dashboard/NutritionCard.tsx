import { Salad } from "lucide-react";
import type { DailyLog } from "../../types/gymcord";
import { DashboardPanel, ProgressBar } from "./cardUtils";
export function NutritionCard({ dayLog }: { dayLog: DailyLog }) { const protein = Math.min(100, Math.round((dayLog.protein / 130) * 100)); return <DashboardPanel title="Nutrition" eyebrow="Fuel" action={<Salad size={20} />}><div className="dashboard-stat-row"><strong>{dayLog.calories}</strong><span>calories</span><strong>{dayLog.protein}g</strong><span>protein</span></div><ProgressBar value={protein} /><p className="muted-line">Targeting 130g protein for the day.</p></DashboardPanel>; }
