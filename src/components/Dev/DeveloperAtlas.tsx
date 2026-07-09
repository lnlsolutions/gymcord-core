import { useEffect, useMemo, useState } from "react";
import { AuthProvider, useAuth } from "../../auth";
import { atlasCoachRepository, type AtlasCoachState } from "../../repositories/AtlasCoachRepository";
import { dashboardRepository } from "../../repositories/DashboardRepository";
import { buildDailyMission } from "../../lib/engines/missionEngine";
import { buildXpSnapshot } from "../../lib/engines/xpEngine";
import { buildStreakSnapshot } from "../../lib/engines/streakEngine";
import { buildAchievements, getNextAchievement } from "../../lib/engines/achievementEngine";
import { buildAtlasInsights } from "../../lib/engines/atlasEngine";
import { buildAtlasMemory } from "../../lib/engines/memoryEngine";
import { createEmptyDay, createEmptyProfile, getLastSevenDays, todayKey } from "../../lib/storage";
import { workouts } from "../../lib/program";
import { calculateWorkoutCompletion, calculateTransformationScore } from "../../lib/scoring";
import { buildTransformationSnapshot } from "../../lib/engines/transformationEngine";

function DeveloperAtlasPanel() {
  const auth = useAuth();
  const [state, setState] = useState<AtlasCoachState | null>(null);

  const computed = useMemo(() => {
    const profile = createEmptyProfile();
    const logs = { [todayKey()]: createEmptyDay(todayKey()) };
    const dayLog = logs[todayKey()];
    const totalExercises = workouts.reduce((sum, workout) => sum + workout.exercises.length, 0);
    const todayWorkout = workouts[new Date(todayKey() + "T00:00:00").getDay() % workouts.length];
    const missionHistory = getLastSevenDays().map((date) => buildDailyMission({ dayLog: logs[date] || createEmptyDay(date), todayWorkout, totalExercises }));
    const mission = buildDailyMission({ dayLog, todayWorkout, totalExercises });
    const xp = buildXpSnapshot(logs, missionHistory);
    const streak = buildStreakSnapshot(logs, totalExercises, todayKey());
    const achievements = buildAchievements(missionHistory, streak);
    const nextAchievement = getNextAchievement(achievements);
    const transformation = buildTransformationSnapshot({ logs, startDate: profile.startDate || todayKey(), currentDate: todayKey(), totalExercises, score: calculateTransformationScore(dayLog, calculateWorkoutCompletion(dayLog, totalExercises)), mission, xp, streak });
    const memory = buildAtlasMemory({ profile, logs, mission, nextAchievement });
    const insights = buildAtlasInsights(mission, xp, streak, nextAchievement, transformation);
    return { memory, latestInsight: insights[0]?.message ?? "No insight generated yet." };
  }, []);

  useEffect(() => {
    let active = true;
    dashboardRepository.load(auth.session)
      .then((dashboard) => {
        const totalExercises = workouts.reduce((sum, workout) => sum + workout.exercises.length, 0);
        const today = todayKey();
        const dayLog = dashboard.logs[today] || createEmptyDay(today);
        const todayWorkout = workouts[new Date(today + "T00:00:00").getDay() % workouts.length];
        const missionHistory = getLastSevenDays().map((date) => buildDailyMission({ dayLog: dashboard.logs[date] || createEmptyDay(date), todayWorkout, totalExercises }));
        const mission = buildDailyMission({ dayLog, todayWorkout, totalExercises });
        const xp = buildXpSnapshot(dashboard.logs, missionHistory);
        const streak = buildStreakSnapshot(dashboard.logs, totalExercises, today);
        const nextAchievement = getNextAchievement(buildAchievements(missionHistory, streak));
        const transformation = buildTransformationSnapshot({ logs: dashboard.logs, startDate: dashboard.profile.startDate || today, currentDate: today, totalExercises, score: calculateTransformationScore(dayLog, calculateWorkoutCompletion(dayLog, totalExercises)), mission, xp, streak });
        const memory = buildAtlasMemory({ profile: dashboard.profile, logs: dashboard.logs, mission, nextAchievement });
        const latestInsight = buildAtlasInsights(mission, xp, streak, nextAchievement, transformation)[0]?.message ?? computed.latestInsight;
        return atlasCoachRepository.load(auth.session, memory, latestInsight);
      })
      .then((next) => { if (active) setState(next); })
      .catch(() => atlasCoachRepository.load(auth.session, computed.memory, computed.latestInsight).then((next) => { if (active) setState(next); }));
    return () => { active = false; };
  }, [auth.session, computed]);

  const queue = atlasCoachRepository.getOfflineQueue();

  return (
    <main className="screen dev-screen">
      <p className="eyebrow">Developer</p>
      <h1>Atlas Coach</h1>
      <div className="panel memory-grid-panel">
        <h3>Repository status</h3>
        <div className="memory-grid">
          <div><strong>Active provider</strong><span>{state?.provider ?? atlasCoachRepository.providerName}</span></div>
          <div><strong>Save status</strong><span>{state?.lastSaveStatus ?? atlasCoachRepository.getLastSaveStatus()}</span></div>
          <div><strong>Offline queue</strong><span>{state?.offlineQueueSize ?? queue.length} writes</span></div>
          <div><strong>Latest insight</strong><span>{state?.latestInsight ?? computed.latestInsight}</span></div>
        </div>
      </div>
      <div className="panel memory-grid-panel"><h3>Memory state</h3><pre>{JSON.stringify(state?.memory ?? computed.memory, null, 2)}</pre></div>
      <div className="panel memory-grid-panel"><h3>Conversation history</h3><pre>{JSON.stringify(state?.conversation ?? [], null, 2)}</pre></div>
      <div className="panel memory-grid-panel"><h3>Offline queue</h3><pre>{JSON.stringify(queue, null, 2)}</pre></div>
    </main>
  );
}

export function DeveloperAtlas() {
  return <AuthProvider><DeveloperAtlasPanel /></AuthProvider>;
}
