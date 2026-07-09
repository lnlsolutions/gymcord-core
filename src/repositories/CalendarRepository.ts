import { apiClient } from "../api/client";
import { offlineEngine } from "../services/sync";
import type { ListResult, QueryOptions, RepositoryResult } from "./base";
import type { EntityId, IsoDateString, IsoDateTimeString } from "../types/domain";

export type CalendarEventType = "workout" | "check_in" | "appointment" | "program_milestone" | "availability" | "custom";
export type CalendarEventStatus = "scheduled" | "completed" | "cancelled" | "archived";
export type CalendarReminderChannel = "in_app" | "email" | "push" | "sms";
export type CalendarRecurrenceFrequency = "daily" | "weekly" | "monthly";

export interface CalendarReminder {
  id: EntityId;
  offsetMinutes: number;
  channel: CalendarReminderChannel;
  message?: string;
  enabled: boolean;
}

export interface RecurringEventMetadata {
  frequency: CalendarRecurrenceFrequency;
  interval: number;
  daysOfWeek?: number[];
  until?: IsoDateString;
  count?: number;
  timezone: string;
}

export interface CalendarEvent {
  id: EntityId;
  organizationId?: EntityId;
  trainerId?: EntityId;
  memberId?: EntityId;
  programId?: EntityId;
  workoutId?: EntityId;
  title: string;
  description?: string;
  type: CalendarEventType;
  status: CalendarEventStatus;
  startsAt: IsoDateTimeString;
  endsAt: IsoDateTimeString;
  timezone: string;
  location?: string;
  reminders: CalendarReminder[];
  recurrence?: RecurringEventMetadata;
  metadata: Record<string, unknown>;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
  cancelledAt?: IsoDateTimeString;
  archivedAt?: IsoDateTimeString;
}

export interface AvailabilityBlock {
  id: EntityId;
  organizationId?: EntityId;
  trainerId?: EntityId;
  title: string;
  startsAt: IsoDateTimeString;
  endsAt: IsoDateTimeString;
  timezone: string;
  recurrence?: RecurringEventMetadata;
  capacity: number;
  status: "available" | "blocked" | "archived";
  metadata: Record<string, unknown>;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
}

export type CreateCalendarEventInput = Omit<CalendarEvent, "id" | "status" | "createdAt" | "updatedAt" | "metadata" | "reminders"> & Partial<Pick<CalendarEvent, "id" | "status" | "createdAt" | "updatedAt" | "metadata" | "reminders">>;
export type UpdateCalendarEventInput = Partial<Omit<CalendarEvent, "id" | "createdAt" | "updatedAt">>;
export type CreateAvailabilityBlockInput = Omit<AvailabilityBlock, "id" | "status" | "createdAt" | "updatedAt" | "metadata"> & Partial<Pick<AvailabilityBlock, "id" | "status" | "createdAt" | "updatedAt" | "metadata">>;

const eventsPath = "/calendar-events";
const availabilityPath = "/availability-blocks";
const now = () => new Date().toISOString();
const randomId = () => crypto.randomUUID();

function source(value: string): RepositoryResult<CalendarEvent>["source"] {
  return value === "mock" || value === "cache" ? value : "remote";
}

function normalizeEvent(input: CreateCalendarEventInput): CalendarEvent {
  const timestamp = now();
  return {
    id: input.id ?? randomId(),
    organizationId: input.organizationId,
    trainerId: input.trainerId,
    memberId: input.memberId,
    programId: input.programId,
    workoutId: input.workoutId,
    title: input.title,
    description: input.description ?? "",
    type: input.type,
    status: input.status ?? "scheduled",
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    timezone: input.timezone,
    location: input.location,
    reminders: input.reminders ?? [],
    recurrence: input.recurrence,
    metadata: input.metadata ?? {},
    createdAt: input.createdAt ?? timestamp,
    updatedAt: input.updatedAt ?? timestamp,
  };
}

function normalizeAvailability(input: CreateAvailabilityBlockInput): AvailabilityBlock {
  const timestamp = now();
  return { id: input.id ?? randomId(), status: input.status ?? "available", capacity: input.capacity, organizationId: input.organizationId, trainerId: input.trainerId, title: input.title, startsAt: input.startsAt, endsAt: input.endsAt, timezone: input.timezone, recurrence: input.recurrence, metadata: input.metadata ?? {}, createdAt: input.createdAt ?? timestamp, updatedAt: input.updatedAt ?? timestamp };
}

export class CalendarRepository {
  async findById(id: EntityId): Promise<RepositoryResult<CalendarEvent | null>> {
    const response = await apiClient.get<CalendarEvent | null>(`${eventsPath}/${id}`);
    return { data: response.data, source: source(response.source) };
  }

  async list(options?: QueryOptions): Promise<RepositoryResult<ListResult<CalendarEvent>>> {
    const response = await apiClient.get<ListResult<CalendarEvent>>(eventsPath, { headers: options?.organizationId ? { "x-organization-id": options.organizationId } : undefined });
    const items = (response.data.items ?? []).filter((event) => event.status !== "archived");
    const filtered = options?.organizationId ? items.filter((event) => event.organizationId === options.organizationId) : items;
    return { data: { items: filtered.slice(0, options?.limit ?? filtered.length), nextCursor: response.data.nextCursor }, source: source(response.source) };
  }

  async create(input: CreateCalendarEventInput): Promise<RepositoryResult<CalendarEvent>> {
    const event = normalizeEvent(input);
    const response = await apiClient.post<CalendarEvent, CalendarEvent>(eventsPath, event, { queueWhenOffline: true });
    return { data: response.data ?? event, source: source(response.source) };
  }

  async update(id: EntityId, input: UpdateCalendarEventInput): Promise<RepositoryResult<CalendarEvent>> {
    const patch = { ...input, updatedAt: now() };
    const response = await apiClient.patch<CalendarEvent, typeof patch>(`${eventsPath}/${id}`, patch, { queueWhenOffline: true });
    return { data: response.data ?? ({ id, ...patch } as CalendarEvent), source: source(response.source) };
  }

  async delete(id: EntityId): Promise<void> { await this.archive(id); }
  async cancel(id: EntityId, reason?: string) { return this.update(id, { status: "cancelled", cancelledAt: now(), metadata: { cancelReason: reason ?? "cancelled" } }); }
  async archive(id: EntityId) { return this.update(id, { status: "archived", archivedAt: now() }); }

  async listAvailability(options?: QueryOptions): Promise<RepositoryResult<ListResult<AvailabilityBlock>>> {
    const response = await apiClient.get<ListResult<AvailabilityBlock>>(availabilityPath, { headers: options?.organizationId ? { "x-organization-id": options.organizationId } : undefined });
    const items = (response.data.items ?? []).filter((block) => block.status !== "archived");
    return { data: { items: items.slice(0, options?.limit ?? items.length), nextCursor: response.data.nextCursor }, source: source(response.source) };
  }

  async createAvailability(input: CreateAvailabilityBlockInput): Promise<RepositoryResult<AvailabilityBlock>> {
    const block = normalizeAvailability(input);
    const response = await apiClient.post<AvailabilityBlock, AvailabilityBlock>(availabilityPath, block, { queueWhenOffline: true });
    return { data: response.data ?? block, source: source(response.source) };
  }

  getOfflineQueue() { return offlineEngine.getQueue().filter((write) => write.entity.startsWith(eventsPath) || write.entity.startsWith(availabilityPath)); }
}

export const calendarRepository = new CalendarRepository();
