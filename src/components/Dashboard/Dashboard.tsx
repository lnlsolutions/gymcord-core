import type { ReactNode } from "react";
import { Activity, Bot, CalendarDays, ChevronRight, Flame, Moon, Salad, Sparkles, Trophy } from "lucide-react";
import type { DailyLog, Page, Profile } from "../../types/gymcord";
import type { WorkoutDay } from "../../types/gymcord";
import { getLastSevenDays, shortDate } from "../../lib/storage";

interface DashboardProps {
  profile: Profile;
  dayLog: DailyLog;
  score: number;
  workoutCompletion: number;
  weeklyCompletion: number;
  todayWorkout: WorkoutDay;
  logs: Record<string, DailyLog>;
  setPage: (page: Page) => void;
}

function MetricCard({ icon, label, value, detail }: { icon: ReactNode; label: string; value: string; detail: string }) {
  return <article className="metric-card"><div className="metric-icon">{icon}</div><p>{label}</p><strong>{value}</strong><span>{detail}</span></article>;
}

function ProgressBar({ value }: { value: number }) {
  return <div className="progress-track" aria-label={`${value}% complete`}><span style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div>;
}

export function Dashboard({ profile, dayLog, score, workoutCompletion, weeklyCompletion, todayWorkout, logs, setPage }: DashboardProps) {
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
          <h3>{profile.goal || "Build a stronger body"}</h3>
          <span>Complete the workout, hit 130g protein, drink 8 waters, and log recovery.</span>
        </div>
        <div className="mission-score"><strong>{score}</strong><span>Momentum</span></div>
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
          <div className="card-heading"><h3><Trophy size={20} /> Recent Achievements</h3></div>
          <div className="achievement-list">
            <span>{dayLog.mealPhoto ? "Meal photo verified" : "Meal photo ready"}</span>
            <span>{workoutCompletion > 0 ? "Workout streak started" : "Workout queued"}</span>
            <span>{dayLog.measurements.weight ? "Measurement logged" : "Baseline pending"}</span>
          </div>
        </article>
      </div>

      <button className="atlas-entry-card" onClick={() => setPage("coach")}>
        <div className="atlas-orb"><Bot size={24} /></div>
        <div><p className="eyebrow">Atlas AI Assistant</p><h3>Ask Atlas what to do next.</h3><span>Personalized coaching architecture for workouts, meals, recovery, and retention.</span></div>
        <ChevronRight size={22} />
      </button>
    </section>
  );
}
