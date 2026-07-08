import type { DailyLog } from "../../types/gymcord";
import { DashboardPanel, ProgressBar } from "./cardUtils";
export function HydrationCard({ dayLog }: { dayLog: DailyLog }) { const value = Math.min(100, Math.round((dayLog.water / 8) * 100)); return <DashboardPanel title="Water tracker" eyebrow="Hydration" action={<strong>{dayLog.water}/8</strong>}><ProgressBar value={value} /><p className="muted-line">Cups logged today.</p></DashboardPanel>; }
