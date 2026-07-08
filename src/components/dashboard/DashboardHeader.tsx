import { ChevronRight, Sparkles } from "lucide-react";
import type { Profile } from "../../types/gymcord";
export function DashboardHeader({ profile, onStartWorkout }: { profile: Profile; onStartWorkout?: () => void }) {
  const firstName = profile.name.split(" ")[0] || "Athlete";
  return <header className="mission-hero member-dashboard-hero"><div><p className="pill"><Sparkles size={14} /> Member Dashboard</p><h2>Welcome back, {firstName}.</h2><p>Atlas has your training, nutrition, hydration, progress, and next tasks ready.</p></div><button onClick={onStartWorkout}>Start workout <ChevronRight size={18} /></button></header>;
}
