import { appConfig } from "../config";
import type { AuthSession } from "../auth/types";
import type { AtlasConversationEntry, AtlasMemory } from "../types/gymcord";
import type { BackendProvider } from "../api";
import { createBackendProvider } from "../api/client";
import { AtlasStore } from "../lib/atlasStore";
import { offlineEngine } from "../services/sync";
import { saved, save } from "../lib/storage";

const statusKey = "gc.atlas.lastSaveStatus";

type ListResult<T> = { items: T[] };
type AtlasConversationRecord = AtlasConversationEntry & { userId?: string; organizationId?: string; createdAt?: string };
type AtlasMemoryRecord = { id: string; userId: string; organizationId: string; memory: AtlasMemory; updatedAt: string; createdAt?: string };

function currentUserId(session: AuthSession | null) {
  return session?.user.id ?? "demo-user";
}

function currentOrganizationId(session: AuthSession | null) {
  return session?.organization?.id ?? session?.user.activeOrganizationId ?? "org-gymcord";
}

function isConfiguredSupabase(provider: BackendProvider) {
  return provider.name === "supabase" && Boolean(appConfig.backend.supabase.url && appConfig.backend.supabase.anonKey);
}

export interface AtlasCoachState {
  provider: string;
  currentUser: string;
  organization: string;
  conversation: AtlasConversationEntry[];
  memory: AtlasMemory;
  latestInsight: string;
  lastSaveStatus: string;
  offlineQueueSize: number;
}

export class AtlasCoachRepository {
  constructor(private readonly backend = createBackendProvider()) {}

  get providerName() { return this.backend.name; }

  getOfflineQueue() { return offlineEngine.getQueue(); }

  getLastSaveStatus() { return saved(statusKey, "No Atlas saves yet."); }

  async load(session: AuthSession | null, fallbackMemory: AtlasMemory, latestInsight = "No insight generated yet."): Promise<AtlasCoachState> {
    const [conversation, memory] = await Promise.all([
      this.loadConversation(session),
      this.loadMemory(session, fallbackMemory),
    ]);

    return {
      provider: this.backend.name,
      currentUser: session?.user.email ?? session?.user.displayName ?? currentUserId(session),
      organization: session?.organization?.name ?? currentOrganizationId(session),
      conversation,
      memory,
      latestInsight,
      lastSaveStatus: this.getLastSaveStatus(),
      offlineQueueSize: this.getOfflineQueue().length,
    };
  }

  async loadConversation(session: AuthSession | null): Promise<AtlasConversationEntry[]> {
    const fallback = AtlasStore.loadConversation();
    try {
      const result = await this.backend.request<ListResult<AtlasConversationRecord>>({ method: "GET", path: "/atlasConversations", headers: {}, timeoutMs: appConfig.backend.timeoutMs, retryAttempts: 0, queuedWhenOffline: false });
      const entries = (result.data.items ?? [])
        .filter((entry) => !entry.userId || entry.userId === currentUserId(session))
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
        .map(({ id, question, answer, timestamp, category }) => ({ id, question, answer, timestamp, category }));
      return entries.length ? entries : fallback;
    } catch {
      return fallback;
    }
  }

  async rememberConversation(session: AuthSession | null, entry: AtlasConversationEntry): Promise<AtlasConversationEntry> {
    const conversation = [entry, ...AtlasStore.loadConversation().filter((item) => item.id !== entry.id)].slice(0, 50);
    AtlasStore.saveConversation(conversation);

    if (!isConfiguredSupabase(this.backend) && this.backend.name !== "mock") return entry;

    await this.safeWrite("conversation", () => this.backend.request({
      method: "POST",
      path: "/atlasConversations",
      body: { ...entry, userId: currentUserId(session), organizationId: currentOrganizationId(session), createdAt: entry.timestamp },
      headers: {},
      timeoutMs: appConfig.backend.timeoutMs,
      retryAttempts: 0,
      queuedWhenOffline: true,
    }));

    return entry;
  }

  async loadMemory(session: AuthSession | null, fallbackMemory: AtlasMemory): Promise<AtlasMemory> {
    const fallback = AtlasStore.loadMemory(fallbackMemory);
    try {
      const result = await this.backend.request<ListResult<AtlasMemoryRecord>>({ method: "GET", path: "/atlasMemory", headers: {}, timeoutMs: appConfig.backend.timeoutMs, retryAttempts: 0, queuedWhenOffline: false });
      const record = (result.data.items ?? [])
        .filter((item) => !item.userId || item.userId === currentUserId(session))
        .sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""))[0];
      return record?.memory ?? fallback;
    } catch {
      return fallback;
    }
  }

  async saveMemory(session: AuthSession | null, memory: AtlasMemory): Promise<void> {
    AtlasStore.saveMemory(memory);

    if (!isConfiguredSupabase(this.backend) && this.backend.name !== "mock") return;

    const now = new Date().toISOString();
    await this.safeWrite("memory", () => this.backend.request({
      method: "POST",
      path: "/atlasMemory",
      body: { id: `${currentUserId(session)}-atlas-memory`, userId: currentUserId(session), organizationId: currentOrganizationId(session), memory, updatedAt: now, createdAt: now },
      headers: {},
      timeoutMs: appConfig.backend.timeoutMs,
      retryAttempts: 0,
      queuedWhenOffline: true,
    }));
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

export const atlasCoachRepository = new AtlasCoachRepository();
