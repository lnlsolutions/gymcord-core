import type { ProgressRepositoryState } from "../../repositories/ProgressRepository";
export function ProgressSummary({ state }: { state: ProgressRepositoryState | null }) {
  return <div className="panel"><p className="eyebrow">Repository outputs</p><h3>Progress summary</h3><p>XP event: {state?.xpEvent ? `${state.xpEvent.points} XP (${state.xpEvent.reason})` : "—"}</p><p>Mission update: {state?.missionUpdate ? `${state.missionUpdate.completionPercentage}% complete` : "—"}</p><p>Streak update: {state?.streakUpdate ? `${state.streakUpdate.currentStreak} current / ${state.streakUpdate.longestStreak} longest` : "—"}</p><p>Offline queue: {state?.offlineQueue.length ?? 0}</p></div>;
}
