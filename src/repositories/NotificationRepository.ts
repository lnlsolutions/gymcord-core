import { apiClient } from "../api/client";
import { offlineEngine, type QueuedWrite } from "../services/sync";
import type { ListResult, QueryOptions, RepositoryResult } from "./base";
import type { AppNotification, EntityId, NotificationChannel, NotificationKind, NotificationPreference } from "../types/domain";

const notificationsPath = "/notifications";
const preferencesPath = "/notificationPreferences";
const now = () => new Date().toISOString();
const source = (name: string): RepositoryResult<unknown>["source"] => name === "mock" || name === "cache" ? name : "remote";

export interface NotificationFilters { status?: "active" | "unread" | "read" | "archived"; kind?: NotificationKind | "all"; channel?: NotificationChannel | "all"; }
export type CreateNotificationInput = Omit<AppNotification, "id" | "createdAt" | "updatedAt" | "lifecycleStatus" | "priority" | "actions" | "delivery" | "channels"> & Partial<Pick<AppNotification, "id" | "createdAt" | "updatedAt" | "lifecycleStatus" | "priority" | "actions" | "delivery" | "channels">>;

function deliveryDefaults(input: Partial<AppNotification>): AppNotification["delivery"] {
  return {
    push: { enabled: input.channels?.includes("push") ?? true, title: input.title, body: input.body, deepLink: input.sourceId ? `gymcord://${input.sourceModule ?? "notifications"}/${input.sourceId}` : "gymcord://notifications", data: { kind: input.kind ?? "system_alert", sourceModule: input.sourceModule ?? "system" } },
    email: { enabled: input.channels?.includes("email") ?? false, subject: input.title, body: input.body, variables: { notificationId: input.id ?? "pending" } },
    sms: { enabled: input.channels?.includes("sms") ?? false, body: input.body },
  };
}

function normalize(input: CreateNotificationInput): AppNotification {
  const timestamp = now();
  const base = { ...input, id: input.id ?? crypto.randomUUID(), createdAt: input.createdAt ?? timestamp, updatedAt: input.updatedAt ?? timestamp };
  return { ...base, priority: input.priority ?? "normal", lifecycleStatus: input.lifecycleStatus ?? "unread", channels: input.channels ?? ["in_app", "push"], actions: input.actions ?? [], delivery: input.delivery ?? deliveryDefaults(base) } as AppNotification;
}

export class NotificationRepository {
  getOfflineQueue(): QueuedWrite[] { return offlineEngine.getQueue().filter((item) => item.entity.startsWith(notificationsPath) || item.entity.startsWith(preferencesPath)); }

  async list(options?: QueryOptions & { filters?: NotificationFilters }): Promise<RepositoryResult<ListResult<AppNotification>>> {
    const response = await apiClient.get<ListResult<AppNotification>>(notificationsPath, { headers: options?.organizationId ? { "x-organization-id": options.organizationId } : undefined });
    let items = response.data.items ?? [];
    if (options?.organizationId) items = items.filter((item) => item.organizationId === options.organizationId);
    const filters = options?.filters;
    if (filters?.status === "active" || !filters?.status) items = items.filter((item) => item.lifecycleStatus !== "archived");
    if (filters?.status === "unread") items = items.filter((item) => item.lifecycleStatus === "unread");
    if (filters?.status === "read") items = items.filter((item) => item.lifecycleStatus === "read");
    if (filters?.status === "archived") items = items.filter((item) => item.lifecycleStatus === "archived");
    if (filters?.kind && filters.kind !== "all") items = items.filter((item) => item.kind === filters.kind);
    if (filters?.channel && filters.channel !== "all") items = items.filter((item) => item.channels.includes(filters.channel as NotificationChannel));
    items = items.sort((a, b) => (b.scheduledFor ?? b.createdAt).localeCompare(a.scheduledFor ?? a.createdAt));
    return { data: { items: items.slice(0, options?.limit ?? items.length), nextCursor: response.data.nextCursor }, source: source(response.source) };
  }

  async findById(id: EntityId) { const response = await apiClient.get<AppNotification | null>(`${notificationsPath}/${id}`); return { data: response.data, source: source(response.source) }; }
  async create(input: CreateNotificationInput) { const response = await apiClient.post<AppNotification, AppNotification>(notificationsPath, normalize(input), { queueWhenOffline: true }); return { data: response.data, source: source(response.source) }; }
  async markRead(id: EntityId, read = true) { const timestamp = now(); const response = await apiClient.patch<AppNotification, Partial<AppNotification>>(`${notificationsPath}/${id}`, { lifecycleStatus: read ? "read" : "unread", readAt: read ? timestamp : undefined, updatedAt: timestamp }, { queueWhenOffline: true }); return { data: response.data, source: source(response.source) }; }
  async archive(id: EntityId) { const timestamp = now(); const response = await apiClient.patch<AppNotification, Partial<AppNotification>>(`${notificationsPath}/${id}`, { lifecycleStatus: "archived", archivedAt: timestamp, deletedAt: timestamp, updatedAt: timestamp }, { queueWhenOffline: true }); return { data: response.data, source: source(response.source) }; }
  async delete(id: EntityId) { return this.archive(id); }

  async getPreferences(userId: EntityId, organizationId?: EntityId): Promise<RepositoryResult<NotificationPreference>> {
    const response = await apiClient.get<ListResult<NotificationPreference>>(preferencesPath, { headers: organizationId ? { "x-organization-id": organizationId } : undefined });
    const existing = (response.data.items ?? []).find((item) => item.userId === userId && item.organizationId === organizationId);
    return { data: existing ?? this.defaultPreferences(userId, organizationId), source: source(response.source) };
  }

  async savePreferences(preferences: NotificationPreference) { const response = await apiClient.post<NotificationPreference, NotificationPreference>(preferencesPath, { ...preferences, updatedAt: now() }, { queueWhenOffline: true }); return { data: response.data, source: source(response.source) }; }

  defaultPreferences(userId: EntityId, organizationId?: EntityId): NotificationPreference { const timestamp = now(); return { id: `pref-${userId}-${organizationId ?? "personal"}`, userId, organizationId, channels: { in_app: true, push: true, email: true, sms: false }, reminders: { workout: true, nutrition: true, progress: true, calendar: true, quietHoursStart: "22:00", quietHoursEnd: "07:00", timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC" }, digestFrequency: "daily", createdAt: timestamp, updatedAt: timestamp }; }

  seedSamples(userId: EntityId, organizationId?: EntityId): AppNotification[] { return [
    normalize({ userId, organizationId, audience: "member", kind: "workout_reminder", title: "Workout reminder", body: "Upper Body Strength starts in 30 minutes.", sourceModule: "workout", sourceId: "workout-upper", scheduledFor: now(), priority: "high" }),
    normalize({ userId, organizationId, audience: "member", kind: "nutrition_reminder", title: "Log nutrition", body: "Add protein, calories, and water before the day wraps.", sourceModule: "nutrition" }),
    normalize({ userId, organizationId, audience: "trainer", kind: "trainer_message", title: "Trainer message", body: "Maya sent feedback on your last workout.", sourceModule: "messaging", sourceId: "conversation-trainer", channels: ["in_app", "push", "email"] }),
    normalize({ userId, organizationId, audience: "team", kind: "program_assignment", title: "Program assigned", body: "New 4-week hypertrophy block is ready.", sourceModule: "program_builder", sourceId: "program-hypertrophy" }),
    normalize({ userId, organizationId, audience: "system", kind: "system_alert", title: "System alert", body: "Push, email, and SMS payloads are ready for provider delivery.", sourceModule: "system", priority: "critical" }),
  ]; }
}
export const notificationRepository = new NotificationRepository();
