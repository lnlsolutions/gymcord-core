import { apiClient } from "../api/client";
import type { ListResult, QueryOptions, RepositoryResult } from "./base";
import type { EntityId, Trainer } from "../types/domain";

export type CreateTrainerInput = Omit<Trainer, "id" | "createdAt" | "updatedAt"> & Partial<Pick<Trainer, "id" | "createdAt" | "updatedAt">>;
export type UpdateTrainerInput = Partial<Omit<Trainer, "id" | "createdAt" | "updatedAt">>;

const trainerPath = "/trainerProfiles";

const now = () => new Date().toISOString();

function toRepositorySource(source: string): RepositoryResult<Trainer>["source"] {
  return source === "mock" || source === "cache" ? source : "remote";
}

function normalizeTrainer(input: Partial<Trainer> & Pick<Trainer, "userId">): Trainer {
  const timestamp = now();
  return {
    id: input.id ?? crypto.randomUUID(),
    userId: input.userId,
    organizationIds: input.organizationIds ?? [],
    specialties: input.specialties ?? [],
    bio: input.bio,
    createdAt: input.createdAt ?? timestamp,
    updatedAt: input.updatedAt ?? timestamp,
  };
}

export class TrainerRepository {
  async findById(id: EntityId): Promise<RepositoryResult<Trainer | null>> {
    const response = await apiClient.get<Trainer | null>(`${trainerPath}/${id}`);
    return { data: response.data, source: toRepositorySource(response.source) };
  }

  async list(options?: QueryOptions): Promise<RepositoryResult<ListResult<Trainer>>> {
    const response = await apiClient.get<ListResult<Trainer>>(trainerPath, { headers: options?.organizationId ? { "x-organization-id": options.organizationId } : undefined });
    const items = response.data.items ?? [];
    const filteredItems = options?.organizationId ? items.filter((trainer) => trainer.organizationIds.includes(options.organizationId as EntityId)) : items;
    return { data: { items: filteredItems.slice(0, options?.limit ?? filteredItems.length), nextCursor: response.data.nextCursor }, source: toRepositorySource(response.source) };
  }

  async listByOrganization(organizationId: EntityId): Promise<RepositoryResult<Trainer[]>> {
    const result = await this.list({ organizationId });
    return { data: result.data.items, source: result.source };
  }

  async create(input: CreateTrainerInput): Promise<RepositoryResult<Trainer>> {
    const trainer = normalizeTrainer(input);
    const response = await apiClient.post<Trainer, Trainer>(trainerPath, trainer, { queueWhenOffline: true });
    return { data: response.data, source: toRepositorySource(response.source) };
  }

  async update(id: EntityId, input: UpdateTrainerInput): Promise<RepositoryResult<Trainer>> {
    const response = await apiClient.patch<Trainer, UpdateTrainerInput & { updatedAt: string }>(`${trainerPath}/${id}`, { ...input, updatedAt: now() }, { queueWhenOffline: true });
    return { data: response.data, source: toRepositorySource(response.source) };
  }

  async delete(id: EntityId): Promise<void> {
    await apiClient.delete(`${trainerPath}/${id}`, { queueWhenOffline: true });
  }
}

export const trainerRepository = new TrainerRepository();
