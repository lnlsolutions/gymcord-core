import type { EntityId } from "../../types/domain";

export interface DatabaseService {
  get<T>(collection: string, id: EntityId): Promise<T | null>;
  query<T>(collection: string, filters?: Record<string, unknown>): Promise<T[]>;
  create<T>(collection: string, value: T): Promise<T>;
  update<T>(collection: string, id: EntityId, value: Partial<T>): Promise<T>;
  delete(collection: string, id: EntityId): Promise<void>;
}
