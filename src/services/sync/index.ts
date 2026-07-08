import { appConfig } from "../../config";
import { keyValueStorage } from "../storage";

export type QueuedWriteStatus = "queued" | "syncing" | "synced" | "conflict" | "failed";
export type ConflictStrategy = "client_wins" | "server_wins" | "manual_review";

export interface QueuedWrite<TPayload = unknown> {
  id: string;
  entity: string;
  operation: "create" | "update" | "delete";
  payload: TPayload;
  status: QueuedWriteStatus;
  attempts: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConflictResolution<TPayload = unknown> {
  strategy: ConflictStrategy;
  local: QueuedWrite<TPayload>;
  remote?: TPayload;
  resolvedPayload?: TPayload;
}

export interface OfflineEngine {
  queueWrite<TPayload>(write: Omit<QueuedWrite<TPayload>, "id" | "status" | "attempts" | "createdAt" | "updatedAt">): QueuedWrite<TPayload>;
  getQueue(): QueuedWrite[];
  sync(): Promise<QueuedWrite[]>;
  resolveConflict<TPayload>(resolution: ConflictResolution<TPayload>): Promise<QueuedWrite<TPayload>>;
}

export class MockOfflineEngine implements OfflineEngine {
  private storageKey = appConfig.storageKeys.offlineQueue;

  queueWrite<TPayload>(write: Omit<QueuedWrite<TPayload>, "id" | "status" | "attempts" | "createdAt" | "updatedAt">): QueuedWrite<TPayload> {
    const now = new Date().toISOString();
    const queuedWrite: QueuedWrite<TPayload> = {
      ...write,
      id: crypto.randomUUID(),
      status: "queued",
      attempts: 0,
      createdAt: now,
      updatedAt: now,
    };

    this.persist([...this.getQueue(), queuedWrite]);
    return queuedWrite;
  }

  getQueue(): QueuedWrite[] {
    return keyValueStorage.get<QueuedWrite[]>(this.storageKey, []);
  }

  async sync(): Promise<QueuedWrite[]> {
    const synced = this.getQueue().map((write) => ({
      ...write,
      status: "synced" as const,
      attempts: write.attempts + 1,
      updatedAt: new Date().toISOString(),
    }));

    this.persist(synced);
    return synced;
  }

  async resolveConflict<TPayload>(resolution: ConflictResolution<TPayload>): Promise<QueuedWrite<TPayload>> {
    const resolved: QueuedWrite<TPayload> = {
      ...resolution.local,
      payload: resolution.resolvedPayload ?? resolution.local.payload,
      status: "queued",
      updatedAt: new Date().toISOString(),
    };

    this.persist(this.getQueue().map((write) => (write.id === resolved.id ? resolved : write)));
    return resolved;
  }

  private persist(queue: QueuedWrite[]) {
    keyValueStorage.set(this.storageKey, queue);
  }
}

export const offlineEngine: OfflineEngine = new MockOfflineEngine();
