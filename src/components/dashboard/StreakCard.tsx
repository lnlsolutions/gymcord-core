import { Flame } from "lucide-react";
import type { StreakSnapshot } from "../../types/gymcord";
import { shortDate } from "../../lib/storage";
import { DashboardPanel } from "./cardUtils";
export function StreakCard({ streak }: { streak: StreakSnapshot }) { return <DashboardPanel title="Streak" eyebrow="Consistency" action={<Flame size={20} />}><div className="streak-calendar">{streak.weeklyCalendar.map((day) => <span key={day.date} className={day.active ? "active" : day.missed ? "missed" : ""}>{shortDate(day.date).split(" ")[0]}</span>)}</div><p className="muted-line">Current {streak.currentStreak} days · Longest {streak.longestStreak} days{streak.streakInDanger ? " · log today to protect it" : ""}</p></DashboardPanel>; }
