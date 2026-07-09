import type { AuthSession } from "../auth/types";
import { appConfig } from "../config";
import { calculateTransformationScore, calculateWorkoutCompletion } from "../lib/scoring";
import { buildDailyMission } from "../lib/engines/missionEngine";
import { buildStreakSnapshot } from "../lib/engines/streakEngine";
import { buildXpSnapshot } from "../lib/engines/xpEngine";
import { workouts } from "../lib/program";
import { createEmptyDay, saved, save } from "../lib/storage";
import { createBackendProvider } from "../api/client";
import type { BackendProvider } from "../api";
import { offlineEngine } from "../services/sync";
import type { DailyLog, Mission, StreakSnapshot, XpSnapshot } from "../types/gymcord";

export interface ProgressSaveInput {
  date: string;
  log: DailyLog;
  logs: Record<string, DailyLog>;
}

export interface ProgressTimelineItem {
  id: string;
  date: string;
  title: string;
  detail: string;
  score: number;
}

export interface ProgressRepositoryState {
  provider: string;
  measurements: DailyLog["measurements"];
  weightHistory: Array<{ date: string; weight: number }>;
  progressPhotoMetadata: Array<{ id: string; date: string; angle: string; imageUrl: string }>;
  transformationScore: number;
  saveStatus: string;
  xpEvent: { id: string; date: string; points: number; reason: string } | null;
  missionUpdate: Mission | null;
  streakUpdate: StreakSnapshot | null;
  offlineQueue: ReturnType<typeof offlineEngine.getQueue>;
  timeline: ProgressTimelineItem[];
}

type ListResult<T> = { items: T[] };
const logsKey = appConfig.storageKeys.dailyLogs;
const statusKey = "gc.progress.lastSaveStatus";
const xpKey = "gc.progress.xpEvents";
const missionKey = "gc.progress.missionUpdates";
const streakKey = "gc.progress.streakUpdates";

function userId(session: AuthSession | null) { return session?.user.id ?? "demo-user"; }
function organizationId(session: AuthSession | null) { return session?.organization?.id ?? session?.user.activeOrganizationId ?? "org-gymcord"; }
function toNumber(value: string) { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : undefined; }
function isConfiguredSupabase(provider: BackendProvider) { return provider.name === "supabase" && Boolean(appConfig.backend.supabase.url && appConfig.backend.supabase.anonKey); }

export class ProgressRepository {
  constructor(private readonly backend = createBackendProvider()) {}
  get providerName() { return this.backend.name; }
  getOfflineQueue() { return offlineEngine.getQueue(); }
  getLastSaveStatus() { return saved(statusKey, "No progress saves yet."); }

  async load(session: AuthSession | null, selectedDate = new Date().toISOString().slice(0, 10)): Promise<ProgressRepositoryState> {
    const logs = await this.loadLogs(session);
    return this.buildState(session, selectedDate, logs[selectedDate] ?? createEmptyDay(selectedDate), logs);
  }

  async saveProgress(session: AuthSession | null, input: ProgressSaveInput): Promise<ProgressRepositoryState> {
    const nextLogs = { ...saved<Record<string, DailyLog>>(logsKey, {}), ...input.logs, [input.date]: input.log };
    save(logsKey, nextLogs);

    const totalExercises = workouts.reduce((sum, workout) => sum + workout.exercises.length, 0);
    const workout = workouts[new Date(`${input.date}T00:00:00`).getDay() % workouts.length];
    const mission = buildDailyMission({ dayLog: input.log, todayWorkout: workout, totalExercises });
    const missionHistory = Object.values(nextLogs).map((log) => buildDailyMission({ dayLog: log, todayWorkout: workouts[new Date(`${log.date}T00:00:00`).getDay() % workouts.length], totalExercises }));
    const xp = buildXpSnapshot(nextLogs, missionHistory);
    const streak = buildStreakSnapshot(nextLogs, totalExercises, input.date);
    const score = calculateTransformationScore(input.log, calculateWorkoutCompletion(input.log, totalExercises));
    const xpEvent = { id: crypto.randomUUID(), date: input.date, points: 20 + Math.round(score / 10), reason: "progress_update" };

    save(xpKey, [xpEvent, ...saved<typeof xpEvent[]>(xpKey, [])].slice(0, 50));
    save(missionKey, [mission, ...saved<Mission[]>(missionKey, [])].slice(0, 30));
    save(streakKey, [streak, ...saved<StreakSnapshot[]>(streakKey, [])].slice(0, 30));

    if (this.backend.name === "mock" || isConfiguredSupabase(this.backend)) {
      const base = { userId: userId(session), organizationId: organizationId(session) };
      await Promise.allSettled([
        this.safeWrite("measurement", () => this.backend.request({ method: "POST", path: "/measurements", body: { id: `${userId(session)}-${input.date}-body`, ...base, measuredOn: input.date, weightKg: toNumber(input.log.measurements.weight), waistCm: toNumber(input.log.measurements.waist), chestCm: toNumber(input.log.measurements.chest), hipsCm: toNumber(input.log.measurements.hips), metadata: input.log.measurements }, headers: {}, timeoutMs: appConfig.backend.timeoutMs, retryAttempts: 0, queuedWhenOffline: true })),
        ...Object.entries(input.log.photos).filter(([, imageUrl]) => Boolean(imageUrl)).map(([angle, imageUrl]) => this.safeWrite("progress photo metadata", () => this.backend.request({ method: "POST", path: "/progressPhotos", body: { id: `${userId(session)}-${input.date}-${angle}`, ...base, takenOn: input.date, angle, imageUrl, photoPath: imageUrl, visibility: "private" }, headers: {}, timeoutMs: appConfig.backend.timeoutMs, retryAttempts: 0, queuedWhenOffline: true }))),
        this.safeWrite("XP event", () => this.backend.request({ method: "POST", path: "/xpEvents", body: { id: xpEvent.id, ...base, sourceType: "progress", points: xpEvent.points, reason: xpEvent.reason, createdAt: new Date().toISOString() }, headers: {}, timeoutMs: appConfig.backend.timeoutMs, retryAttempts: 0, queuedWhenOffline: true })),
        this.safeWrite("mission progress", () => this.backend.request({ method: "POST", path: "/missions", body: { id: `progress-${userId(session)}-${input.date}`, ...base, date: input.date, title: mission.title, description: mission.description, xpReward: mission.xpReward, progress: mission.progress, completionPercentage: mission.completionPercentage, completedAt: mission.completed ? new Date().toISOString() : null }, headers: {}, timeoutMs: appConfig.backend.timeoutMs, retryAttempts: 0, queuedWhenOffline: true })),
        this.safeWrite("streak update", () => this.backend.request({ method: "POST", path: "/streaks", body: { id: `progress-${userId(session)}-${input.date}`, ...base, streakType: "progress", currentCount: streak.currentStreak, longestCount: streak.longestStreak, lastActivityOn: input.date, updatedAt: new Date().toISOString() }, headers: {}, timeoutMs: appConfig.backend.timeoutMs, retryAttempts: 0, queuedWhenOffline: true })),
      ]);
    }

    save(statusKey, `Saved progress at ${new Date().toLocaleTimeString()}`);
    return this.buildState(session, input.date, input.log, nextLogs, xpEvent, mission, streak, xp);
  }

  private async loadLogs(session: AuthSession | null) {
    const fallback = saved<Record<string, DailyLog>>(logsKey, {});
    try {
      const result = await this.backend.request<ListResult<DailyLog & { userId?: string }>>({ method: "GET", path: "/dailyLogs", headers: {}, timeoutMs: appConfig.backend.timeoutMs, retryAttempts: 0, queuedWhenOffline: false });
      const remote = Object.fromEntries((result.data.items ?? []).filter((log) => !log.userId || log.userId === userId(session)).map((log) => [log.date, { ...createEmptyDay(log.date), ...log }]));
      return Object.keys(remote).length ? remote : fallback;
    } catch { return fallback; }
  }

  private buildState(_session: AuthSession | null, date: string, log: DailyLog, logs: Record<string, DailyLog>, xpEvent = saved<any[]>(xpKey, [])[0] ?? null, mission = saved<Mission[]>(missionKey, [])[0] ?? null, streak = saved<StreakSnapshot[]>(streakKey, [])[0] ?? null, _xp?: XpSnapshot): ProgressRepositoryState {
    const totalExercises = workouts.reduce((sum, workout) => sum + workout.exercises.length, 0);
    const entries = Object.values(logs).sort((a, b) => b.date.localeCompare(a.date));
    return {
      provider: this.backend.name,
      measurements: log.measurements,
      weightHistory: entries.map((item) => ({ date: item.date, weight: toNumber(item.measurements.weight) ?? 0 })).filter((item) => item.weight > 0),
      progressPhotoMetadata: entries.flatMap((item) => Object.entries(item.photos).filter(([, imageUrl]) => Boolean(imageUrl)).map(([angle, imageUrl]) => ({ id: `${item.date}-${angle}`, date: item.date, angle, imageUrl }))),
      transformationScore: calculateTransformationScore(log, calculateWorkoutCompletion(log, totalExercises)),
      saveStatus: this.getLastSaveStatus(),
      xpEvent,
      missionUpdate: mission,
      streakUpdate: streak,
      offlineQueue: this.getOfflineQueue(),
      timeline: entries.slice(0, 12).map((item) => ({ id: item.date, date: item.date, title: item.photos.front || item.photos.side || item.photos.back ? "Photo check-in" : "Measurement check-in", detail: `Weight ${item.measurements.weight || "—"} • Waist ${item.measurements.waist || "—"}`, score: calculateTransformationScore(item, calculateWorkoutCompletion(item, totalExercises)) })),
    };
  }

  private async safeWrite(label: string, write: () => Promise<unknown>) {
    try { await write(); save(statusKey, `Saved ${label} at ${new Date().toLocaleTimeString()}`); }
    catch (error) { save(statusKey, `Could not save ${label}: ${error instanceof Error ? error.message : "unknown error"}`); }
  }
}

export const progressRepository = new ProgressRepository();
