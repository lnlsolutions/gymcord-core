import { apiClient } from "../api/client";
import { offlineEngine, type QueuedWrite } from "../services/sync";
import type { CheckIn, CheckInAtlasInsightMetadata, CheckInFollowUpTask, CheckInRiskFlag, CheckInStatus, EntityId } from "../types/domain";
import type { ListResult, QueryOptions, RepositoryResult } from "./base";

export type CreateCheckInInput = Omit<CheckIn, "id" | "createdAt" | "updatedAt" | "status" | "riskFlags" | "followUpTasks"> & Partial<Pick<CheckIn, "id" | "createdAt" | "updatedAt" | "status" | "riskFlags" | "followUpTasks">>;
export type UpdateCheckInInput = Partial<Omit<CheckIn, "id" | "createdAt">>;
export interface ReviewCheckInInput { trainerId?: EntityId; response?: string; atlasInsight?: CheckInAtlasInsightMetadata; riskFlags?: CheckInRiskFlag[]; followUpTasks?: CheckInFollowUpTask[]; }

const checkInsPath = "/checkIns";
const now = () => new Date().toISOString();
function source(sourceName: string): RepositoryResult<unknown>["source"] { return sourceName === "mock" || sourceName === "cache" ? sourceName : "remote"; }

function normalize(input: CreateCheckInInput): CheckIn {
  const timestamp = now();
  return {
    id: input.id ?? crypto.randomUUID(),
    organizationId: input.organizationId,
    memberId: input.memberId,
    trainerId: input.trainerId,
    title: input.title,
    prompt: input.prompt,
    response: input.response,
    status: input.status ?? "draft",
    submittedAt: input.submittedAt,
    reviewedAt: input.reviewedAt,
    archivedAt: input.archivedAt,
    moodScore: input.moodScore,
    energyScore: input.energyScore,
    riskFlags: input.riskFlags ?? [],
    atlasInsight: input.atlasInsight,
    followUpTasks: input.followUpTasks ?? [],
    sourceModule: input.sourceModule,
    calendarEventId: input.calendarEventId,
    notificationIds: input.notificationIds ?? [],
    createdAt: input.createdAt ?? timestamp,
    updatedAt: input.updatedAt ?? timestamp,
  };
}

export class CheckInRepository {
  getOfflineQueue(): QueuedWrite[] { return offlineEngine.getQueue().filter((item) => item.entity === checkInsPath || item.entity.startsWith(`${checkInsPath}/`)); }

  async list(options?: QueryOptions & { memberId?: EntityId; trainerId?: EntityId; status?: CheckInStatus }): Promise<RepositoryResult<ListResult<CheckIn>>> {
    const response = await apiClient.get<ListResult<CheckIn>>(checkInsPath, { headers: options?.organizationId ? { "x-organization-id": options.organizationId } : undefined });
    const items = response.data.items ?? [];
    const filtered = items.filter((item) => (!options?.organizationId || item.organizationId === options.organizationId) && (!options?.memberId || item.memberId === options.memberId) && (!options?.trainerId || item.trainerId === options.trainerId) && (!options?.status || item.status === options.status) && item.status !== "archived" && !item.deletedAt);
    return { data: { items: filtered.slice(0, options?.limit ?? filtered.length), nextCursor: response.data.nextCursor }, source: source(response.source) };
  }

  async findById(id: EntityId): Promise<RepositoryResult<CheckIn | null>> { const response = await apiClient.get<CheckIn | null>(`${checkInsPath}/${id}`); return { data: response.data, source: source(response.source) }; }
  async create(input: CreateCheckInInput): Promise<RepositoryResult<CheckIn>> { const response = await apiClient.post<CheckIn, CheckIn>(checkInsPath, normalize(input), { queueWhenOffline: true }); return { data: response.data, source: source(response.source) }; }
  async update(id: EntityId, input: UpdateCheckInInput): Promise<RepositoryResult<CheckIn>> { const response = await apiClient.patch<CheckIn, UpdateCheckInInput & { updatedAt: string }>(`${checkInsPath}/${id}`, { ...input, updatedAt: now() }, { queueWhenOffline: true }); return { data: response.data, source: source(response.source) }; }
  async submit(id: EntityId): Promise<RepositoryResult<CheckIn>> { const timestamp = now(); return this.update(id, { status: "submitted", submittedAt: timestamp, updatedAt: timestamp }); }
  async review(id: EntityId, input: ReviewCheckInInput): Promise<RepositoryResult<CheckIn>> { const timestamp = now(); return this.update(id, { ...input, status: "reviewed", reviewedAt: timestamp, updatedAt: timestamp }); }
  async archive(id: EntityId): Promise<RepositoryResult<CheckIn>> { const timestamp = now(); return this.update(id, { status: "archived", archivedAt: timestamp, deletedAt: timestamp, updatedAt: timestamp }); }
  async delete(id: EntityId): Promise<RepositoryResult<CheckIn>> { return this.archive(id); }

  seedSamples(memberId: EntityId, organizationId?: EntityId, trainerId?: EntityId): CheckIn[] {
    const timestamp = now();
    return [
      { id: "sample-check-in-ready", organizationId, memberId, trainerId, title: "Weekly readiness", prompt: "How are energy, soreness, and schedule looking this week?", response: "Energy is solid, but my left knee is sore after squats.", status: "submitted", submittedAt: timestamp, moodScore: 4, energyScore: 3, riskFlags: ["pain", "needs_follow_up"], atlasInsight: { summary: "Member reports knee soreness; recommend trainer follow-up and modified lower-body volume.", confidenceScore: 0.88, recommendedActions: ["Trainer review", "Adjust next leg session", "Schedule follow-up"], generatedAt: timestamp }, followUpTasks: [{ id: "sample-follow-up-knee", title: "Review knee soreness before next lower-body day", ownerRole: "trainer", dueAt: timestamp }], sourceModule: "atlas_coach", notificationIds: ["sample-check-in-notification"], createdAt: timestamp, updatedAt: timestamp },
      { id: "sample-check-in-calendar", organizationId, memberId, trainerId, title: "Trainer portal check-in", prompt: "Confirm progress blockers before tomorrow's appointment.", response: "Meal prep slipped twice, but workouts are complete.", status: "reviewed", submittedAt: timestamp, reviewedAt: timestamp, moodScore: 3, energyScore: 4, riskFlags: ["nutrition_gap"], atlasInsight: { summary: "Nutrition consistency needs attention while training adherence is strong.", confidenceScore: 0.81, recommendedActions: ["Assign meal prep task", "Send reminder", "Discuss at appointment"], generatedAt: timestamp }, followUpTasks: [{ id: "sample-follow-up-meal-prep", title: "Send meal prep checklist", ownerRole: "atlas", completedAt: timestamp }], sourceModule: "calendar", calendarEventId: "sample-calendar-reminder", createdAt: timestamp, updatedAt: timestamp },
    ];
  }
}

export const checkInRepository = new CheckInRepository();
