import type { EntityId } from "../types/domain";

export interface QueryOptions {
  limit?: number;
  cursor?: string;
  organizationId?: EntityId;
}

export interface RepositoryResult<T> {
  data: T;
  source: "cache" | "remote" | "mock";
}

export interface ListResult<T> {
  items: T[];
  nextCursor?: string;
}

export interface Repository<T, CreateInput = Partial<T>, UpdateInput = Partial<T>> {
  findById(id: EntityId): Promise<RepositoryResult<T | null>>;
  list(options?: QueryOptions): Promise<RepositoryResult<ListResult<T>>>;
  create(input: CreateInput): Promise<RepositoryResult<T>>;
  update(id: EntityId, input: UpdateInput): Promise<RepositoryResult<T>>;
  delete(id: EntityId): Promise<void>;
}
