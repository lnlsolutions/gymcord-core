import type { AtlasContext, AtlasInsight, Mission, StreakSnapshot } from "../../types/gymcord";

export function AtlasInsights({ insights, context, mission, streak }: { insights: AtlasInsight[]; context: AtlasContext; mission: Mission; streak: StreakSnapshot }) {
  return (
    <section className="panel atlas-insights">
      <h3>Progress insights</h3>
      <div className="atlas-status-grid">
        <div><span>Today's focus</span><strong>{context.todayFocus}</strong></div>
        <div><span>Mission</span><strong>{mission.completionPercentage}% complete</strong></div>
        <div><span>Recovery</span><strong>{context.recoveryStatus}</strong></div>
        <div><span>Streak</span><strong>{streak.currentStreak} days</strong></div>
      </div>
      {insights.map((insight) => <div key={insight.message} className="coach-card"><strong>{insight.priority} Priority</strong><p>{insight.message}</p></div>)}
    </section>
  );
}
