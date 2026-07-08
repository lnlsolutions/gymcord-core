import type { ReactNode } from "react";
import { Activity, Award, Bot, CalendarDays, CheckCircle2, ChevronRight, Flame, Moon, Salad, Sparkles } from "lucide-react";
import type { Achievement, AtlasInsight, DailyLog, Mission, Page, Profile, StreakSnapshot, TransformationSnapshot, XpSnapshot } from "../../types/gymcord";
import type { WorkoutDay } from "../../types/gymcord";
import { getLastSevenDays, shortDate } from "../../lib/storage";
import { MomentumRing } from "../Transformation/MomentumRing";
import { TransformationTimeline } from "../Transformation/TransformationTimeline";

interface DashboardProps {
  profile: Profile;
  dayLog: DailyLog;
  score: number;
  workoutCompletion: number;
  weeklyCompletion: number;
  todayWorkout: WorkoutDay;
  logs: Record<string, DailyLog>;
  mission: Mission;
  xp: XpSnapshot;
  streak: StreakSnapshot;
  nextAchievement: Achievement;
  atlasInsights: AtlasInsight[];
  transformation: TransformationSnapshot;
  setPage: (page: Page) => void;
}

function MetricCard({ icon, label, value, detail }: { icon: ReactNode; label: string; value: string; detail: string }) {
  return <article className="metric-card"><div className="metric-icon">{icon}</div><p>{label}</p><strong>{value}</strong><span>{detail}</span></article>;
}

function ProgressBar({ value }: { value: number }) {
  return <div className="progress-track" aria-label={`${value}% complete`}><span style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div>;
}

export function Dashboard({ profile, dayLog, score, workoutCompletion, weeklyCompletion, todayWorkout, logs, mission, xp, streak, nextAchievement, atlasInsights, transformation, setPage }: DashboardProps) {
  const firstName = profile.name.split(" ")[0] || "Athlete";
  const recoveryScore = Math.round(((dayLog.sleep / 8) * 55 + (dayLog.energy / 5) * 25 + (dayLog.mood / 5) * 20));
  const nutritionProgress = Math.min(100, Math.round((dayLog.protein / 130) * 65 + (dayLog.water / 8) * 35));
  const completedThisWeek = getLastSevenDays().filter((date) => Object.values(logs[date]?.completedExercises || {}).some(Boolean));

  return (
    <section className="page mission-control">
      <div className="mission-hero">
        <div>
          <p className="pill"><Sparkles size={14} /> Mission Control</p>
          <h2>Welcome back, {firstName}.</h2>
          <p>Your operating dashboard for training, nutrition, recovery, and progress momentum.</p>
        </div>
        <button onClick={() => setPage("train")}>Start workout <ChevronRight size={18} /></button>
      </div>

      <div className="daily-mission-card">
        <div>
          <p className="eyebrow">Daily Mission</p>
          <h3>{mission.title}: {profile.goal || "Build a stronger body"}</h3>
          <span>{mission.description}</span>
        </div>
        <div className="mission-score"><strong>{mission.completionPercentage}%</strong><span>{mission.earnedXp}/{mission.xpReward} XP</span></div>
      </div>

      <MomentumRing snapshot={transformation.momentum} />

      <div className="prediction-callouts">
        {transformation.prediction.messages.map((message) => <div key={message}>{message}</div>)}
      </div>

      <TransformationTimeline snapshot={transformation} />

      <div className="mission-task-list">
        {mission.tasks.map((task) => <article className={`mission-task ${task.completed ? "complete" : ""}`} key={task.id}>
          <CheckCircle2 size={18} />
          <div><strong>{task.title}</strong><span>{task.description}</span><ProgressBar value={task.completionPercentage} /></div>
          <em>{task.completionPercentage}%</em>
        </article>)}
      </div>

      <div className="metric-grid">
        <MetricCard icon={<Flame size={20} />} label="Momentum Score" value={`${score}%`} detail={score >= 80 ? "Investor-demo ready day" : "Two actions from green"} />
        <MetricCard icon={<Salad size={20} />} label="Nutrition" value={`${nutritionProgress}%`} detail={`${dayLog.protein}g protein · ${dayLog.water}/8 water`} />
        <MetricCard icon={<Moon size={20} />} label="Recovery" value={`${Math.min(100, recoveryScore)}%`} detail={`${dayLog.sleep || 0}h sleep · Energy ${dayLog.energy}/5`} />
        <MetricCard icon={<Activity size={20} />} label="Weekly Activity" value={`${weeklyCompletion}%`} detail={`${completedThisWeek.length}/7 days trained`} />
      </div>

      <article className="panel premium-card workout-summary-card">
        <div className="card-heading"><div><p className="eyebrow">Today's Workout</p><h3>{todayWorkout.title}</h3></div><span>{todayWorkout.duration} min</span></div>
        <p>{todayWorkout.focus}</p>
        <ProgressBar value={workoutCompletion} />
        <button className="secondary-button" onClick={() => setPage("train")}>Open session</button>
      </article>

      <div className="dashboard-split">
        <article className="panel premium-card">
          <div className="card-heading"><h3><CalendarDays size={20} /> Upcoming Schedule</h3></div>
          <div className="schedule-list">
            {getLastSevenDays().slice(4).map((date, index) => <div key={date}><strong>{shortDate(date)}</strong><span>{index === 0 ? todayWorkout.title : index === 1 ? "Glutes & Hamstrings" : "Recovery + mobility"}</span></div>)}
          </div>
        </article>

        <article className="panel premium-card">
          <div className="card-heading"><h3><Flame size={20} /> Streak</h3><strong>{streak.currentStreak} days</strong></div>
          <div className="streak-calendar">
            {streak.weeklyCalendar.map((day) => <span key={day.date} className={day.active ? "active" : day.missed ? "missed" : ""}>{shortDate(day.date).split(" ")[0]}</span>)}
          </div>
          <p className="muted-line">Longest streak: {streak.longestStreak} days</p>
        </article>

        <article className="panel premium-card">
          <div className="card-heading"><h3><Award size={20} /> Next Achievement</h3></div>
          <div className="achievement-list">
            <span>{nextAchievement.unlocked ? "Unlocked" : "Locked"}: {nextAchievement.title}</span>
            <span>{nextAchievement.description}</span>
            <span>{nextAchievement.progress}/{nextAchievement.target} · {nextAchievement.completionPercentage}%</span>
          </div>
        </article>
      </div>

      <button className="atlas-entry-card" onClick={() => setPage("coach")}>
        <div className="atlas-orb"><Bot size={24} /></div>
        <div><p className="eyebrow">Atlas AI Assistant</p><h3>{atlasInsights[0]?.message || "Ask Atlas what to do next."}</h3><span>Contextual coaching powered by Mission, XP, Streak, and Achievement engines.</span></div>
        <ChevronRight size={22} />
      </button>
    </section>
  );
}
