import { appConfig } from "../config";
import type { AuthSession } from "../auth/types";
import type { AtlasConversationEntry, AtlasMemory } from "../types/gymcord";
import { buildAtlasFoundationMetadata, buildMockAtlasPlans, type AtlasFoundationMetadata, type AtlasGeneratedPlans } from "../lib/engines/atlasProductionFoundation";
import { saved, save } from "../lib/storage";
import { AtlasStore } from "../lib/atlasStore";
import { offlineEngine, type QueuedWrite } from "../services/sync";
import type { BackendProvider } from "../api";
import { createBackendProvider } from "../api/client";

const statusKey = "gc.atlas.lastSaveStatus";

type ListResult<T> = { items: T[] };

interface AtlasConversationRecord {
  id: string;
  userId: string;
  organizationId: string;
  entry: AtlasConversationEntry;
  createdAt: string;
  updatedAt: string;
}

interface AtlasMemoryRecord {
  id: string;
  userId: string;
  organizationId: string;
  memory: AtlasMemory;
  latestInsight?: string;
  updatedAt: string;
  createdAt: string;
}

export interface AtlasCoachDiagnostics {
  provider: string;
  conversationHistory: AtlasConversationEntry[];
  memoryState: AtlasMemory | null;
  latestInsight: string;
  saveStatus: string;
  offlineQueue: QueuedWrite[];
  providerStatus: string;
  currentCoachMode: string;
  foundationMetadata: AtlasFoundationMetadata;
  generatedPlans: AtlasGeneratedPlans;
}

function currentUserId(session: AuthSession | null) {
  return session?.user.id ?? "demo-user";
}

function currentOrganizationId(session: AuthSession | null) {
  return session?.organization?.id ?? session?.user.activeOrganizationId ?? "org-gymcord";
}

function isConfiguredSupabase(provider: BackendProvider) {
  return provider.name === "supabase" && Boolean(appConfig.backend.supabase.url && appConfig.backend.supabase.anonKey);
}

export class AtlasCoachRepository {
  constructor(private readonly backend = createBackendProvider()) {}

  get providerName() { return this.backend.name; }

  getLastSaveStatus() { return saved(statusKey, "No Atlas saves yet."); }

  loadCachedConversation() { return AtlasStore.loadConversation(); }

  getOfflineQueue() {
    return offlineEngine.getQueue().filter((item) => item.entity === "/atlasConversations" || item.entity === "/atlasMemory");
  }

  async loadConversation(session: AuthSession | null): Promise<AtlasConversationEntry[]> {
    const fallback = AtlasStore.loadConversation();
    try {
      const result = await this.backend.request<ListResult<AtlasConversationRecord>>({ method: "GET", path: "/atlasConversations", headers: {}, timeoutMs: appConfig.backend.timeoutMs, retryAttempts: 0, queuedWhenOffline: false });
      const entries = (result.data.items ?? [])
        .filter((record) => !record.userId || record.userId === currentUserId(session))
        .map((record) => record.entry)
        .filter(Boolean)
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      return entries.length ? entries : fallback;
    } catch {
      return fallback;
    }
  }

  async rememberConversation(session: AuthSession | null, entry: AtlasConversationEntry, nextConversation?: AtlasConversationEntry[]): Promise<void> {
    AtlasStore.saveConversation(nextConversation ?? [entry, ...AtlasStore.loadConversation()]);
    await this.safeWrite("conversation", () => this.backend.request({ method: "POST", path: "/atlasConversations", body: this.toConversationRecord(session, entry), headers: {}, timeoutMs: appConfig.backend.timeoutMs, retryAttempts: 0, queuedWhenOffline: true }));
  }

  async saveMemory(session: AuthSession | null, memory: AtlasMemory, latestInsight = "No insight generated yet."): Promise<void> {
    AtlasStore.saveMemory(memory);
    if (!isConfiguredSupabase(this.backend) && this.backend.name !== "mock") return;
    await this.safeWrite("memory", () => this.backend.request({ method: "POST", path: "/atlasMemory", body: this.toMemoryRecord(session, memory, latestInsight), headers: {}, timeoutMs: appConfig.backend.timeoutMs, retryAttempts: 0, queuedWhenOffline: true }));
  }

  async loadMemory(session: AuthSession | null, fallback: AtlasMemory): Promise<AtlasMemory> {
    try {
      const result = await this.backend.request<ListResult<AtlasMemoryRecord>>({ method: "GET", path: "/atlasMemory", headers: {}, timeoutMs: appConfig.backend.timeoutMs, retryAttempts: 0, queuedWhenOffline: false });
      const record = (result.data.items ?? [])
        .filter((item) => !item.userId || item.userId === currentUserId(session))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
      return record?.memory ?? fallback;
    } catch {
      return fallback;
    }
  }

  async diagnostics(session: AuthSession | null, fallbackMemory: AtlasMemory, latestInsight: string): Promise<AtlasCoachDiagnostics> {
    return {
      provider: this.backend.name,
      conversationHistory: await this.loadConversation(session),
      memoryState: await this.loadMemory(session, fallbackMemory),
      latestInsight,
      saveStatus: this.getLastSaveStatus(),
      offlineQueue: this.getOfflineQueue(),
      providerStatus: this.backend.name === "mock" ? "mock_active" : "provider_metadata_ready",
      currentCoachMode: "consumer_self_coaching",
      foundationMetadata: buildAtlasFoundationMetadata({ memory: fallbackMemory, provider: this.backend.name, userGoal: fallbackMemory.goal }),
      generatedPlans: buildMockAtlasPlans(fallbackMemory),
    };
  }

  private toConversationRecord(session: AuthSession | null, entry: AtlasConversationEntry): AtlasConversationRecord {
    const now = new Date().toISOString();
    return { id: entry.id, userId: currentUserId(session), organizationId: currentOrganizationId(session), entry, createdAt: entry.timestamp || now, updatedAt: now };
  }

  private toMemoryRecord(session: AuthSession | null, memory: AtlasMemory, latestInsight: string): AtlasMemoryRecord {
    const now = new Date().toISOString();
    return { id: crypto.randomUUID(), userId: currentUserId(session), organizationId: currentOrganizationId(session), memory, latestInsight, createdAt: now, updatedAt: now };
  }

  private async safeWrite(label: string, write: () => Promise<unknown>) {
    try {
      await write();
      save(statusKey, `Saved Atlas ${label} at ${new Date().toLocaleTimeString()}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown error";
      save(statusKey, `Could not save Atlas ${label}: ${message}`);
    }
  }
}

export class AtlasRepository extends AtlasCoachRepository {}
export class AtlasConversationRepository extends AtlasCoachRepository {}
export class AtlasPlanRepository extends AtlasCoachRepository {
  generateMockPlans(memory: AtlasMemory) { return buildMockAtlasPlans(memory); }
}
export class AtlasMemoryRepository extends AtlasCoachRepository {}

export const atlasCoachRepository = new AtlasCoachRepository();
