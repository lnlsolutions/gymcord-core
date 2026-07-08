import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth";
import { workouts } from "../../lib/program";
import { calculateWorkoutCompletion } from "../../lib/scoring";
import { createEmptyDay, todayKey } from "../../lib/storage";
import { buildDailyMission } from "../../lib/engines/missionEngine";
import { buildXpSnapshot } from "../../lib/engines/xpEngine";
import { buildStreakSnapshot } from "../../lib/engines/streakEngine";
import { dailyActivityRepository, type PersistenceState } from "../../repositories/DailyActivityRepository";

function row(label: string, value: string, detail?: string) {
  return { label, value, detail };
}

function StatusCard({ title, rows }: { title: string; rows: { label: string; value: string; detail?: string }[] }) {
  return (
    <section className="dev-card">
      <h2>{title}</h2>
      <div className="dev-grid">
        {rows.map((item) => (
          <div className="dev-row" key={item.label}>
            <strong>{item.label}</strong>
            <span>{item.value}</span>
            {item.detail && <small>{item.detail}</small>}
          </div>
        ))}
      </div>
    </section>
  );
}

export function DeveloperWorkout() {
  const auth = useAuth();
  const repository = useMemo(() => dailyActivityRepository, []);
  const [state, setState] = useState<PersistenceState | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    repository.load(auth.session)
      .then((next) => active && setState(next))
      .catch((unknownError: Error) => active && setError(unknownError.message));
    return () => { active = false; };
  }, [auth.session, repository]);

  const currentDate = todayKey();
  const currentLog = state?.logs[currentDate] ?? createEmptyDay(currentDate);
  const currentWorkout = workouts[new Date(`${currentDate}T00:00:00`).getDay() % workouts.length];
  const totalExercises = workouts.reduce((sum, workout) => sum + workout.exercises.length, 0);
  const currentMission = buildDailyMission({ dayLog: currentLog, todayWorkout: currentWorkout, totalExercises });
  const xpSnapshot = buildXpSnapshot(state?.logs ?? { [currentDate]: currentLog }, [currentMission]);
  const streakSnapshot = buildStreakSnapshot(state?.logs ?? { [currentDate]: currentLog }, totalExercises, currentDate);
  const latestXp = state?.xpEvents[0];
  const latestMission = state?.missions[0];
  const latestStreak = state?.streaks[0];
  const completedExerciseCount = Object.values(currentLog.completedExercises).filter(Boolean).length;
  const exerciseLogCount = new Set([
    ...Object.keys(currentLog.completedExercises),
    ...Object.keys(currentLog.weights),
    ...Object.keys(currentLog.notes),
  ]).size;

  return (
    <main className="dev-page">
      <header className="dev-header">
        <p className="eyebrow">GymCord Developer Verification</p>
        <h1>Workout Experience</h1>
        <p>Read-only diagnostics for workout repository flow, provider mode, exercise logs, saves, XP, missions, streaks, and offline queue state.</p>
      </header>

      <StatusCard title="Runtime" rows={[
        row("Active provider", state?.provider ?? repository.providerName),
        row("Current workout", currentWorkout.title, `${currentWorkout.focus} · ${currentWorkout.duration} min · ${calculateWorkoutCompletion(currentLog, totalExercises)}% complete`),
        row("Save status", state?.lastSaveStatus ?? repository.getLastSaveStatus()),
        row("Offline queue", `${state?.offlineQueueSize ?? repository.getOfflineQueue().length} queued write(s)`),
      ]} />

      <StatusCard title="Workout Signals" rows={[
        row("Exercise logs", `${exerciseLogCount} logged exercise key(s)`, `${completedExerciseCount} completed · ${Object.keys(currentLog.weights).length} weights · ${Object.keys(currentLog.notes).length} notes`),
        row("XP event", latestXp ? `${latestXp.points} persisted XP` : `${xpSnapshot.totalXp} calculated XP`, latestXp?.reason ?? "Calculated from repository-loaded logs"),
        row("Mission update", latestMission?.title ?? currentMission.title, `${latestMission?.completionPercentage ?? currentMission.completionPercentage}% complete`),
        row("Streak update", latestStreak ? `${latestStreak.currentCount} current / ${latestStreak.longestCount} longest` : `${streakSnapshot.currentStreak} current / ${streakSnapshot.longestStreak} longest`, latestStreak?.lastActivityOn ?? currentDate),
      ]} />

      {error && <StatusCard title="Load Error" rows={[row("Repository", "failed", error)]} />}

      <section className="dev-card">
        <h2>Current workout log snapshot</h2>
        <pre>{JSON.stringify({ workout: currentWorkout, log: currentLog, mission: currentMission, xp: xpSnapshot, streak: streakSnapshot }, null, 2)}</pre>
      </section>
    </main>
  );
}
