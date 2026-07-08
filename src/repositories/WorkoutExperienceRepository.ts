import { appConfig } from "../config";
import type { AuthSession } from "../auth/types";
import type { DailyLog, Mission, StreakSnapshot, WorkoutDay, XpSnapshot } from "../types/gymcord";
import { createBackendProvider } from "../api/client";
import type { BackendProvider } from "../api";
import { dailyActivityRepository } from "./DailyActivityRepository";

export interface WorkoutSaveSnapshot {
  workout: WorkoutDay;
  log: DailyLog;
  mission: Mission;
  xp: XpSnapshot;
  streak: StreakSnapshot;
  completed: boolean;
  completedAt?: string;
}

export interface WorkoutExperienceState {
  provider: string;
  lastSaveStatus: string;
  offlineQueueSize: number;
  offlineQueue: unknown[];
}

function currentUserId(session: AuthSession | null) {
  return session?.user.id ?? "demo-user";
}

function currentOrganizationId(session: AuthSession | null) {
  return session?.organization?.id ?? session?.user.activeOrganizationId ?? "org-gymcord";
}

function isConfiguredSupabase(provider: BackendProvider) {
  return provider.name === "supabase" && Boolean(appConfig.backend.supabase.url && appConfig.backend.supabase.anonKey);
}

function extractSets(prescription: string) {
  const match = prescription.match(/(\d+)\s*sets?/i);
  return match ? Number(match[1]) : 3;
}

function parseWeight(value: string) {
  const parsed = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : undefined;
}

export class WorkoutExperienceRepository {
  constructor(private readonly backend = createBackendProvider()) {}

  get providerName() { return this.backend.name; }

  getState(): WorkoutExperienceState {
    return {
      provider: this.backend.name,
      lastSaveStatus: dailyActivityRepository.getLastSaveStatus(),
      offlineQueueSize: dailyActivityRepository.getOfflineQueue().length,
      offlineQueue: dailyActivityRepository.getOfflineQueue(),
    };
  }

  async saveWorkoutSnapshot(session: AuthSession | null, snapshot: WorkoutSaveSnapshot): Promise<WorkoutExperienceState> {
    await dailyActivityRepository.saveDailyLog(session, snapshot.log, snapshot.mission, snapshot.xp, snapshot.streak);

    if (this.backend.name === "mock" || isConfiguredSupabase(this.backend)) {
      const base = { organizationId: currentOrganizationId(session), userId: currentUserId(session) };
      const sessionId = `${currentUserId(session)}-${snapshot.log.date}-${snapshot.workout.id}`;
      const now = new Date().toISOString();

      await this.safeWrite(() => this.backend.request({
        method: "POST",
        path: "/workoutSessions",
        body: {
          id: sessionId,
          ...base,
          workoutId: snapshot.workout.id,
          scheduledFor: snapshot.log.date,
          startedAt: `${snapshot.log.date}T12:00:00.000Z`,
          completedAt: snapshot.completed ? snapshot.completedAt ?? now : undefined,
          notes: snapshot.workout.title,
          createdAt: now,
          updatedAt: now,
        },
        headers: {},
        timeoutMs: appConfig.backend.timeoutMs,
        retryAttempts: 0,
        queuedWhenOffline: true,
      }));

      await Promise.allSettled(snapshot.workout.exercises.map((exercise) => {
        const key = `${snapshot.workout.id}-${exercise.id}`;
        const setCount = extractSets(exercise.prescription);
        const reps = Number(exercise.prescription.match(/×\s*(\d+)/)?.[1] ?? exercise.prescription.match(/x\s*(\d+)/i)?.[1] ?? 0);
        return this.safeWrite(() => this.backend.request({
          method: "POST",
          path: "/exerciseLogs",
          body: {
            id: `${sessionId}-${exercise.id}`,
            sessionId,
            exerciseId: exercise.id,
            sets: Array.from({ length: setCount }).map((_, index) => ({
              reps,
              weight: parseWeight(snapshot.log.weights[`${key}-set-${index + 1}`] ?? snapshot.log.weights[key] ?? ""),
              completed: Boolean(snapshot.log.completedExercises[`${key}-set-${index + 1}`] ?? snapshot.log.completedExercises[key]),
            })),
            notes: snapshot.log.notes[key] ?? "",
            createdAt: now,
            updatedAt: now,
          },
          headers: {},
          timeoutMs: appConfig.backend.timeoutMs,
          retryAttempts: 0,
          queuedWhenOffline: true,
        }));
      }));
    }

    return this.getState();
  }

  private async safeWrite(write: () => Promise<unknown>) {
    try { await write(); } catch { /* Daily activity persistence owns user-facing status/offline queue. */ }
  }
}

export const workoutExperienceRepository = new WorkoutExperienceRepository();
