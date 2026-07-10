import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth";
import { buildAtlasInsights } from "../../lib/engines/atlasEngine";
import { getNextAchievement } from "../../lib/engines/achievementEngine";
import { buildAtlasMemory } from "../../lib/engines/memoryEngine";
import { buildDailyMission } from "../../lib/engines/missionEngine";
import { buildStreakSnapshot } from "../../lib/engines/streakEngine";
import { buildXpSnapshot } from "../../lib/engines/xpEngine";
import { workouts } from "../../lib/program";
import { createEmptyDay, createEmptyProfile, saved, todayKey } from "../../lib/storage";
import { appConfig } from "../../config";
import { atlasCoachRepository, type AtlasCoachDiagnostics } from "../../repositories/AtlasCoachRepository";
import type { DailyLog } from "../../types/gymcord";

export function DeveloperAtlas() {
  const auth = useAuth();
  const [diagnostics, setDiagnostics] = useState<AtlasCoachDiagnostics | null>(null);
  const logs = saved<Record<string, DailyLog>>(appConfig.storageKeys.dailyLogs, {});
  const selectedDate = todayKey();
  const dayLog = logs[selectedDate] || createEmptyDay(selectedDate);
  const profile = saved(appConfig.storageKeys.profile, createEmptyProfile());
  const totalExercises = workouts.reduce((sum, workout) => sum + workout.exercises.length, 0);
  const todayWorkout = workouts[new Date(selectedDate + "T00:00:00").getDay() % workouts.length];
  const mission = buildDailyMission({ dayLog, todayWorkout, totalExercises });
  const missionHistory = [mission];
  const xp = buildXpSnapshot(logs, missionHistory);
  const streak = buildStreakSnapshot(logs, totalExercises, selectedDate);
  const nextAchievement = getNextAchievement([]);
  const memory = useMemo(() => buildAtlasMemory({ profile, logs, mission, nextAchievement }), [logs, mission, nextAchievement, profile]);
  const latestInsight = buildAtlasInsights(mission, xp, streak, nextAchievement)[0]?.message ?? "No insight generated yet.";

  useEffect(() => {
    let active = true;
    atlasCoachRepository.diagnostics(auth.session, memory, latestInsight).then((state) => {
      if (active) setDiagnostics(state);
    });
    return () => { active = false; };
  }, [auth.session, latestInsight, memory]);

  return (
    <main className="page">
      <section className="panel">
        <p className="eyebrow">Developer Diagnostics</p>
        <h2>Atlas Coach</h2>
        <div className="atlas-status-grid">
          <div><span>Active provider</span><strong>{diagnostics?.provider ?? atlasCoachRepository.providerName}</strong></div>
          <div><span>Atlas provider status</span><strong>{diagnostics?.providerStatus ?? "mock_active"}</strong></div>
          <div><span>Current coach mode</span><strong>{diagnostics?.currentCoachMode ?? "consumer_self_coaching"}</strong></div>
          <div><span>Latest insight</span><strong>{diagnostics?.latestInsight ?? latestInsight}</strong></div>
          <div><span>Save status</span><strong>{diagnostics?.saveStatus ?? atlasCoachRepository.getLastSaveStatus()}</strong></div>
          <div><span>Offline queue</span><strong>{diagnostics?.offlineQueue.length ?? atlasCoachRepository.getOfflineQueue().length} queued Atlas writes</strong></div>
        </div>
      </section>
      <section className="panel">
        <h3>Conversation history</h3>
        {(diagnostics?.conversationHistory ?? []).map((entry) => <div className="coach-card" key={entry.id}><strong>{entry.category}</strong><p>{entry.question}</p><p>{entry.answer}</p></div>)}
      </section>
      <section className="panel">
        <h3>Tenant context</h3>
        <pre>{JSON.stringify(diagnostics?.foundationMetadata.tenantContext, null, 2)}</pre>
      </section>
      <section className="panel">
        <h3>Trainer context</h3>
        <pre>{JSON.stringify(diagnostics?.foundationMetadata.trainerContext, null, 2)}</pre>
      </section>
      <section className="panel">
        <h3>Onboarding context</h3>
        <pre>{JSON.stringify(diagnostics?.foundationMetadata.onboardingContext, null, 2)}</pre>
      </section>
      <section className="panel">
        <h3>Memory metadata</h3>
        <pre>{JSON.stringify(diagnostics?.memoryState ?? memory, null, 2)}</pre>
      </section>
      <section className="panel">
        <h3>Generated plans</h3>
        <pre>{JSON.stringify(diagnostics?.generatedPlans, null, 2)}</pre>
      </section>
      <section className="panel">
        <h3>Pending provider requests</h3>
        <pre>{JSON.stringify(diagnostics?.foundationMetadata.pendingProviderRequests ?? [], null, 2)}</pre>
      </section>
      <section className="panel">
        <h3>Failed provider requests</h3>
        <pre>{JSON.stringify(diagnostics?.foundationMetadata.failedProviderRequests ?? [], null, 2)}</pre>
      </section>
      <section className="panel">
        <h3>Safety metadata</h3>
        <pre>{JSON.stringify(diagnostics?.foundationMetadata.safety, null, 2)}</pre>
      </section>
    </main>
  );
}
