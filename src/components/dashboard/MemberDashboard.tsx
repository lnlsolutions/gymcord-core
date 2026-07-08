import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth";
import { dashboardRepository, type DashboardData } from "../../repositories/DashboardRepository";
import type { Page } from "../../types/gymcord";
import { AtlasCard } from "./AtlasCard";
import { DailySummaryCard } from "./DailySummaryCard";
import { DashboardHeader } from "./DashboardHeader";
import { HydrationCard } from "./HydrationCard";
import { MissionCard } from "./MissionCard";
import { NutritionCard } from "./NutritionCard";
import { StreakCard } from "./StreakCard";
import { TasksCard } from "./TasksCard";
import { WeightCard } from "./WeightCard";
import { WorkoutCard } from "./WorkoutCard";
import { XpCard } from "./XpCard";

export function MemberDashboard({ selectedDate, setPage, onLoaded }: { selectedDate?: string; setPage?: (page: Page) => void; onLoaded?: (data: DashboardData) => void }) {
  const auth = useAuth();
  const repository = useMemo(() => dashboardRepository, []);
  const [data, setData] = useState<DashboardData | null>(null);
  const [status, setStatus] = useState("Loading dashboard data from repositories…");

  useEffect(() => { let active = true; setStatus("Refreshing repository dashboard data…"); repository.load(auth.session, selectedDate).then((next) => { if (!active) return; setData(next); onLoaded?.(next); setStatus(`Loaded ${new Date(next.loadedAt).toLocaleTimeString()}`); }).catch((error: Error) => active && setStatus(`Dashboard repository failed: ${error.message}`)); return () => { active = false; }; }, [auth.session, onLoaded, repository, selectedDate]);

  if (!data) return <section className="page mission-control"><div className="panel premium-card"><p className="eyebrow">Member Dashboard</p><h2>{status}</h2></div></section>;
  return <section className="page mission-control member-dashboard"><DashboardHeader profile={data.profile} onStartWorkout={() => setPage?.("train")} /><p className="muted-line dashboard-refresh-status">{status} · Provider: {data.repositoryState.provider}</p><DailySummaryCard dayLog={data.dayLog} score={data.score} weeklyCompletion={data.weeklyCompletion} /><div className="member-dashboard-grid"><WorkoutCard workout={data.todayWorkout} completion={data.workoutCompletion} onOpen={() => setPage?.("train")} /><MissionCard mission={data.mission} /><XpCard xp={data.xp} /><StreakCard streak={data.streak} /><NutritionCard dayLog={data.dayLog} /><HydrationCard dayLog={data.dayLog} /><WeightCard profile={data.profile} dayLog={data.dayLog} /></div><TasksCard mission={data.mission} /><AtlasCard insights={data.atlasInsights} onOpen={() => setPage?.("coach")} /></section>;
}
