import { apiClient } from "../api/client";
import type { ListResult, QueryOptions, RepositoryResult } from "./base";
import type { EntityId, Exercise } from "../types/domain";

export type CreateExerciseInput = Omit<Exercise, "id" | "createdAt" | "updatedAt" | "status"> & Partial<Pick<Exercise, "id" | "createdAt" | "updatedAt" | "status">>;
export type UpdateExerciseInput = Partial<Omit<Exercise, "id" | "createdAt" | "updatedAt">>;

const exercisePath = "/exercises";
const now = () => new Date().toISOString();

function source(source: string): RepositoryResult<Exercise>["source"] {
  return source === "mock" || source === "cache" ? source : "remote";
}

function normalizeExercise(input: CreateExerciseInput): Exercise {
  const timestamp = now();
  return {
    id: input.id ?? crypto.randomUUID(),
    organizationId: input.organizationId,
    trainerId: input.trainerId,
    name: input.name,
    description: input.description ?? "",
    category: input.category ?? "strength",
    muscleGroups: input.muscleGroups ?? [],
    equipment: input.equipment ?? [],
    instructions: input.instructions ?? [],
    mediaUrl: input.mediaUrl,
    status: input.status ?? "active",
    createdAt: input.createdAt ?? timestamp,
    updatedAt: input.updatedAt ?? timestamp,
  };
}

export class ExerciseRepository {
  async findById(id: EntityId): Promise<RepositoryResult<Exercise | null>> {
    const response = await apiClient.get<Exercise | null>(`${exercisePath}/${id}`);
    return { data: response.data, source: source(response.source) };
  }

  async list(options?: QueryOptions): Promise<RepositoryResult<ListResult<Exercise>>> {
    const response = await apiClient.get<ListResult<Exercise>>(exercisePath, { headers: options?.organizationId ? { "x-organization-id": options.organizationId } : undefined });
    const items = response.data.items ?? [];
    const filteredItems = options?.organizationId ? items.filter((exercise) => exercise.organizationId === options.organizationId) : items;
    const activeItems = filteredItems.filter((exercise) => exercise.status !== "archived");
    return { data: { items: activeItems.slice(0, options?.limit ?? activeItems.length), nextCursor: response.data.nextCursor }, source: source(response.source) };
  }

  async create(input: CreateExerciseInput): Promise<RepositoryResult<Exercise>> {
    const exercise = normalizeExercise(input);
    const response = await apiClient.post<Exercise, Exercise>(exercisePath, exercise, { queueWhenOffline: true });
    return { data: response.data, source: source(response.source) };
  }

  async update(id: EntityId, input: UpdateExerciseInput): Promise<RepositoryResult<Exercise>> {
    const response = await apiClient.patch<Exercise, UpdateExerciseInput & { updatedAt: string }>(`${exercisePath}/${id}`, { ...input, updatedAt: now() }, { queueWhenOffline: true });
    return { data: response.data, source: source(response.source) };
  }

  async archive(id: EntityId): Promise<RepositoryResult<Exercise>> {
    return this.update(id, { status: "archived", deletedAt: now() });
  }

  async delete(id: EntityId): Promise<RepositoryResult<Exercise>> {
    return this.archive(id);
  }
}

export const exerciseRepository = new ExerciseRepository();
