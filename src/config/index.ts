export const appConfig = {
  appName: import.meta.env.VITE_APP_NAME ?? "GymCord",
  environment: import.meta.env.MODE,
  storageKeys: {
    profile: import.meta.env.VITE_STORAGE_PROFILE_KEY ?? "gc.profile",
    profileComplete: import.meta.env.VITE_STORAGE_PROFILE_COMPLETE_KEY ?? "gc.profileComplete",
    dailyLogs: import.meta.env.VITE_STORAGE_DAILY_LOGS_KEY ?? "gc.dailyLogs",
    atlasConversation: import.meta.env.VITE_STORAGE_ATLAS_CONVERSATION_KEY ?? "gc.atlas.conversation",
    atlasMemory: import.meta.env.VITE_STORAGE_ATLAS_MEMORY_KEY ?? "gc.atlas.memory",
    offlineQueue: import.meta.env.VITE_STORAGE_OFFLINE_QUEUE_KEY ?? "gc.offline.queue",
  },
  onboarding: {
    completionDelayMs: Number(import.meta.env.VITE_ONBOARDING_COMPLETION_DELAY_MS ?? 350),
  },
  sync: {
    autoSyncIntervalMs: Number(import.meta.env.VITE_SYNC_INTERVAL_MS ?? 30000),
    maxRetryAttempts: Number(import.meta.env.VITE_SYNC_MAX_RETRY_ATTEMPTS ?? 3),
  },
} as const;

export type AppConfig = typeof appConfig;
