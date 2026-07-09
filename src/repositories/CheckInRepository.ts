import { apiClient } from "../api/client";
import { offlineEngine, type QueuedWrite } from "../services/sync";
import type { EntityId, IsoDateString, IsoDateTimeString } from "../types/domain";
import type { ListResult, QueryOptions, RepositoryResult } from "./base";

export type CheckInStatus = "draft" | "submitted" | "in_review" | "feedback_ready" | "action_required" | "completed" | "archived";
export type ComplianceLevel = "on_track" | "partial" | "off_track" | "unknown";
export type RiskLevel = "low" | "medium" | "high";

export interface CheckInMetric { score: number; notes?: string }
export interface ComplianceSnapshot { workout: ComplianceLevel; nutrition: ComplianceLevel; workoutPercent: number; nutritionPercent: number; notes?: string }
export interface AtlasInsightMetadata { id: EntityId; category: "training" | "nutrition" | "recovery" | "mindset" | "progress"; confidence: number; summary: string; generatedAt: IsoDateTimeString; source: "atlas_coach" | "trainer_review" | "rule_engine" }
export interface RiskFlagMetadata { id: EntityId; level: RiskLevel; category: "injury" | "burnout" | "nutrition" | "adherence" | "mood"; summary: string; requiresFollowUp: boolean; createdAt: IsoDateTimeString }
export interface FollowUpTaskMetadata { id: EntityId; title: string; ownerRole: "trainer" | "member" | "atlas" | "admin"; dueAt?: IsoDateTimeString; status: "open" | "scheduled" | "done" | "archived"; integrationTargets: Array<"notifications" | "calendar" | "trainer_portal" | "member_app"> }

export interface MemberCheckIn {
  id: EntityId; organizationId?: EntityId; memberId: EntityId; trainerId?: EntityId; weekOf: IsoDateString; status: CheckInStatus;
  mood: CheckInMetric; energy: CheckInMetric; soreness: CheckInMetric; goalReflection: string; coachFeedbackNotes?: string;
  compliance: ComplianceSnapshot; progressTrend: { direction: "up" | "flat" | "down"; summary: string; weightDelta?: number; measurementDelta?: number; photoComparison?: string };
  atlasInsights: AtlasInsightMetadata[]; riskFlags: RiskFlagMetadata[]; followUpTasks: FollowUpTaskMetadata[];
  notificationMetadata?: { reminderSentAt?: IsoDateTimeString; feedbackNotifiedAt?: IsoDateTimeString }; calendarMetadata?: { eventId?: EntityId; nextReviewAt?: IsoDateTimeString };
  createdAt: IsoDateTimeString; updatedAt: IsoDateTimeString; submittedAt?: IsoDateTimeString; reviewedAt?: IsoDateTimeString; deletedAt?: IsoDateTimeString;
}

export type CreateCheckInInput = Omit<MemberCheckIn, "id" | "createdAt" | "updatedAt" | "status"> & Partial<Pick<MemberCheckIn, "id" | "createdAt" | "updatedAt" | "status">>;
export type UpdateCheckInInput = Partial<Omit<MemberCheckIn, "id" | "createdAt">>;
const checkInsPath = "/checkIns";
const now = () => new Date().toISOString();
const source = (name: string): RepositoryResult<unknown>["source"] => name === "mock" || name === "cache" ? name : "remote";

function normalize(input: CreateCheckInInput): MemberCheckIn {
  const timestamp = now();
  return { ...input, id: input.id ?? crypto.randomUUID(), status: input.status ?? "draft", mood: input.mood ?? { score: 3 }, energy: input.energy ?? { score: 3 }, soreness: input.soreness ?? { score: 2 }, compliance: input.compliance ?? { workout: "unknown", nutrition: "unknown", workoutPercent: 0, nutritionPercent: 0 }, progressTrend: input.progressTrend ?? { direction: "flat", summary: "Awaiting trend data." }, atlasInsights: input.atlasInsights ?? [], riskFlags: input.riskFlags ?? [], followUpTasks: input.followUpTasks ?? [], createdAt: input.createdAt ?? timestamp, updatedAt: input.updatedAt ?? timestamp };
}

export class CheckInRepository {
  getOfflineQueue(): QueuedWrite[] { return offlineEngine.getQueue().filter((item) => item.entity === checkInsPath || item.entity.startsWith(`${checkInsPath}/`)); }
  async list(options?: QueryOptions & { memberId?: EntityId; trainerId?: EntityId; status?: CheckInStatus }): Promise<RepositoryResult<ListResult<MemberCheckIn>>> {
    const response = await apiClient.get<ListResult<MemberCheckIn>>(checkInsPath, { headers: options?.organizationId ? { "x-organization-id": options.organizationId } : undefined });
    const items = (response.data.items ?? []).filter((item) => !item.deletedAt && item.status !== "archived" && (!options?.organizationId || item.organizationId === options.organizationId) && (!options?.memberId || item.memberId === options.memberId) && (!options?.trainerId || item.trainerId === options.trainerId) && (!options?.status || item.status === options.status));
    return { data: { items: items.slice(0, options?.limit ?? items.length), nextCursor: response.data.nextCursor }, source: source(response.source) };
  }
  async findById(id: EntityId): Promise<RepositoryResult<MemberCheckIn | null>> { const response = await apiClient.get<MemberCheckIn | null>(`${checkInsPath}/${id}`); return { data: response.data, source: source(response.source) }; }
  async create(input: CreateCheckInInput): Promise<RepositoryResult<MemberCheckIn>> { const response = await apiClient.post<MemberCheckIn, MemberCheckIn>(checkInsPath, normalize(input), { queueWhenOffline: true }); return { data: response.data, source: source(response.source) }; }
  async update(id: EntityId, input: UpdateCheckInInput): Promise<RepositoryResult<MemberCheckIn>> { const response = await apiClient.patch<MemberCheckIn, UpdateCheckInInput>(`${checkInsPath}/${id}`, { ...input, updatedAt: now() }, { queueWhenOffline: true }); return { data: response.data, source: source(response.source) }; }
  async submit(id: EntityId): Promise<RepositoryResult<MemberCheckIn>> { return this.update(id, { status: "submitted", submittedAt: now() }); }
  async review(id: EntityId, input: Pick<UpdateCheckInInput, "coachFeedbackNotes" | "atlasInsights" | "riskFlags" | "followUpTasks">): Promise<RepositoryResult<MemberCheckIn>> { return this.update(id, { ...input, status: "feedback_ready", reviewedAt: now() }); }
  async archive(id: EntityId): Promise<RepositoryResult<MemberCheckIn>> { return this.update(id, { status: "archived", deletedAt: now() }); }
  async delete(id: EntityId): Promise<RepositoryResult<MemberCheckIn>> { return this.archive(id); }
  seedSamples(memberId: EntityId, organizationId?: EntityId, trainerId = "trainer-demo"): MemberCheckIn[] { const timestamp = now(); return [{ id: "sample-check-in-1", organizationId, memberId, trainerId, weekOf: timestamp.slice(0, 10), status: "submitted", mood: { score: 4, notes: "Positive" }, energy: { score: 3 }, soreness: { score: 2, notes: "Legs" }, goalReflection: "I hit three workouts and want better meal prep consistency.", compliance: { workout: "on_track", nutrition: "partial", workoutPercent: 86, nutritionPercent: 68, notes: "Training consistency is strong; protein slipped on travel days." }, progressTrend: { direction: "up", summary: "Strength and photos are trending positively." }, coachFeedbackNotes: "Keep the lifting cadence and add two planned lunches.", atlasInsights: [{ id: "insight-1", category: "recovery", confidence: 0.82, summary: "Soreness is manageable but sleep should be protected before lower-body sessions.", generatedAt: timestamp, source: "atlas_coach" }], riskFlags: [{ id: "risk-1", level: "medium", category: "nutrition", summary: "Nutrition adherence below target for two weeks.", requiresFollowUp: true, createdAt: timestamp }], followUpTasks: [{ id: "task-1", title: "Schedule nutrition habit review", ownerRole: "trainer", status: "open", integrationTargets: ["calendar", "notifications", "trainer_portal"] }], createdAt: timestamp, updatedAt: timestamp, submittedAt: timestamp }]; }
}
export const checkInRepository = new CheckInRepository();
