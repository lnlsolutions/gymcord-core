import { apiClient } from "../api/client";
import { offlineEngine } from "../services/sync";
import type { ListResult, QueryOptions, RepositoryResult } from "./base";
import type { EntityId, Exercise, ExerciseDifficulty } from "../types/domain";

export interface ExerciseFiltersInput extends QueryOptions {
  search?: string;
  muscleGroup?: string;
  equipment?: string;
  difficulty?: ExerciseDifficulty | "all";
  includeArchived?: boolean;
}

export type CreateExerciseInput = Omit<Exercise, "id" | "createdAt" | "updatedAt"> & Partial<Pick<Exercise, "id" | "createdAt" | "updatedAt">>;
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
    name: input.name.trim(),
    description: input.description ?? "",
    muscleGroups: input.muscleGroups ?? [],
    equipment: input.equipment ?? [],
    difficulty: input.difficulty ?? "beginner",
    media: input.media ?? [],
    coachingCues: input.coachingCues ?? [],
    movementStandards: input.movementStandards ?? [],
    safetyNotes: input.safetyNotes ?? [],
    tags: input.tags ?? [],
    status: input.status ?? "active",
    programBuilder: input.programBuilder ?? { defaultSets: 3, defaultReps: "8-12", defaultRestSeconds: 60, tempo: "controlled" },
    createdAt: input.createdAt ?? timestamp,
    updatedAt: input.updatedAt ?? timestamp,
    deletedAt: input.deletedAt,
  };
}

function matchesFilter(exercise: Exercise, filters?: ExerciseFiltersInput) {
  if (!filters?.includeArchived && exercise.status === "archived") return false;
  if (filters?.organizationId && exercise.organizationId && exercise.organizationId !== filters.organizationId) return false;
  const search = filters?.search?.trim().toLowerCase();
  if (search) {
    const haystack = [exercise.name, exercise.description, ...exercise.tags, ...exercise.muscleGroups, ...exercise.equipment].join(" ").toLowerCase();
    if (!haystack.includes(search)) return false;
  }
  if (filters?.muscleGroup && filters.muscleGroup !== "all" && !exercise.muscleGroups.includes(filters.muscleGroup)) return false;
  if (filters?.equipment && filters.equipment !== "all" && !exercise.equipment.includes(filters.equipment)) return false;
  if (filters?.difficulty && filters.difficulty !== "all" && exercise.difficulty !== filters.difficulty) return false;
  return true;
}

export class ExerciseRepository {
  getOfflineQueue() { return offlineEngine.getQueue().filter((item) => item.entity.startsWith(exercisePath)); }

  async findById(id: EntityId): Promise<RepositoryResult<Exercise | null>> {
    const response = await apiClient.get<Exercise | null>(`${exercisePath}/${id}`);
    return { data: response.data, source: source(response.source) };
  }

  async list(options?: ExerciseFiltersInput): Promise<RepositoryResult<ListResult<Exercise>>> {
    const response = await apiClient.get<ListResult<Exercise>>(exercisePath, { headers: options?.organizationId ? { "x-organization-id": options.organizationId } : undefined });
    const items = (response.data.items ?? []).filter((exercise) => matchesFilter(exercise, options));
    return { data: { items: items.slice(0, options?.limit ?? items.length), nextCursor: response.data.nextCursor }, source: source(response.source) };
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

  async delete(id: EntityId, hardDelete = false): Promise<void | RepositoryResult<Exercise>> {
    if (!hardDelete) return this.archive(id);
    await apiClient.delete(`${exercisePath}/${id}`, { queueWhenOffline: true });
  }
}

export const exerciseRepository = new ExerciseRepository();
