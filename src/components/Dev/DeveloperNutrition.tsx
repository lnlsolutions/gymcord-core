import { useEffect, useState } from "react";
import { appConfig } from "../../config";
import { useAuth } from "../../auth";
import { createEmptyDay, todayKey } from "../../lib/storage";
import { buildDailyMission } from "../../lib/engines/missionEngine";
import { buildXpSnapshot } from "../../lib/engines/xpEngine";
import { buildStreakSnapshot } from "../../lib/engines/streakEngine";
import { workouts } from "../../lib/program";
import { dailyActivityRepository, type PersistenceState } from "../../repositories/DailyActivityRepository";
import { nutritionRepository } from "../../repositories/NutritionRepository";

export function DeveloperNutrition() {
  const auth = useAuth();
  const [state, setState] = useState<PersistenceState | null>(null);
  const [status, setStatus] = useState("Preparing nutrition repository validation...");

  useEffect(() => {
    const date = todayKey();
    const log = {
      ...createEmptyDay(date),
      calories: 540,
      protein: 42,
      water: 3,
      ingredients: "Developer validation meal: chicken, rice, avocado",
    };
    const workout = workouts[new Date(`${date}T00:00:00`).getDay() % workouts.length];
    const totalExercises = workouts.reduce((sum, item) => sum + item.exercises.length, 0);
    const mission = buildDailyMission({ dayLog: log, todayWorkout: workout, totalExercises });
    const logs = { [date]: log };
    const xp = buildXpSnapshot(logs, [mission]);
    const streak = buildStreakSnapshot(logs, totalExercises, date);

    nutritionRepository.saveNutritionLog(auth.session, log, mission, xp, streak)
      .then(() => dailyActivityRepository.load(auth.session))
      .then((nextState) => {
        setState(nextState);
        setStatus("Nutrition save completed through NutritionRepository → DailyActivityRepository.");
      })
      .catch((error: Error) => setStatus(`Nutrition validation failed: ${error.message}`));
  }, [auth.session]);

  return (
    <main className="page dev-page">
      <div className="panel hero-panel">
        <p className="eyebrow">Developer validation</p>
        <h1>Nutrition Repository Check</h1>
        <p>{status}</p>
      </div>

      <div className="grid">
        <div className="panel">
          <h3>Provider</h3>
          <p>{state?.provider ?? nutritionRepository.providerName}</p>
          <p>Supabase env configured: {appConfig.backend.supabase.url && appConfig.backend.supabase.anonKey ? "yes" : "no"}</p>
        </div>
        <div className="panel">
          <h3>Last save</h3>
          <p>{state?.lastSaveStatus ?? dailyActivityRepository.getLastSaveStatus()}</p>
          <p>Offline queue: {state?.offlineQueueSize ?? dailyActivityRepository.getOfflineQueue().length}</p>
        </div>
      </div>
    </main>
  );
}
