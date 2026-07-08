import type { DatabaseProviderKind } from "../config/database";
import { offlineEngine } from "../services/sync";

export type DatabaseConnectionState = "connected" | "connecting" | "disconnected" | "degraded";
export type DatabaseProviderStatus = "healthy" | "degraded" | "offline" | "unknown";

export interface DatabaseHealthSnapshot {
  provider: DatabaseProviderKind;
  connectionState: DatabaseConnectionState;
  latencyMs: number | null;
  pendingSyncCount: number;
  providerStatus: DatabaseProviderStatus;
  checkedAt: string;
  message?: string;
}

export interface DatabaseHealthProbe {
  check(): Promise<DatabaseHealthSnapshot>;
}

export class DatabaseHealthMonitor {
  constructor(private readonly provider: DatabaseProviderKind, private readonly probe?: DatabaseHealthProbe) {}

  async snapshot(): Promise<DatabaseHealthSnapshot> {
    const startedAt = performance.now();
    try {
      const probed = await this.probe?.check();
      if (probed) return { ...probed, pendingSyncCount: offlineEngine.getQueue().filter((write) => write.status !== "synced").length };
      return {
        provider: this.provider,
        connectionState: navigator.onLine ? "connected" : "disconnected",
        latencyMs: Math.round(performance.now() - startedAt),
        pendingSyncCount: offlineEngine.getQueue().filter((write) => write.status !== "synced").length,
        providerStatus: navigator.onLine ? "healthy" : "offline",
        checkedAt: new Date().toISOString(),
      };
    } catch (error) {
      return {
        provider: this.provider,
        connectionState: "degraded",
        latencyMs: Math.round(performance.now() - startedAt),
        pendingSyncCount: offlineEngine.getQueue().filter((write) => write.status !== "synced").length,
        providerStatus: "degraded",
        checkedAt: new Date().toISOString(),
        message: error instanceof Error ? error.message : "Unknown database health failure",
      };
    }
  }
}
