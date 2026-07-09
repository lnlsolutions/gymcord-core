import { apiClient } from "../api/client";
import type { ListResult, QueryOptions, RepositoryResult } from "./base";
import type { EntityId, Program } from "../types/domain";

export type CreateProgramInput = Omit<Program, "id" | "createdAt" | "updatedAt"> & Partial<Pick<Program, "id" | "createdAt" | "updatedAt">>;
export type UpdateProgramInput = Partial<Omit<Program, "id" | "createdAt" | "updatedAt">>;

const programPath = "/programs";
const now = () => new Date().toISOString();

function source(source: string): RepositoryResult<Program>["source"] {
  return source === "mock" || source === "cache" ? source : "remote";
}

function normalizeProgram(input: CreateProgramInput): Program {
  const timestamp = now();
  return {
    id: input.id ?? crypto.randomUUID(),
    organizationId: input.organizationId,
    trainerId: input.trainerId,
    assignedMemberIds: input.assignedMemberIds ?? [],
    title: input.title,
    description: input.description ?? "",
    status: input.status ?? "draft",
    weeks: input.weeks ?? [],
    publishedAt: input.publishedAt,
    createdAt: input.createdAt ?? timestamp,
    updatedAt: input.updatedAt ?? timestamp,
  };
}

export class ProgramRepository {
  async findById(id: EntityId): Promise<RepositoryResult<Program | null>> {
    const response = await apiClient.get<Program | null>(`${programPath}/${id}`);
    return { data: response.data, source: source(response.source) };
  }

  async list(options?: QueryOptions): Promise<RepositoryResult<ListResult<Program>>> {
    const response = await apiClient.get<ListResult<Program>>(programPath, { headers: options?.organizationId ? { "x-organization-id": options.organizationId } : undefined });
    const items = response.data.items ?? [];
    const filteredItems = options?.organizationId ? items.filter((program) => program.organizationId === options.organizationId) : items;
    return { data: { items: filteredItems.slice(0, options?.limit ?? filteredItems.length), nextCursor: response.data.nextCursor }, source: source(response.source) };
  }

  async create(input: CreateProgramInput): Promise<RepositoryResult<Program>> {
    const program = normalizeProgram(input);
    const response = await apiClient.post<Program, Program>(programPath, program, { queueWhenOffline: true });
    return { data: response.data, source: source(response.source) };
  }

  async update(id: EntityId, input: UpdateProgramInput): Promise<RepositoryResult<Program>> {
    const response = await apiClient.patch<Program, UpdateProgramInput & { updatedAt: string }>(`${programPath}/${id}`, { ...input, updatedAt: now() }, { queueWhenOffline: true });
    return { data: response.data, source: source(response.source) };
  }

  async delete(id: EntityId): Promise<void> {
    await apiClient.delete(`${programPath}/${id}`, { queueWhenOffline: true });
  }

  async duplicate(id: EntityId): Promise<RepositoryResult<Program>> {
    const existing = await this.findById(id);
    if (!existing.data) throw new Error(`Program ${id} was not found.`);
    return this.create({ ...existing.data, id: crypto.randomUUID(), title: `${existing.data.title} Copy`, status: "draft", publishedAt: undefined });
  }

  async assign(id: EntityId, memberIds: EntityId[]): Promise<RepositoryResult<Program>> {
    return this.update(id, { assignedMemberIds: memberIds });
  }

  async publish(id: EntityId): Promise<RepositoryResult<Program>> {
    return this.update(id, { status: "published", publishedAt: now() });
  }

  async saveDraft(id: EntityId, input: UpdateProgramInput): Promise<RepositoryResult<Program>> {
    return this.update(id, { ...input, status: "draft", publishedAt: undefined });
  }
}

export const programRepository = new ProgramRepository();
