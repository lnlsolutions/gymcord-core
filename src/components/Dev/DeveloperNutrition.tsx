import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth";
import { createEmptyDay, todayKey } from "../../lib/storage";
import { nutritionRepository } from "../../repositories/NutritionRepository";
import type { PersistenceState } from "../../repositories/DailyActivityRepository";
import type { DailyLog } from "../../types/gymcord";
import { NutritionExperience } from "../nutrition/NutritionExperience";

export function DeveloperNutrition() {
  const auth = useAuth();
  const repository = useMemo(() => nutritionRepository, []);
  const [state, setState] = useState<(PersistenceState & { log: DailyLog }) | null>(null);
  const [error, setError] = useState("");
  const date = todayKey();

  useEffect(() => {
    let active = true;
    repository.loadDay(auth.session, date)
      .then((next) => active && setState(next))
      .catch((unknownError: Error) => active && setError(unknownError.message));
    return () => { active = false; };
  }, [auth.session, date, repository]);

  const currentLog = state?.log ?? createEmptyDay(date);
  const latestXp = state?.xpEvents[0];
  const latestMission = state?.missions[0];
  const latestStreak = state?.streaks[0];

  return (
    <main className="dev-page">
      <header className="dev-header">
        <p className="eyebrow">GymCord Developer Verification</p>
        <h1>Nutrition Experience</h1>
        <p>Repository-backed diagnostics for meal logging, macros, hydration, photo metadata, saves, XP, mission progress, streaks, and offline queue state.</p>
      </header>

      <section className="dev-card">
        <h2>Developer status</h2>
        <div className="dev-grid">
          <div className="dev-row"><strong>Active provider</strong><span>{state?.provider ?? repository.providerName}</span></div>
          <div className="dev-row"><strong>Current day nutrition log</strong><span>{currentLog.date}</span><small>{currentLog.ingredients || "No ingredients yet"}</small></div>
          <div className="dev-row"><strong>Macro totals</strong><span>{currentLog.calories} kcal · {currentLog.protein}g protein</span></div>
          <div className="dev-row"><strong>Water status</strong><span>{currentLog.water}/8</span></div>
          <div className="dev-row"><strong>Meal photo metadata</strong><span>{currentLog.mealPhoto || "No photo path"}</span></div>
          <div className="dev-row"><strong>Save status</strong><span>{state?.lastSaveStatus ?? repository.getLastSaveStatus()}</span></div>
          <div className="dev-row"><strong>XP event</strong><span>{latestXp ? `${latestXp.points} XP` : "No persisted XP event"}</span><small>{latestXp?.reason}</small></div>
          <div className="dev-row"><strong>Mission update</strong><span>{latestMission ? `${latestMission.completionPercentage}%` : "No persisted mission"}</span></div>
          <div className="dev-row"><strong>Streak update</strong><span>{latestStreak ? `${latestStreak.currentCount}/${latestStreak.longestCount}` : "No persisted streak"}</span></div>
          <div className="dev-row"><strong>Offline queue</strong><span>{state?.offlineQueueSize ?? repository.getOfflineQueue().length} queued write(s)</span></div>
        </div>
      </section>

      {error && <section className="dev-card"><h2>Load Error</h2><p>{error}</p></section>}
      <NutritionExperience initialLog={currentLog} date={date} developer />
      <section className="dev-card"><h2>Repository snapshot</h2><pre>{JSON.stringify({ log: currentLog, xp: latestXp, mission: latestMission, streak: latestStreak, offlineQueue: repository.getOfflineQueue() }, null, 2)}</pre></section>
    </main>
  );
}
