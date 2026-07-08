import { keyValueStorage } from "../services/storage";

export interface CacheEntry<TValue> {
  key: string;
  value: TValue;
  createdAt: number;
  expiresAt?: number;
  tags: string[];
  optimistic: boolean;
}

export interface CacheSetOptions {
  ttlMs?: number;
  tags?: string[];
  optimistic?: boolean;
}

export interface CacheLayer {
  get<TValue>(key: string): TValue | null;
  set<TValue>(key: string, value: TValue, options?: CacheSetOptions): void;
  invalidate(key: string): void;
  invalidateTag(tag: string): void;
  optimisticUpdate<TValue>(key: string, updater: (current: TValue | null) => TValue, options?: CacheSetOptions): TValue;
  clearExpired(): void;
}

export class MemoryCache implements CacheLayer {
  private entries = new Map<string, CacheEntry<unknown>>();

  get<TValue>(key: string): TValue | null {
    const entry = this.entries.get(key);
    if (!entry) return null;
    if (entry.expiresAt && entry.expiresAt <= Date.now()) {
      this.entries.delete(key);
      return null;
    }
    return entry.value as TValue;
  }

  set<TValue>(key: string, value: TValue, options: CacheSetOptions = {}) {
    this.entries.set(key, {
      key,
      value,
      createdAt: Date.now(),
      expiresAt: options.ttlMs ? Date.now() + options.ttlMs : undefined,
      tags: options.tags ?? [],
      optimistic: options.optimistic ?? false,
    });
  }

  invalidate(key: string) { this.entries.delete(key); }

  invalidateTag(tag: string) {
    for (const [key, entry] of this.entries.entries()) {
      if (entry.tags.includes(tag)) this.entries.delete(key);
    }
  }

  optimisticUpdate<TValue>(key: string, updater: (current: TValue | null) => TValue, options: CacheSetOptions = {}) {
    const value = updater(this.get<TValue>(key));
    this.set(key, value, { ...options, optimistic: true });
    return value;
  }

  clearExpired() { for (const key of this.entries.keys()) this.get(key); }
}

export class PersistentCache implements CacheLayer {
  constructor(private readonly storageKey = "gc.database.cache", private readonly memory = new MemoryCache()) {}

  get<TValue>(key: string): TValue | null { this.hydrate(); return this.memory.get<TValue>(key); }
  set<TValue>(key: string, value: TValue, options?: CacheSetOptions) { this.memory.set(key, value, options); this.persist(); }
  invalidate(key: string) { this.memory.invalidate(key); this.persist(); }
  invalidateTag(tag: string) { this.memory.invalidateTag(tag); this.persist(); }
  optimisticUpdate<TValue>(key: string, updater: (current: TValue | null) => TValue, options?: CacheSetOptions) { const value = this.memory.optimisticUpdate(key, updater, options); this.persist(); return value; }
  clearExpired() { this.memory.clearExpired(); this.persist(); }

  private hydrate() {
    const entries = keyValueStorage.get<Array<CacheEntry<unknown>>>(this.storageKey, []);
    for (const entry of entries) this.memory.set(entry.key, entry.value, { ttlMs: entry.expiresAt ? Math.max(entry.expiresAt - Date.now(), 0) : undefined, tags: entry.tags, optimistic: entry.optimistic });
  }

  private persist() {
    const source = this.memory as unknown as { entries: Map<string, CacheEntry<unknown>> };
    keyValueStorage.set(this.storageKey, Array.from(source.entries.values()));
  }
}

export const databaseCache: CacheLayer = new PersistentCache();
