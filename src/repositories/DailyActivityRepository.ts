import { appConfig } from "../config";
import type { AuthSession } from "../auth/types";
import type { DailyLog, Mission, Profile, StreakSnapshot, XpSnapshot } from "../types/gymcord";
import { createEmptyDay, createEmptyProfile, saved, save } from "../lib/storage";
import { offlineEngine } from "../services/sync";
import type { BackendProvider } from "../api";
import { createBackendProvider } from "../api/client";

export interface PersistenceState {
  provider: string;
  currentUser: string;
  organization: string;
  profile: Profile;
  logs: Record<string, DailyLog>;
  missions: Mission[];
  xpEvents: PersistedXpEvent[];
  streaks: PersistedStreak[];
  lastSaveStatus: string;
  offlineQueueSize: number;
}

export interface PersistedXpEvent {
  id: string;
  date: string;
  points: number;
  reason: string;
  createdAt: string;
}

export interface PersistedStreak {
  id: string;
  currentCount: number;
  longestCount: number;
  lastActivityOn: string;
  updatedAt: string;
}

type ListResult<T> = { items: T[] };

const statusKey = "gc.persistence.lastSaveStatus";
const missionsKey = "gc.persistence.missions";
const xpKey = "gc.persistence.xpEvents";
const streakKey = "gc.persistence.streaks";

function currentUserId(session: AuthSession | null) {
  return session?.user.id ?? "demo-user";
}

function currentOrganizationId(session: AuthSession | null) {
  return session?.organization?.id ?? session?.user.activeOrganizationId ?? "org-gymcord";
}

function isConfiguredSupabase(provider: BackendProvider) {
  return provider.name === "supabase" && Boolean(appConfig.backend.supabase.url && appConfig.backend.supabase.anonKey);
}

function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function dateAtNoon(date: string) {
  return `${date}T12:00:00.000Z`;
}

export class DailyActivityRepository {
  constructor(private readonly backend = createBackendProvider()) {}

  get providerName() { return this.backend.name; }

  getOfflineQueue() { return offlineEngine.getQueue(); }

  getLastSaveStatus() { return saved(statusKey, "No saves yet."); }

  async load(session: AuthSession | null): Promise<PersistenceState> {
    const profile = await this.loadProfile(session);
    const logs = await this.loadDailyLogs(session);
    const missions = await this.loadMissions();
    const xpEvents = await this.loadXpEvents();
    const streaks = await this.loadStreaks();

    return {
      provider: this.backend.name,
      currentUser: session?.user.email ?? session?.user.displayName ?? currentUserId(session),
      organization: session?.organization?.name ?? currentOrganizationId(session),
      profile,
      logs,
      missions,
      xpEvents,
      streaks,
      lastSaveStatus: this.getLastSaveStatus(),
      offlineQueueSize: this.getOfflineQueue().length,
    };
  }

  async saveProfile(session: AuthSession | null, profile: Profile): Promise<void> {
    save(appConfig.storageKeys.profile, profile);
    const table = "memberProfiles";
    const now = new Date().toISOString();
    const body = {
      id: crypto.randomUUID(),
      userId: currentUserId(session),
      organizationId: currentOrganizationId(session),
      displayName: profile.name,
      goals: [profile.goal].filter(Boolean),
      measurements: { height: profile.height, currentWeight: profile.currentWeight, goalWeight: profile.goalWeight },
      preferences: { activityLevel: profile.activityLevel, gender: profile.gender, profilePhoto: profile.profilePhoto },
      settings: { startDate: profile.startDate, age: profile.age },
      updatedAt: now,
      createdAt: now,
    };
    await this.safeWrite("profile", () => this.backend.request({ method: "POST", path: `/${table}`, body, headers: {}, timeoutMs: appConfig.backend.timeoutMs, retryAttempts: 0, queuedWhenOffline: true }));
  }

  async saveDailyLog(session: AuthSession | null, log: DailyLog, mission: Mission, xp: XpSnapshot, streak: StreakSnapshot): Promise<void> {
    const logs = saved<Record<string, DailyLog>>(appConfig.storageKeys.dailyLogs, {});
    save(appConfig.storageKeys.dailyLogs, { ...logs, [log.date]: log });
    const missions = upsertByDate(saved<Mission[]>(missionsKey, []), mission);
    save(missionsKey, missions);
    const xpEvent = { id: crypto.randomUUID(), date: log.date, points: xp.totalXp, reason: "daily_activity_snapshot", createdAt: new Date().toISOString() };
    save(xpKey, [xpEvent, ...saved<PersistedXpEvent[]>(xpKey, [])].slice(0, 100));
    const streakRecord = { id: crypto.randomUUID(), currentCount: streak.currentStreak, longestCount: streak.longestStreak, lastActivityOn: log.date, updatedAt: new Date().toISOString() };
    save(streakKey, [streakRecord, ...saved<PersistedStreak[]>(streakKey, [])].slice(0, 100));

    if (!isConfiguredSupabase(this.backend) && this.backend.name !== "mock") return;

    const base = { organizationId: currentOrganizationId(session), userId: currentUserId(session) };
    const sessionId = `${currentUserId(session)}-${log.date}-workout`;
    const completedExerciseEntries = Object.entries(log.completedExercises).filter(([, completed]) => completed);
    await Promise.allSettled([
      ...(this.backend.name === "mock" ? [this.safeWrite("daily log", () => this.backend.request({ method: "POST", path: "/dailyLogs", body: { id: `${currentUserId(session)}-${log.date}`, ...base, ...log }, headers: {}, timeoutMs: appConfig.backend.timeoutMs, retryAttempts: 0, queuedWhenOffline: true }))] : []),
      this.safeWrite("workout session", () => this.backend.request({ method: "POST", path: "/workoutSessions", body: { id: sessionId, ...base, workoutId: "daily-program", status: completedExerciseEntries.length ? "completed" : "in_progress", startedAt: dateAtNoon(log.date), completedAt: completedExerciseEntries.length ? dateAtNoon(log.date) : null, durationMinutes: completedExerciseEntries.length ? Math.max(1, completedExerciseEntries.length * 5) : 0, metadata: { date: log.date, completedExercises: log.completedExercises, weights: log.weights, notes: log.notes } }, headers: {}, timeoutMs: appConfig.backend.timeoutMs, retryAttempts: 0, queuedWhenOffline: true })),
      ...Object.entries({ ...log.weights, ...log.notes, ...log.completedExercises }).map(([exerciseKey]) => this.safeWrite("exercise log", () => this.backend.request({ method: "POST", path: "/exerciseLogs", body: { id: `${sessionId}-${exerciseKey}`, ...base, sessionId, exerciseId: exerciseKey, completed: Boolean(log.completedExercises[exerciseKey]), weight: log.weights[exerciseKey] || null, notes: log.notes[exerciseKey] || log.weights[exerciseKey] || null, loggedAt: dateAtNoon(log.date) }, headers: {}, timeoutMs: appConfig.backend.timeoutMs, retryAttempts: 0, queuedWhenOffline: true }))),
      this.safeWrite("nutrition log", () => this.backend.request({ method: "POST", path: "/nutritionLogs", body: { id: `${currentUserId(session)}-${log.date}-nutrition`, ...base, loggedAt: dateAtNoon(log.date), calories: log.calories, proteinG: log.protein, water: log.water, sleep: log.sleep, steps: log.steps, mood: log.mood, energy: log.energy, photoPath: log.mealPhoto || null, notes: log.ingredients }, headers: {}, timeoutMs: appConfig.backend.timeoutMs, retryAttempts: 0, queuedWhenOffline: true })),
      this.safeWrite("measurement", () => this.backend.request({ method: "POST", path: "/measurements", body: { id: `${currentUserId(session)}-${log.date}-measurements`, ...base, measuredOn: log.date, weightKg: toNumber(log.measurements.weight), waistCm: toNumber(log.measurements.waist), chestCm: toNumber(log.measurements.chest), hipsCm: toNumber(log.measurements.hips), metadata: log.measurements }, headers: {}, timeoutMs: appConfig.backend.timeoutMs, retryAttempts: 0, queuedWhenOffline: true })),
      ...Object.entries(log.photos).filter(([, photoPath]) => Boolean(photoPath)).map(([angle, photoPath]) => this.safeWrite("progress photo", () => this.backend.request({ method: "POST", path: "/progressPhotos", body: { id: `${currentUserId(session)}-${log.date}-${angle}`, ...base, photoPath, takenOn: log.date, angle, visibility: "private" }, headers: {}, timeoutMs: appConfig.backend.timeoutMs, retryAttempts: 0, queuedWhenOffline: true }))),
      this.safeWrite("mission", () => this.backend.request({ method: "POST", path: "/missions", body: { id: mission.id, ...base, ...mission, metadata: mission }, headers: {}, timeoutMs: appConfig.backend.timeoutMs, retryAttempts: 0, queuedWhenOffline: true })),
      this.safeWrite("XP event", () => this.backend.request({ method: "POST", path: "/xpEvents", body: { id: xpEvent.id, ...base, sourceType: "daily_activity", points: xp.totalXp, reason: "Daily activity snapshot", createdAt: xpEvent.createdAt, metadata: xp }, headers: {}, timeoutMs: appConfig.backend.timeoutMs, retryAttempts: 0, queuedWhenOffline: true })),
      this.safeWrite("streak", () => this.backend.request({ method: "POST", path: "/streaks", body: { id: streakRecord.id, ...base, streakType: "daily_activity", currentCount: streak.currentStreak, longestCount: streak.longestStreak, lastActivityOn: log.date, updatedAt: streakRecord.updatedAt, metadata: streak }, headers: {}, timeoutMs: appConfig.backend.timeoutMs, retryAttempts: 0, queuedWhenOffline: true })),
    ]);
  }

  private async loadProfile(session: AuthSession | null): Promise<Profile> {
    const fallback = saved(appConfig.storageKeys.profile, createEmptyProfile());
    try {
      const result = await this.backend.request<ListResult<Record<string, any>>>({ method: "GET", path: "/memberProfiles", headers: {}, timeoutMs: appConfig.backend.timeoutMs, retryAttempts: 0, queuedWhenOffline: false });
      const record = result.data.items?.find((item) => item.userId === currentUserId(session)) ?? result.data.items?.[0];
      if (!record) return fallback;
      return { ...fallback, name: record.displayName ?? fallback.name, goal: record.goals?.[0] ?? fallback.goal, height: record.measurements?.height ?? fallback.height, currentWeight: record.measurements?.currentWeight ?? fallback.currentWeight, goalWeight: record.measurements?.goalWeight ?? fallback.goalWeight, activityLevel: record.preferences?.activityLevel ?? fallback.activityLevel, gender: record.preferences?.gender ?? fallback.gender, profilePhoto: record.preferences?.profilePhoto ?? fallback.profilePhoto, age: record.settings?.age ?? fallback.age, startDate: record.settings?.startDate ?? fallback.startDate };
    } catch { return fallback; }
  }

  private async loadDailyLogs(session: AuthSession | null): Promise<Record<string, DailyLog>> {
    const fallback = saved<Record<string, DailyLog>>(appConfig.storageKeys.dailyLogs, {});
    if (this.backend.name === "mock") {
      try {
        const result = await this.backend.request<ListResult<DailyLog & { userId?: string }>>({ method: "GET", path: "/dailyLogs", headers: {}, timeoutMs: appConfig.backend.timeoutMs, retryAttempts: 0, queuedWhenOffline: false });
        const logs = Object.fromEntries((result.data.items ?? []).filter((log) => !log.userId || log.userId === currentUserId(session)).map((log) => [log.date, { ...createEmptyDay(log.date), ...log }]));
        return Object.keys(logs).length ? logs : fallback;
      } catch { return fallback; }
    }

    try {
      const [nutrition, measurements, photos, sessions, exerciseLogs] = await Promise.all([
        this.listRemote<any>("/nutritionLogs"),
        this.listRemote<any>("/measurements"),
        this.listRemote<any>("/progressPhotos"),
        this.listRemote<any>("/workoutSessions"),
        this.listRemote<any>("/exerciseLogs"),
      ]);
      const logs: Record<string, DailyLog> = { ...fallback };
      const ensure = (date: string) => logs[date] ??= { ...createEmptyDay(date), ...(fallback[date] ?? {}) };

      nutrition.filter((item) => !item.userId || item.userId === currentUserId(session)).forEach((item) => {
        const date = String(item.loggedAt ?? item.createdAt ?? "").slice(0, 10);
        if (!date) return;
        const log = ensure(date);
        Object.assign(log, { calories: item.calories ?? log.calories, protein: item.proteinG ?? item.protein ?? log.protein, water: item.water ?? log.water, sleep: item.sleep ?? log.sleep, steps: item.steps ?? log.steps, mood: item.mood ?? log.mood, energy: item.energy ?? log.energy, ingredients: item.notes ?? log.ingredients, mealPhoto: item.photoPath ?? log.mealPhoto });
      });

      measurements.filter((item) => !item.userId || item.userId === currentUserId(session)).forEach((item) => {
        const date = item.measuredOn ?? String(item.createdAt ?? "").slice(0, 10);
        if (!date) return;
        const log = ensure(date);
        log.measurements = { ...log.measurements, ...(item.metadata ?? {}), weight: String(item.metadata?.weight ?? item.weightKg ?? log.measurements.weight), waist: String(item.metadata?.waist ?? item.waistCm ?? log.measurements.waist), chest: String(item.metadata?.chest ?? item.chestCm ?? log.measurements.chest), hips: String(item.metadata?.hips ?? item.hipsCm ?? log.measurements.hips) };
      });

      photos.filter((item) => !item.userId || item.userId === currentUserId(session)).forEach((item) => {
        const date = item.takenOn ?? String(item.createdAt ?? "").slice(0, 10);
        const angle = item.angle as keyof DailyLog["photos"];
        if (!date || !angle || !(angle in createEmptyDay(date).photos)) return;
        ensure(date).photos[angle] = item.photoPath ?? "";
      });

      const sessionsById = new Map(sessions.filter((item) => !item.userId || item.userId === currentUserId(session)).map((item) => [item.id, item]));
      sessionsById.forEach((item: any) => {
        const date = item.metadata?.date ?? String(item.startedAt ?? item.completedAt ?? "").slice(0, 10);
        if (!date) return;
        const log = ensure(date);
        log.completedExercises = { ...log.completedExercises, ...(item.metadata?.completedExercises ?? {}) };
        log.weights = { ...log.weights, ...(item.metadata?.weights ?? {}) };
        log.notes = { ...log.notes, ...(item.metadata?.notes ?? {}) };
      });

      exerciseLogs.filter((item) => sessionsById.has(item.sessionId)).forEach((item) => {
        const sessionRecord: any = sessionsById.get(item.sessionId);
        const date = sessionRecord?.metadata?.date ?? String(item.loggedAt ?? sessionRecord?.startedAt ?? "").slice(0, 10);
        if (!date || !item.exerciseId) return;
        const log = ensure(date);
        log.completedExercises[item.exerciseId] = Boolean(item.completed);
        if (item.weight) log.weights[item.exerciseId] = String(item.weight);
        if (item.notes) log.notes[item.exerciseId] = String(item.notes);
      });

      return Object.keys(logs).length ? logs : fallback;
    } catch { return fallback; }
  }

  private async listRemote<T>(path: string): Promise<T[]> {
    const result = await this.backend.request<ListResult<T>>({ method: "GET", path, headers: {}, timeoutMs: appConfig.backend.timeoutMs, retryAttempts: 0, queuedWhenOffline: false });
    return result.data.items ?? [];
  }

  private async loadMissions() {
    const fallback = saved<Mission[]>(missionsKey, []);
    try {
      const result = await this.backend.request<ListResult<Mission>>({ method: "GET", path: "/missions", headers: {}, timeoutMs: appConfig.backend.timeoutMs, retryAttempts: 0, queuedWhenOffline: false });
      const remote = (result.data.items ?? []).map((item: any) => item.metadata ?? item).sort((a, b) => String(b.date).localeCompare(String(a.date)));
      return remote.length ? remote : fallback;
    } catch { return fallback; }
  }

  private async loadXpEvents() {
    const fallback = saved<PersistedXpEvent[]>(xpKey, []);
    try {
      const result = await this.backend.request<ListResult<any>>({ method: "GET", path: "/xpEvents", headers: {}, timeoutMs: appConfig.backend.timeoutMs, retryAttempts: 0, queuedWhenOffline: false });
      const remote = (result.data.items ?? []).map((item) => ({ id: item.id, date: item.createdAt?.slice(0, 10) ?? item.date ?? "", points: item.points ?? 0, reason: item.reason ?? item.sourceType ?? "XP event", createdAt: item.createdAt ?? new Date().toISOString() })).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return remote.length ? remote : fallback;
    } catch { return fallback; }
  }

  private async loadStreaks() {
    const fallback = saved<PersistedStreak[]>(streakKey, []);
    try {
      const result = await this.backend.request<ListResult<PersistedStreak>>({ method: "GET", path: "/streaks", headers: {}, timeoutMs: appConfig.backend.timeoutMs, retryAttempts: 0, queuedWhenOffline: false });
      const remote = (result.data.items ?? []).sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
      return remote.length ? remote : fallback;
    } catch { return fallback; }
  }

  private async safeWrite(label: string, write: () => Promise<unknown>) {
    try {
      await write();
      save(statusKey, `Saved ${label} at ${new Date().toLocaleTimeString()}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown error";
      save(statusKey, `Could not save ${label}: ${message}`);
    }
  }
}

function upsertByDate(items: Mission[], mission: Mission) {
  return [mission, ...items.filter((item) => item.date !== mission.date)].slice(0, 30);
}

export const dailyActivityRepository = new DailyActivityRepository();
