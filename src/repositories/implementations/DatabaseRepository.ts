import { databaseCache } from "../../cache";
import { databaseConfig } from "../../config/database";
import type { DatabaseClient } from "../../database";
import { offlineEngine } from "../../services/sync";
import type { EntityId } from "../../types/domain";
import type { ListResult, QueryOptions, Repository, RepositoryResult } from "../base";

export class DatabaseRepository<TRecord extends { id: EntityId }, CreateInput = Partial<TRecord>, UpdateInput = Partial<TRecord>> implements Repository<TRecord, CreateInput, UpdateInput> {
  constructor(protected readonly collection: string, protected readonly client: DatabaseClient) {}

  async findById(id: EntityId): Promise<RepositoryResult<TRecord | null>> {
    const key = this.cacheKey(id);
    const cached = databaseCache.get<TRecord>(key);
    if (cached) return { data: cached, source: "cache" };
    const data = await this.client.get<TRecord>(this.collection, id);
    if (data) databaseCache.set(key, data, { ttlMs: databaseConfig.defaultTtlMs, tags: [this.collection, id] });
    return { data, source: "remote" };
  }

  async list(options: QueryOptions = {}): Promise<RepositoryResult<ListResult<TRecord>>> {
    const items = await this.client.query<TRecord>({ collection: this.collection, filters: options.organizationId ? { organizationId: options.organizationId } : undefined, limit: options.limit, cursor: options.cursor });
    return { data: { items }, source: "remote" };
  }

  async create(input: CreateInput): Promise<RepositoryResult<TRecord>> {
    if (!navigator.onLine && databaseConfig.enableOfflineQueue) offlineEngine.queueWrite({ entity: this.collection, operation: "create", payload: input });
    const data = await this.client.create<TRecord>(this.collection, input as unknown as TRecord);
    this.writeCache(data);
    return { data, source: "remote" };
  }

  async update(id: EntityId, input: UpdateInput): Promise<RepositoryResult<TRecord>> {
    databaseCache.optimisticUpdate<TRecord>(this.cacheKey(id), (current) => ({ ...(current ?? { id } as TRecord), ...(input as Partial<TRecord>) }), { tags: [this.collection, id] });
    if (!navigator.onLine && databaseConfig.enableOfflineQueue) offlineEngine.queueWrite({ entity: this.collection, operation: "update", payload: { id, input } });
    const data = await this.client.update<TRecord>(this.collection, id, input as Partial<TRecord>);
    this.writeCache(data);
    return { data, source: "remote" };
  }

  async delete(id: EntityId): Promise<void> {
    databaseCache.invalidate(this.cacheKey(id));
    databaseCache.invalidateTag(this.collection);
    if (!navigator.onLine && databaseConfig.enableOfflineQueue) offlineEngine.queueWrite({ entity: this.collection, operation: "delete", payload: { id } });
    await this.client.delete(this.collection, id);
  }

  protected cacheKey(id: EntityId) { return `${this.collection}:${id}`; }
  protected writeCache(record: TRecord) { databaseCache.set(this.cacheKey(record.id), record, { ttlMs: databaseConfig.defaultTtlMs, tags: [this.collection, record.id] }); databaseCache.invalidateTag(`${this.collection}:list`); }
}
