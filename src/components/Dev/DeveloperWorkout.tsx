import { useMemo, useState } from "react";
import { useAuth } from "../../auth";
import { workouts } from "../../lib/program";
import { createEmptyDay, todayKey } from "../../lib/storage";
import { buildDailyMission } from "../../lib/engines/missionEngine";
import { buildXpSnapshot } from "../../lib/engines/xpEngine";
import { buildStreakSnapshot } from "../../lib/engines/streakEngine";
import { WorkoutExperience } from "../workout/WorkoutExperience";
import { workoutExperienceRepository } from "../../repositories/WorkoutExperienceRepository";

export function DeveloperWorkout() {
  const auth = useAuth();
  const date = todayKey();
  const workout = workouts[new Date(`${date}T00:00:00`).getDay() % workouts.length];
  const [logs, setLogs] = useState({ [date]: createEmptyDay(date) });
  const repo = workoutExperienceRepository.getState();
  const totalExercises = workouts.reduce((sum, item) => sum + item.exercises.length, 0);
  const dayLog = logs[date];
  const mission = useMemo(() => buildDailyMission({ dayLog, todayWorkout: workout, totalExercises }), [dayLog, totalExercises, workout]);
  const xp = useMemo(() => buildXpSnapshot(logs, [mission]), [logs, mission]);
  const streak = useMemo(() => buildStreakSnapshot(logs, totalExercises, date), [logs, totalExercises, date]);

  return (
    <main className="screen">
      <section className="panel premium-card">
        <p className="pill">Developer validation</p>
        <h2>/dev/workout</h2>
        <dl className="data-flow-grid">
          <div><dt>Active provider</dt><dd>{repo.provider}</dd></div>
          <div><dt>Current workout</dt><dd>{workout.title}</dd></div>
          <div><dt>Exercise logs</dt><dd>{Object.keys(dayLog.completedExercises).length}</dd></div>
          <div><dt>Save status</dt><dd>{repo.lastSaveStatus}</dd></div>
          <div><dt>XP event</dt><dd>{xp.totalXp} total XP</dd></div>
          <div><dt>Mission update</dt><dd>{mission.completionPercentage}%</dd></div>
          <div><dt>Streak update</dt><dd>{streak.currentStreak} days</dd></div>
          <div><dt>Offline queue</dt><dd>{repo.offlineQueueSize}</dd></div>
        </dl>
      </section>
      <WorkoutExperience session={auth.session} workout={workout} dayLog={dayLog} logs={logs} totalExercises={totalExercises} mission={mission} xp={xp} streak={streak} onSave={(log) => setLogs({ ...logs, [log.date]: log })} />
    </main>
  );
}
