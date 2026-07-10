import type { CSSProperties } from "react";
import { Bot, CalendarDays, Camera, Dumbbell, GlassWater, Moon, Salad, TrendingUp } from "lucide-react";
import type { Achievement, AtlasInsight, DailyLog, Mission, Page, Profile, StreakSnapshot, TransformationSnapshot, XpSnapshot, WorkoutDay } from "../../types/gymcord";
import { getLastSevenDays } from "../../lib/storage";
import { EmptyState } from "../Common/EmptyState";

interface DashboardProps { profile: Profile; dayLog: DailyLog; score: number; workoutCompletion: number; weeklyCompletion: number; todayWorkout: WorkoutDay; logs: Record<string, DailyLog>; mission: Mission; xp: XpSnapshot; streak: StreakSnapshot; nextAchievement: Achievement; atlasInsights: AtlasInsight[]; transformation: TransformationSnapshot; setPage: (page: Page) => void; }

function todayLabel() { return new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" }).format(new Date()); }
function hasWorkout(log: DailyLog) { return Object.values(log.completedExercises).some(Boolean); }
function hasJournal(log: DailyLog) { return Boolean(log.protein || log.calories || log.water || log.sleep || log.mealPhoto || log.ingredients); }

export function Dashboard({ profile, dayLog, workoutCompletion, weeklyCompletion, todayWorkout, logs, atlasInsights, setPage }: DashboardProps) {
  const firstName = profile.name.split(" ")[0] || "Member";
  const trainedDays = getLastSevenDays().filter((date) => hasWorkout(logs[date] || ({ completedExercises: {} } as DailyLog))).length;
  const recent = Object.values(logs).filter(hasJournal).slice(-3).reverse();
  const atlasMessage = atlasInsights[0]?.message || (dayLog.calories === 0 ? "You haven't logged breakfast." : "Ready for your next healthy choice?");

  return (
    <section className="page premium-home">
      <div className="home-header-card">
        <p className="eyebrow">Good morning, {firstName}</p>
        <h2>What should I do today?</h2>
        <span>{todayLabel()} · Independent member · Premium</span>
      </div>

      <article className="premium-card primary-workout-card">
        <div className="card-heading"><div><p className="eyebrow">Today's Workout</p><h3>{todayWorkout.title}</h3></div><span>{todayWorkout.duration} min</span></div>
        {todayWorkout.exercises.length ? <><p>{todayWorkout.focus}</p><div className="exercise-pills">{todayWorkout.exercises.slice(0, 4).map((exercise) => <span key={exercise.id}>{exercise.name}</span>)}</div><button className="primary-button dark" onClick={() => setPage("workouts")}>Start Workout</button></> : <EmptyState icon={<Dumbbell />} headline="Let's build your first workout." description="Create a simple session tailored to your goal and equipment." cta="Create Workout" onAction={() => setPage("workouts")} />}
      </article>

      <button className="premium-card atlas-home-card" onClick={() => setPage("atlas")}>
        <Bot size={24} /><div><p className="eyebrow">Atlas Coach</p><h3>{atlasMessage}</h3><span>Chat with Atlas</span></div>
      </button>

      <article className="premium-card journal-summary-card">
        <div className="card-heading"><div><p className="eyebrow">Today's Journal</p><h3>My fitness diary</h3></div><CalendarDays size={22} /></div>
        {hasJournal(dayLog) ? <div className="journal-metrics"><span><Salad size={17} /> {dayLog.calories ? `${dayLog.calories} cal` : "No meals"}</span><span><GlassWater size={17} /> {dayLog.water || 0}/8 water</span><span><Moon size={17} /> {dayLog.sleep ? `${dayLog.sleep}h sleep` : "No sleep"}</span></div> : <EmptyState icon={<Salad />} headline="Start tracking your day." description="Log meals, water, sleep, recovery, measurements, photos, or a note." cta="Open Journal" onAction={() => setPage("journal")} />}
      </article>

      <article className="premium-card weekly-progress-card">
        <div className="progress-ring-large" style={{ "--progress": `${weeklyCompletion}%` } as CSSProperties}><strong>{trainedDays ? `${weeklyCompletion}%` : "—"}</strong></div>
        <div><p className="eyebrow">Weekly Progress</p><h3>{trainedDays ? `${trainedDays} active days this week` : "No progress data yet."}</h3><span>{trainedDays ? "Keep stacking small wins." : "Complete a workout or journal entry to see progress."}</span></div>
      </article>

      {recent.length > 0 && <article className="premium-card"><p className="eyebrow">Recent Activity</p>{recent.map((log) => <div className="activity-row" key={log.date}><TrendingUp size={18} /><span>{log.date}: journal updated</span></div>)}</article>}
    </section>
  );
}
