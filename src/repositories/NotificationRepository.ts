import { apiClient } from "../api/client";
import { offlineEngine, type QueuedWrite } from "../services/sync";
import type { ListResult, QueryOptions, RepositoryResult } from "./base";
import type { EntityId, Notification, NotificationChannel } from "../types/domain";

export interface NotificationPreferences {
  id?: EntityId;
  userId: EntityId;
  channels: Record<NotificationChannel, boolean>;
  digestFrequency: "immediate" | "daily" | "weekly";
  quietHours?: { start: string; end: string; timezone: string };
  calendarReminders: boolean;
  messagingAlerts: boolean;
  programAssignmentAlerts: boolean;
  marketing: boolean;
  push: { enabled: boolean; endpoint?: string; platform?: "web" | "ios" | "android"; tokenId?: string };
  email: { enabled: boolean; address?: string; verified?: boolean };
  sms: { enabled: boolean; phoneNumber?: string; verified?: boolean };
  createdAt: string;
  updatedAt: string;
}

export type CreateNotificationInput = Omit<Notification, "id" | "createdAt" | "updatedAt" | "status"> & Partial<Pick<Notification, "id" | "createdAt" | "updatedAt" | "status">>;

const notificationsPath = "/notifications";
const preferencesPath = "/notificationPreferences";
const now = () => new Date().toISOString();

function source(sourceName: string): RepositoryResult<unknown>["source"] {
  return sourceName === "mock" || sourceName === "cache" ? sourceName : "remote";
}

function normalize(input: CreateNotificationInput): Notification {
  const timestamp = now();
  return {
    id: input.id ?? crypto.randomUUID(),
    userId: input.userId,
    organizationId: input.organizationId,
    title: input.title,
    body: input.body,
    channel: input.channel,
    status: input.status ?? "queued",
    readAt: input.readAt,
    createdAt: input.createdAt ?? timestamp,
    updatedAt: input.updatedAt ?? timestamp,
  };
}

export class NotificationRepository {
  defaultPreferences(userId: EntityId): NotificationPreferences {
    const timestamp = now();
    return {
      id: userId,
      userId,
      channels: { in_app: true, email: true, push: true, sms: false },
      digestFrequency: "immediate",
      calendarReminders: true,
      messagingAlerts: true,
      programAssignmentAlerts: true,
      marketing: false,
      push: { enabled: true, platform: "web" },
      email: { enabled: true },
      sms: { enabled: false },
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  }

  getOfflineQueue(): QueuedWrite[] {
    return offlineEngine.getQueue().filter((item) => item.entity === notificationsPath || item.entity === preferencesPath || item.entity.startsWith(`${notificationsPath}/`) || item.entity.startsWith(`${preferencesPath}/`));
  }

  async list(options?: QueryOptions & { userId?: EntityId }): Promise<RepositoryResult<ListResult<Notification>>> {
    const response = await apiClient.get<ListResult<Notification>>(notificationsPath, { headers: options?.organizationId ? { "x-organization-id": options.organizationId } : undefined });
    const items = response.data.items ?? [];
    const filtered = items.filter((notification) => (!options?.organizationId || notification.organizationId === options.organizationId) && (!options?.userId || notification.userId === options.userId));
    const visible = filtered.filter((notification) => !notification.deletedAt && notification.status !== "failed");
    return { data: { items: visible.slice(0, options?.limit ?? visible.length), nextCursor: response.data.nextCursor }, source: source(response.source) };
  }

  async findById(id: EntityId): Promise<RepositoryResult<Notification | null>> {
    const response = await apiClient.get<Notification | null>(`${notificationsPath}/${id}`);
    return { data: response.data, source: source(response.source) };
  }

  async create(input: CreateNotificationInput): Promise<RepositoryResult<Notification>> {
    const response = await apiClient.post<Notification, Notification>(notificationsPath, normalize(input), { queueWhenOffline: true });
    return { data: response.data, source: source(response.source) };
  }

  async markRead(id: EntityId): Promise<RepositoryResult<Notification>> {
    const timestamp = now();
    const response = await apiClient.patch<Notification, Partial<Notification>>(`${notificationsPath}/${id}`, { status: "read", readAt: timestamp, updatedAt: timestamp }, { queueWhenOffline: true });
    return { data: response.data, source: source(response.source) };
  }

  async archive(id: EntityId): Promise<RepositoryResult<Notification>> {
    const timestamp = now();
    const response = await apiClient.patch<Notification, Partial<Notification>>(`${notificationsPath}/${id}`, { deletedAt: timestamp, updatedAt: timestamp }, { queueWhenOffline: true });
    return { data: response.data, source: source(response.source) };
  }

  async delete(id: EntityId): Promise<RepositoryResult<Notification>> {
    return this.archive(id);
  }

  async getPreferences(userId: EntityId): Promise<RepositoryResult<NotificationPreferences>> {
    const response = await apiClient.get<NotificationPreferences | null>(`${preferencesPath}/${userId}`);
    return { data: response.data ?? this.defaultPreferences(userId), source: source(response.source) };
  }

  async savePreferences(input: NotificationPreferences): Promise<RepositoryResult<NotificationPreferences>> {
    const payload = { ...input, id: input.id ?? input.userId, updatedAt: now() };
    const response = await apiClient.post<NotificationPreferences, NotificationPreferences>(preferencesPath, payload, { queueWhenOffline: true });
    return { data: response.data, source: source(response.source) };
  }

  seedSamples(userId: EntityId, organizationId?: EntityId): Notification[] {
    const timestamp = now();
    return [
      { id: "sample-calendar-reminder", userId, organizationId, title: "Calendar reminder", body: "Your trainer check-in starts in 30 minutes.", channel: "in_app", status: "sent", createdAt: timestamp, updatedAt: timestamp },
      { id: "sample-message-alert", userId, organizationId, title: "New message", body: "Coach Maya sent a programming note.", channel: "push", status: "sent", createdAt: timestamp, updatedAt: timestamp },
      { id: "sample-program-assignment", userId, organizationId, title: "Program assigned", body: "Glute Strength Block is ready in your member app.", channel: "email", status: "queued", createdAt: timestamp, updatedAt: timestamp },
    ];
  }
}

export const notificationRepository = new NotificationRepository();
