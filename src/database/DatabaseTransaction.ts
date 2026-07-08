import type { EntityId } from "../types/domain";

export interface DatabaseMutation<TRecord = unknown> {
  collection: string;
  operation: "create" | "update" | "delete";
  id?: EntityId;
  value?: Partial<TRecord>;
}

export interface DatabaseTransaction {
  get<TRecord>(collection: string, id: EntityId): Promise<TRecord | null>;
  query<TRecord>(collection: string, filters?: Record<string, unknown>): Promise<TRecord[]>;
  create<TRecord>(collection: string, value: TRecord): Promise<TRecord>;
  update<TRecord>(collection: string, id: EntityId, value: Partial<TRecord>): Promise<TRecord>;
  delete(collection: string, id: EntityId): Promise<void>;
  commit(): Promise<void>;
  rollback(reason?: unknown): Promise<void>;
  mutations(): DatabaseMutation[];
}
