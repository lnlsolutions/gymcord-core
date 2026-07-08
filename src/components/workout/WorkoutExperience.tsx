import { useMemo, useState } from "react";
import type { DailyLog, Mission, StreakSnapshot, WorkoutDay, XpSnapshot } from "../../types/gymcord";
import { buildDailyMission } from "../../lib/engines/missionEngine";
import { buildStreakSnapshot } from "../../lib/engines/streakEngine";
import { buildXpSnapshot } from "../../lib/engines/xpEngine";
import { WorkoutHeader } from "./WorkoutHeader";
import { ExerciseList } from "./ExerciseList";
import { WorkoutSummary } from "./WorkoutSummary";
import { workoutExperienceRepository, type WorkoutExperienceState } from "../../repositories/WorkoutExperienceRepository";
import type { AuthSession } from "../../auth/types";

function completedCount(workout: WorkoutDay, log: DailyLog) {
  return workout.exercises.filter((exercise) => log.completedExercises[`${workout.id}-${exercise.id}`]).length;
}

export function WorkoutExperience({ session, workout, dayLog, logs, totalExercises, mission, xp, streak, onSave }: { session: AuthSession | null; workout: WorkoutDay; dayLog: DailyLog; logs: Record<string, DailyLog>; totalExercises: number; mission: Mission; xp: XpSnapshot; streak: StreakSnapshot; onSave: (log: DailyLog) => void }) {
  const [draft, setDraft] = useState(dayLog);
  const [status, setStatus] = useState("Ready to save");
  const [repoState, setRepoState] = useState<WorkoutExperienceState>(() => workoutExperienceRepository.getState());
  const [summary, setSummary] = useState<{ mission: Mission; xp: XpSnapshot; streak: StreakSnapshot; award: number } | null>(null);
  const completedExercises = completedCount(workout, draft);
  const progress = Math.round((completedExercises / workout.exercises.length) * 100);

  const projected = useMemo(() => {
    const nextLogs = { ...logs, [draft.date]: draft };
    const nextMission = buildDailyMission({ dayLog: draft, todayWorkout: workout, totalExercises });
    const missions = Object.keys(nextLogs).sort().map((date) => buildDailyMission({ dayLog: nextLogs[date], todayWorkout: workout, totalExercises }));
    return { mission: nextMission, xp: buildXpSnapshot(nextLogs, missions), streak: buildStreakSnapshot(nextLogs, totalExercises, draft.date) };
  }, [draft, logs, totalExercises, workout]);

  async function save(completed = false) {
    setStatus(completed ? "Completing workout..." : "Saving workout...");
    onSave(draft);
    const nextState = await workoutExperienceRepository.saveWorkoutSnapshot(session, { workout, log: draft, mission: projected.mission, xp: projected.xp, streak: projected.streak, completed, completedAt: completed ? new Date().toISOString() : undefined });
    setRepoState(nextState);
    setStatus(completed ? "Workout complete and saved" : "Workout saved");
    if (completed) setSummary({ ...projected, award: Math.max(0, projected.xp.totalXp - xp.totalXp) });
  }

  return (
    <section className="page workout-v1">
      <WorkoutHeader workout={workout} progress={progress} saveStatus={status} provider={repoState.provider} />
      <div className="workout-overview panel">
        <h3>Workout overview</h3>
        <p>{completedExercises} of {workout.exercises.length} exercises logged. Mission workout task is {projected.mission.tasks.find((task) => task.id === "workout")?.completionPercentage ?? 0}% complete.</p>
        <div className="session-nav"><button onClick={() => void save(false)}>Save progress</button><button className="finish-workout-button" onClick={() => void save(true)}>Complete workout</button></div>
      </div>
      <ExerciseList workout={workout} dayLog={draft} onLogChange={setDraft} />
      {summary && <WorkoutSummary workout={workout} completedExercises={completedExercises} xp={summary.xp} mission={summary.mission} streak={summary.streak} xpAward={summary.award} />}
    </section>
  );
}
