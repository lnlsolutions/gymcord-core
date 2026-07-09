import { apiClient } from "../api/client";
import { offlineEngine } from "../services/sync";
import type { EntityId, TrainerMember } from "../types/domain";
import type { ListResult, QueryOptions, RepositoryResult } from "./base";

const memberPath = "/trainerMembers";
const now = () => new Date().toISOString();
const source = (value: string): RepositoryResult<TrainerMember>["source"] => value === "mock" || value === "cache" ? value : "remote";

export type CreateMemberInput = Omit<TrainerMember, "id" | "createdAt" | "updatedAt"> & Partial<Pick<TrainerMember, "id" | "createdAt" | "updatedAt">>;
export type UpdateMemberInput = Partial<Omit<TrainerMember, "id" | "createdAt" | "updatedAt">>;

const demoMembers: TrainerMember[] = [
  { id: "member_ava", userId: "user_ava", organizationId: "org_demo", trainerId: "trainer_demo", name: "Ava Brooks", goal: "Build strength", status: "active", currentProgramId: "program_strength_01", workoutCompliance: 92, nutritionCompliance: 84, progressScore: 88, lastCheckInAt: new Date().toISOString(), createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: "member_miles", userId: "user_miles", organizationId: "org_demo", trainerId: "trainer_demo", name: "Miles Chen", goal: "Improve consistency", status: "needs_attention", currentProgramId: "program_habit_01", workoutCompliance: 61, nutritionCompliance: 58, progressScore: 64, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: "member_noor", userId: "user_noor", organizationId: "org_demo", trainerId: "trainer_demo", name: "Noor Patel", goal: "Nutrition reset", status: "active", currentProgramId: "program_nutrition_01", workoutCompliance: 78, nutritionCompliance: 91, progressScore: 82, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
];

function normalize(input: CreateMemberInput): TrainerMember {
  const timestamp = now();
  return { ...input, id: input.id ?? crypto.randomUUID(), createdAt: input.createdAt ?? timestamp, updatedAt: input.updatedAt ?? timestamp };
}

export class MemberRepository {
  private optimistic = new Map<EntityId, TrainerMember>();

  async findById(id: EntityId): Promise<RepositoryResult<TrainerMember | null>> {
    if (this.optimistic.has(id)) return { data: this.optimistic.get(id) ?? null, source: "cache" };
    const response = await apiClient.get<TrainerMember | null>(`${memberPath}/${id}`);
    return { data: response.data ?? demoMembers.find((member) => member.id === id) ?? null, source: source(response.source) };
  }

  async list(options?: QueryOptions & { trainerId?: EntityId }): Promise<RepositoryResult<ListResult<TrainerMember>>> {
    try {
      const response = await apiClient.get<ListResult<TrainerMember>>(memberPath, { headers: options?.organizationId ? { "x-organization-id": options.organizationId } : undefined });
      const remote = response.data.items?.length ? response.data.items : demoMembers;
      const merged = remote.map((member) => this.optimistic.get(member.id) ?? member);
      const extra = [...this.optimistic.values()].filter((member) => !merged.some((item) => item.id === member.id));
      const filtered = [...merged, ...extra].filter((member) => (!options?.organizationId || member.organizationId === options.organizationId) && (!options?.trainerId || member.trainerId === options.trainerId));
      return { data: { items: filtered.slice(0, options?.limit ?? filtered.length), nextCursor: response.data.nextCursor }, source: source(response.source) };
    } catch {
      const filtered = demoMembers.filter((member) => (!options?.organizationId || member.organizationId === options.organizationId) && (!options?.trainerId || member.trainerId === options.trainerId));
      return { data: { items: filtered }, source: "mock" };
    }
  }

  async create(input: CreateMemberInput): Promise<RepositoryResult<TrainerMember>> {
    const member = normalize(input);
    this.optimistic.set(member.id, member);
    const response = await apiClient.post<TrainerMember, TrainerMember>(memberPath, member, { queueWhenOffline: true });
    return { data: response.data ?? member, source: source(response.source) };
  }

  async update(id: EntityId, input: UpdateMemberInput): Promise<RepositoryResult<TrainerMember>> {
    const current = this.optimistic.get(id) ?? demoMembers.find((member) => member.id === id);
    const optimistic = { ...current, ...input, id, updatedAt: now() } as TrainerMember;
    this.optimistic.set(id, optimistic);
    const response = await apiClient.patch<TrainerMember, UpdateMemberInput & { updatedAt: string }>(`${memberPath}/${id}`, { ...input, updatedAt: optimistic.updatedAt }, { queueWhenOffline: true });
    return { data: response.data ?? optimistic, source: source(response.source) };
  }

  async delete(id: EntityId): Promise<void> {
    this.optimistic.delete(id);
    await apiClient.delete(`${memberPath}/${id}`, { queueWhenOffline: true });
  }

  getPendingSyncCount() { return offlineEngine.getQueue().filter((write) => write.entity.includes("trainer")).length; }
  getOfflineQueue() { return offlineEngine.getQueue().filter((write) => write.entity.includes("trainer")); }
}

export const memberRepository = new MemberRepository();
