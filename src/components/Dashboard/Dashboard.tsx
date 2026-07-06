import type { DailyLog, Profile, Page } from "../../types/gymcord";

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="card">
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}

export function Dashboard({
  profile,
  workoutPct,
  weeklyCompletion,
  dayLog,
  score,
  selectedDate,
  setPage,
}: {
  profile: Profile;
  workoutPct: number;
  weeklyCompletion: number;
  dayLog: DailyLog;
  score: number;
  selectedDate: string;
  setPage: (page: Page) => void;
}) {
  return (
    <section className="page">
      <div className="hero-card">
        <p className="pill">{selectedDate}</p>
        <h2>{profile.goal}</h2>
        <p>
          Track today. Review any day. Build proof of progress through training,
          meals, photos, and consistency.
        </p>
        <button onClick={() => setPage("train")}>Start Training</button>
      </div>

      <div className="grid">
        <Card label="Today" value={`${workoutPct}%`} />
        <Card label="7-Day Avg" value={`${weeklyCompletion}%`} />
        <Card label="Protein" value={`${dayLog.protein}g`} />
        <Card label="Score" value={`${score}%`} />
      </div>

      <div className={score >= 85 ? "panel reward-ready" : "panel"}>
        <h3>{score >= 85 ? "Reward Eligible 🎁" : "Reward Progress"}</h3>
        <p>
          {score >= 85
            ? "You reached the beta reward threshold."
            : "Reach 85% score to unlock reward eligibility."}
        </p>
        <span>
          Rewards may include a free month, Starbucks, Amazon, prepaid debit, or
          gym perks.
        </span>
      </div>

      <div className="panel">
        <h3>Today’s Data</h3>
        <p>Workout completion: {workoutPct}%</p>
        <p>Protein: {dayLog.protein}g</p>
        <p>Water: {dayLog.water} / 8</p>
        <p>Calories: {dayLog.calories || "Not logged"}</p>
      </div>

      <div className="panel">
        <h3>AI Coach Focus</h3>
        <p>
          {workoutPct < 50
            ? "Complete today’s workout first. Training consistency has the biggest impact."
            : dayLog.protein < 100
            ? "Protein is your next priority. Aim closer to 100–130g today."
            : "Great work. Keep your meals, water, and photos updated."}
        </p>
      </div>
    </section>
  );
}
