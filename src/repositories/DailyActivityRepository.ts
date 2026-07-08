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
    await Promise.allSettled([
      this.safeWrite("daily log", () => this.backend.request({ method: "POST", path: "/dailyLogs", body: { id: `${currentUserId(session)}-${log.date}`, ...base, ...log }, headers: {}, timeoutMs: appConfig.backend.timeoutMs, retryAttempts: 0, queuedWhenOffline: true })),
      this.safeWrite("nutrition log", () => this.backend.request({ method: "POST", path: "/nutritionLogs", body: { id: crypto.randomUUID(), ...base, loggedAt: dateAtNoon(log.date), calories: log.calories, proteinG: log.protein, photoPath: log.mealPhoto || null, notes: log.ingredients }, headers: {}, timeoutMs: appConfig.backend.timeoutMs, retryAttempts: 0, queuedWhenOffline: true })),
      this.safeWrite("measurement", () => this.backend.request({ method: "POST", path: "/measurements", body: { id: crypto.randomUUID(), ...base, measuredOn: log.date, weightKg: toNumber(log.measurements.weight), waistCm: toNumber(log.measurements.waist), chestCm: toNumber(log.measurements.chest), hipsCm: toNumber(log.measurements.hips), metadata: log.measurements }, headers: {}, timeoutMs: appConfig.backend.timeoutMs, retryAttempts: 0, queuedWhenOffline: true })),
      ...Object.entries(log.photos).filter(([, photoPath]) => Boolean(photoPath)).map(([angle, photoPath]) => this.safeWrite("progress photo", () => this.backend.request({ method: "POST", path: "/progressPhotos", body: { id: crypto.randomUUID(), ...base, photoPath, takenOn: log.date, angle, visibility: "private" }, headers: {}, timeoutMs: appConfig.backend.timeoutMs, retryAttempts: 0, queuedWhenOffline: true }))),
      this.safeWrite("XP event", () => this.backend.request({ method: "POST", path: "/xpEvents", body: { id: crypto.randomUUID(), ...base, sourceType: "daily_activity", points: xp.totalXp, reason: "Daily activity snapshot", createdAt: new Date().toISOString() }, headers: {}, timeoutMs: appConfig.backend.timeoutMs, retryAttempts: 0, queuedWhenOffline: true })),
      this.safeWrite("streak", () => this.backend.request({ method: "POST", path: "/streaks", body: { id: crypto.randomUUID(), ...base, streakType: "daily_activity", currentCount: streak.currentStreak, longestCount: streak.longestStreak, lastActivityOn: log.date, updatedAt: new Date().toISOString() }, headers: {}, timeoutMs: appConfig.backend.timeoutMs, retryAttempts: 0, queuedWhenOffline: true })),
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
    try {
      const result = await this.backend.request<ListResult<DailyLog & { userId?: string }>>({ method: "GET", path: "/dailyLogs", headers: {}, timeoutMs: appConfig.backend.timeoutMs, retryAttempts: 0, queuedWhenOffline: false });
      const logs = Object.fromEntries((result.data.items ?? []).filter((log) => !log.userId || log.userId === currentUserId(session)).map((log) => [log.date, { ...createEmptyDay(log.date), ...log }]));
      return Object.keys(logs).length ? logs : fallback;
    } catch { return fallback; }
  }

  private async loadMissions() { return saved<Mission[]>(missionsKey, []); }
  private async loadXpEvents() { return saved<PersistedXpEvent[]>(xpKey, []); }
  private async loadStreaks() { return saved<PersistedStreak[]>(streakKey, []); }

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
