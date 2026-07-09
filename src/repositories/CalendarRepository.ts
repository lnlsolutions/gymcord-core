import { apiClient } from "../api/client";
import type { ListResult, QueryOptions, RepositoryResult } from "./base";
import type { CalendarAvailability, CalendarEvent, EntityId } from "../types/domain";

export type CreateCalendarEventInput = Omit<CalendarEvent, "id" | "createdAt" | "updatedAt" | "status"> & Partial<Pick<CalendarEvent, "id" | "createdAt" | "updatedAt" | "status">>;
export type UpdateCalendarEventInput = Partial<Omit<CalendarEvent, "id" | "createdAt" | "updatedAt">>;
export type CreateCalendarAvailabilityInput = Omit<CalendarAvailability, "id" | "createdAt" | "updatedAt" | "status"> & Partial<Pick<CalendarAvailability, "id" | "createdAt" | "updatedAt" | "status">>;
export type UpdateCalendarAvailabilityInput = Partial<Omit<CalendarAvailability, "id" | "createdAt" | "updatedAt">>;

const calendarPath = "/calendarEvents";
const availabilityPath = "/calendarAvailability";
const now = () => new Date().toISOString();

function source(source: string): RepositoryResult<CalendarEvent>["source"] {
  return source === "mock" || source === "cache" ? source : "remote";
}

function normalizeEvent(input: CreateCalendarEventInput): CalendarEvent {
  const timestamp = now();
  return {
    id: input.id ?? crypto.randomUUID(),
    organizationId: input.organizationId,
    trainerId: input.trainerId,
    memberId: input.memberId,
    title: input.title,
    description: input.description ?? "",
    kind: input.kind ?? "general",
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    timezone: input.timezone ?? "UTC",
    status: input.status ?? "scheduled",
    sourceModule: input.sourceModule,
    sourceId: input.sourceId,
    recurring: input.recurring,
    reminders: input.reminders ?? [],
    createdAt: input.createdAt ?? timestamp,
    updatedAt: input.updatedAt ?? timestamp,
  };
}

function normalizeAvailability(input: CreateCalendarAvailabilityInput): CalendarAvailability {
  const timestamp = now();
  return {
    id: input.id ?? crypto.randomUUID(),
    organizationId: input.organizationId,
    trainerId: input.trainerId,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    timezone: input.timezone ?? "UTC",
    status: input.status ?? "available",
    recurring: input.recurring,
    createdAt: input.createdAt ?? timestamp,
    updatedAt: input.updatedAt ?? timestamp,
  };
}

export class CalendarRepository {
  async list(options?: QueryOptions): Promise<RepositoryResult<ListResult<CalendarEvent>>> {
    const response = await apiClient.get<ListResult<CalendarEvent>>(calendarPath, { headers: options?.organizationId ? { "x-organization-id": options.organizationId } : undefined });
    const items = response.data.items ?? [];
    const filtered = options?.organizationId ? items.filter((event) => event.organizationId === options.organizationId) : items;
    const visible = filtered.filter((event) => event.status !== "archived");
    return { data: { items: visible.slice(0, options?.limit ?? visible.length), nextCursor: response.data.nextCursor }, source: source(response.source) };
  }

  async findById(id: EntityId): Promise<RepositoryResult<CalendarEvent | null>> {
    const response = await apiClient.get<CalendarEvent | null>(`${calendarPath}/${id}`);
    return { data: response.data, source: source(response.source) };
  }

  async create(input: CreateCalendarEventInput): Promise<RepositoryResult<CalendarEvent>> {
    const response = await apiClient.post<CalendarEvent, CalendarEvent>(calendarPath, normalizeEvent(input), { queueWhenOffline: true });
    return { data: response.data, source: source(response.source) };
  }

  async update(id: EntityId, input: UpdateCalendarEventInput): Promise<RepositoryResult<CalendarEvent>> {
    const response = await apiClient.patch<CalendarEvent, UpdateCalendarEventInput & { updatedAt: string }>(`${calendarPath}/${id}`, { ...input, updatedAt: now() }, { queueWhenOffline: true });
    return { data: response.data, source: source(response.source) };
  }

  async cancel(id: EntityId): Promise<RepositoryResult<CalendarEvent>> { return this.update(id, { status: "cancelled", deletedAt: now() }); }
  async archive(id: EntityId): Promise<RepositoryResult<CalendarEvent>> { return this.update(id, { status: "archived", deletedAt: now() }); }
  async delete(id: EntityId): Promise<RepositoryResult<CalendarEvent>> { return this.cancel(id); }

  async listAvailability(options?: QueryOptions): Promise<RepositoryResult<ListResult<CalendarAvailability>>> {
    const response = await apiClient.get<ListResult<CalendarAvailability>>(availabilityPath, { headers: options?.organizationId ? { "x-organization-id": options.organizationId } : undefined });
    const items = response.data.items ?? [];
    const filtered = options?.organizationId ? items.filter((slot) => slot.organizationId === options.organizationId) : items;
    const visible = filtered.filter((slot) => slot.status !== "archived");
    return { data: { items: visible.slice(0, options?.limit ?? visible.length), nextCursor: response.data.nextCursor }, source: source(response.source) };
  }

  async createAvailability(input: CreateCalendarAvailabilityInput): Promise<RepositoryResult<CalendarAvailability>> {
    const response = await apiClient.post<CalendarAvailability, CalendarAvailability>(availabilityPath, normalizeAvailability(input), { queueWhenOffline: true });
    return { data: response.data, source: source(response.source) };
  }

  async updateAvailability(id: EntityId, input: UpdateCalendarAvailabilityInput): Promise<RepositoryResult<CalendarAvailability>> {
    const response = await apiClient.patch<CalendarAvailability, UpdateCalendarAvailabilityInput & { updatedAt: string }>(`${availabilityPath}/${id}`, { ...input, updatedAt: now() }, { queueWhenOffline: true });
    return { data: response.data, source: source(response.source) };
  }

  async archiveAvailability(id: EntityId): Promise<RepositoryResult<CalendarAvailability>> {
    return this.updateAvailability(id, { status: "archived", deletedAt: now() });
  }
}

export const calendarRepository = new CalendarRepository();
