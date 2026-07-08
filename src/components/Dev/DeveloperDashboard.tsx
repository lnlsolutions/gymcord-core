import { useCallback, useState } from "react";
import { dashboardRepository, type DashboardData } from "../../repositories/DashboardRepository";
import { MemberDashboard } from "../dashboard/MemberDashboard";

function row(label: string, value: string, detail?: string) { return { label, value, detail }; }
function StatusCard({ title, rows }: { title: string; rows: { label: string; value: string; detail?: string }[] }) { return <section className="dev-card"><h2>{title}</h2><div className="dev-grid">{rows.map((item) => <div className="dev-row" key={item.label}><strong>{item.label}</strong><span>{item.value}</span>{item.detail && <small>{item.detail}</small>}</div>)}</div></section>; }

export function DeveloperDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [refreshStatus, setRefreshStatus] = useState("Waiting for dashboard repository load");
  const handleLoaded = useCallback((next: DashboardData) => { setData(next); setRefreshStatus(`Loaded at ${new Date(next.loadedAt).toLocaleString()}`); }, []);
  const logDates = Object.keys(data?.logs ?? {}).sort().reverse();

  return <main className="dev-page"><header className="dev-header"><p className="eyebrow">GymCord Developer Verification</p><h1>Member Dashboard</h1><p>Repository-backed diagnostics for the dashboard home in Mock and Supabase modes.</p></header><StatusCard title="Repository Status" rows={[row("Repository status", data ? "loaded" : "loading"), row("Active provider", data?.repositoryState.provider ?? dashboardRepository.providerName), row("Refresh status", refreshStatus), row("Offline queue", `${data?.repositoryState.offlineQueueSize ?? dashboardRepository.getOfflineQueue().length} queued write(s)`), row("Cache state", `${logDates.length} cached daily log(s)`, logDates.slice(0, 7).join(", ") || "No cached daily logs")]} /><StatusCard title="Loaded Dashboard Data" rows={[row("Member", data?.profile.name || data?.repositoryState.currentUser || "loading"), row("Workout", data?.todayWorkout.title ?? "loading"), row("Mission", data ? `${data.mission.completionPercentage}% complete` : "loading", data?.mission.title), row("XP", data ? `${data.xp.totalXp} total · level ${data.xp.currentLevel}` : "loading"), row("Streak", data ? `${data.streak.currentStreak} current / ${data.streak.longestStreak} longest` : "loading")]} /><MemberDashboard onLoaded={handleLoaded} /><section className="dev-card"><h2>Loaded dashboard data</h2><pre>{JSON.stringify(data, null, 2)}</pre></section></main>;
}
