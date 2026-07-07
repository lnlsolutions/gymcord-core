import type { DailyLog, Page, Profile } from "../../types/gymcord";

function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="card">
      <p>{title}</p>
      <strong>{value}</strong>
      <span>{subtitle}</span>
    </div>
  );
}

export function Dashboard({
  profile,
  dayLog,
  score,
  workoutCompletion,
  setPage,
}: {
  profile: Profile;
  dayLog: DailyLog;
  score: number;
  workoutCompletion: number;
  setPage: (page: Page) => void;
}) {
  return (
    <section className="page">

      <div className="hero-card">

        <p className="pill">Today's Goal</p>

        <h2>{profile.goal}</h2>

        <p>
          Every workout, meal, photo and measurement moves you closer to your
          transformation.
        </p>

        <button onClick={() => setPage("train")}>
          Start Today's Workout
        </button>

      </div>

      <div className="grid">

        <StatCard
          title="Transformation"
          value={`${score}%`}
          subtitle="AI Score"
        />

        <StatCard
          title="Workout"
          value={`${workoutCompletion}%`}
          subtitle="Completed"
        />

        <StatCard
          title="Protein"
          value={`${dayLog.protein}g`}
          subtitle="Today's Intake"
        />

        <StatCard
          title="Water"
          value={`${dayLog.water}/8`}
          subtitle="Hydration"
        />

      </div>

      <div className="panel">

        <h3>Today's Checklist</h3>

        <div className="habit-list">

          <div className="habit-item">
            <span>🏋 Workout</span>
            <strong>{workoutCompletion}%</strong>
          </div>

          <div className="habit-item">
            <span>🍽 Protein</span>
            <strong>{dayLog.protein}g</strong>
          </div>

          <div className="habit-item">
            <span>💧 Water</span>
            <strong>{dayLog.water}/8</strong>
          </div>

          <div className="habit-item">
            <span>📸 Progress Photo</span>
            <strong>{dayLog.photos.front ? "✓" : "—"}</strong>
          </div>

          <div className="habit-item">
            <span>⚖ Weight Logged</span>
            <strong>
              {dayLog.measurements.weight ? "✓" : "—"}
            </strong>
          </div>

        </div>

      </div>

      <div className="panel">

        <h3>AI Coach</h3>

        <p>
          {score >= 90
            ? "Excellent consistency. Continue progressing your lifts this week."
            : score >= 75
            ? "You're close. Increase protein and complete today's workout."
            : "Focus on today's workout and nutrition before worrying about anything else."}
        </p>

      </div>

      <div className="panel reward-ready">

        <h3>Reward Progress</h3>

        <p>
          Rewards unlock through verified consistency, nutrition,
          measurements and real progress—not simply opening the app.
        </p>

      </div>

    </section>
  );
}
