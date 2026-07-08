import type { NutritionSaveResult } from "../../repositories/NutritionRepository";

export function NutritionSummary({ result, saveStatus, offlineQueueSize }: { result?: NutritionSaveResult | null; saveStatus: string; offlineQueueSize: number }) {
  return (
    <section className="panel">
      <h3>Daily nutrition summary</h3>
      <div className="dev-grid">
        <div className="dev-row"><strong>Completion</strong><span>{result?.completionState ?? "pending"}</span></div>
        <div className="dev-row"><strong>XP award</strong><span>{result ? `+${result.xpAward}` : "—"}</span></div>
        <div className="dev-row"><strong>Mission update</strong><span>{result ? `${result.missionProgress}%` : "—"}</span></div>
        <div className="dev-row"><strong>Streak update</strong><span>{result ? `${result.streakCount} day(s)` : "—"}</span></div>
        <div className="dev-row"><strong>Save status</strong><span>{saveStatus}</span></div>
        <div className="dev-row"><strong>Offline queue</strong><span>{offlineQueueSize} queued write(s)</span></div>
      </div>
    </section>
  );
}
