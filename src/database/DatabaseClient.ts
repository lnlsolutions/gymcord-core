import type { EntityId } from "../types/domain";
import type { DatabaseTransaction } from "./DatabaseTransaction";

export interface DatabaseQuery<TRecord = unknown> {
  collection: string;
  filters?: Record<string, unknown>;
  orderBy?: keyof TRecord & string;
  direction?: "asc" | "desc";
  limit?: number;
  cursor?: string;
}

export interface DatabaseClient {
  get<TRecord>(collection: string, id: EntityId): Promise<TRecord | null>;
  query<TRecord>(query: DatabaseQuery<TRecord>): Promise<TRecord[]>;
  create<TRecord>(collection: string, value: TRecord): Promise<TRecord>;
  update<TRecord>(collection: string, id: EntityId, value: Partial<TRecord>): Promise<TRecord>;
  delete(collection: string, id: EntityId): Promise<void>;
  transaction<T>(work: (transaction: DatabaseTransaction) => Promise<T>): Promise<T>;
}
