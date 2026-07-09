import { apiClient } from "../api/client";
import type { ListResult, QueryOptions, RepositoryResult } from "./base";
import type { EntityId, MemberProfile } from "../types/domain";

export type CreateMemberInput = Omit<MemberProfile, "id" | "createdAt" | "updatedAt"> & Partial<Pick<MemberProfile, "id" | "createdAt" | "updatedAt">>;
export type UpdateMemberInput = Partial<Omit<MemberProfile, "id" | "createdAt" | "updatedAt">>;

const memberPath = "/memberProfiles";
const now = () => new Date().toISOString();

function toRepositorySource(source: string): RepositoryResult<MemberProfile>["source"] {
  return source === "mock" || source === "cache" ? source : "remote";
}

function normalizeMember(input: Partial<MemberProfile> & Pick<MemberProfile, "userId">): MemberProfile {
  const timestamp = now();
  return {
    id: input.id ?? crypto.randomUUID(),
    userId: input.userId,
    organizationId: input.organizationId,
    trainerId: input.trainerId,
    goals: input.goals ?? [],
    status: input.status ?? "active",
    createdAt: input.createdAt ?? timestamp,
    updatedAt: input.updatedAt ?? timestamp,
  };
}

export class MemberRepository {
  async findById(id: EntityId): Promise<RepositoryResult<MemberProfile | null>> {
    const response = await apiClient.get<MemberProfile | null>(`${memberPath}/${id}`);
    return { data: response.data, source: toRepositorySource(response.source) };
  }

  async list(options?: QueryOptions): Promise<RepositoryResult<ListResult<MemberProfile>>> {
    const response = await apiClient.get<ListResult<MemberProfile>>(memberPath, { headers: options?.organizationId ? { "x-organization-id": options.organizationId } : undefined });
    const items = response.data.items ?? [];
    const filteredItems = options?.organizationId ? items.filter((member) => member.organizationId === options.organizationId) : items;
    return { data: { items: filteredItems.slice(0, options?.limit ?? filteredItems.length), nextCursor: response.data.nextCursor }, source: toRepositorySource(response.source) };
  }

  async listByTrainer(trainerId: EntityId): Promise<RepositoryResult<MemberProfile[]>> {
    const result = await this.list();
    return { data: result.data.items.filter((member) => member.trainerId === trainerId), source: result.source };
  }

  async create(input: CreateMemberInput): Promise<RepositoryResult<MemberProfile>> {
    const member = normalizeMember(input);
    const response = await apiClient.post<MemberProfile, MemberProfile>(memberPath, member, { queueWhenOffline: true });
    return { data: response.data, source: toRepositorySource(response.source) };
  }

  async update(id: EntityId, input: UpdateMemberInput): Promise<RepositoryResult<MemberProfile>> {
    const response = await apiClient.patch<MemberProfile, UpdateMemberInput & { updatedAt: string }>(`${memberPath}/${id}`, { ...input, updatedAt: now() }, { queueWhenOffline: true });
    return { data: response.data, source: toRepositorySource(response.source) };
  }

  async delete(id: EntityId): Promise<void> {
    await apiClient.delete(`${memberPath}/${id}`, { queueWhenOffline: true });
  }
}

export const memberRepository = new MemberRepository();
