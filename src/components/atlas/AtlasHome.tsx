import { useMemo, useState } from "react";
import { useAuth } from "../../auth";
import { appConfig } from "../../config";
import { buildAtlasMemory } from "../../lib/engines/memoryEngine";
import { buildDailyMission } from "../../lib/engines/missionEngine";
import { workouts } from "../../lib/program";
import { createEmptyDay, createEmptyProfile, saved, todayKey } from "../../lib/storage";
import type { DailyLog } from "../../types/gymcord";
import { atlasRepository } from "../../repositories/AtlasRepository";
import { AtlasProviderStatus } from "./AtlasProviderStatus";
import { AtlasCoachModeSwitcher } from "./AtlasCoachModeSwitcher";
import { AtlasMemoryPanel } from "./AtlasMemoryPanel";

export function AtlasHome({ developer = false }: { developer?: boolean }) {
  const auth = useAuth();
  const [mode, setMode] = useState(atlasRepository.getCoachMode());
  const profile = saved(appConfig.storageKeys.profile, createEmptyProfile());
  const logs = saved<Record<string, DailyLog>>(appConfig.storageKeys.dailyLogs, {});
  const selectedDate = todayKey();
  const dayLog = logs[selectedDate] || createEmptyDay(selectedDate);
  const totalExercises = workouts.reduce((sum, workout) => sum + workout.exercises.length, 0);
  const todayWorkout = workouts[new Date(selectedDate + "T00:00:00").getDay() % workouts.length];
  const mission = buildDailyMission({ dayLog, todayWorkout, totalExercises });
  const memory = useMemo(() => buildAtlasMemory({ profile, logs, mission, nextAchievement: { id: "atlas", title: "Atlas", description: "Use Atlas", unlocked: false, progress: 0, target: 1, completionPercentage: 0 } }), [dayLog.date]);
  const state = atlasRepository.getFoundationState(auth.session, profile);
  return <main className="page"><AtlasProviderStatus state={state} /><AtlasCoachModeSwitcher mode={mode} onChange={(next) => { atlasRepository.setCoachMode(next); setMode(next); }} /><section className="panel"><p className="eyebrow">Atlas AI Coach</p><h2>Production coaching foundation</h2><div className="atlas-status-grid"><div><span>Consumer coaching</span><strong>Enabled</strong></div><div><span>Trainer-assisted</span><strong>Metadata only</strong></div><div><span>Gym-member coaching</span><strong>Tenant-aware metadata</strong></div><div><span>Onboarding context</span><strong>{state.onboardingContext.completed ? "Complete" : "Mock fallback"}</strong></div><div><span>Safety</span><strong>Not medical advice</strong></div><div><span>Handoff</span><strong>{state.safetyMetadata.humanCoachHandoffRecommended ? "Recommended" : "Available"}</strong></div></div></section><AtlasMemoryPanel memory={memory} />{developer && <section className="panel"><h3>Developer metadata</h3><pre>{JSON.stringify({ ...state, memoryMetadata: memory }, null, 2)}</pre></section>}</main>;
}
