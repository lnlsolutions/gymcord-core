export type AppEnvironment = "development" | "staging" | "production";
export type BackendKind = "mock" | "supabase" | "firebase" | "rest";

const mode = import.meta.env.MODE;
const environment: AppEnvironment = mode === "production" ? "production" : mode === "staging" ? "staging" : "development";
const backendProvider = (import.meta.env.VITE_BACKEND_PROVIDER ?? "mock") as BackendKind;

const defaultEndpoints: Record<AppEnvironment, { apiBaseUrl: string }> = {
  development: { apiBaseUrl: "http://localhost:5173/api/" },
  staging: { apiBaseUrl: "https://staging-api.gymcord.app/" },
  production: { apiBaseUrl: "https://api.gymcord.app/" },
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (backendProvider === "supabase" && (!supabaseUrl || !supabaseAnonKey)) {
  throw new Error("VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required when VITE_BACKEND_PROVIDER=supabase.");
}

export const appConfig = {
  appName: import.meta.env.VITE_APP_NAME ?? "GymCord",
  environment,
  backend: {
    provider: backendProvider,
    endpoints: {
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? defaultEndpoints[environment].apiBaseUrl,
      organizations: import.meta.env.VITE_ORGANIZATIONS_ENDPOINT ?? "/organizations",
    },
    supabase: {
      url: supabaseUrl,
      anonKey: supabaseAnonKey,
    },
    firebase: {
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    },
    retryAttempts: Number(import.meta.env.VITE_API_RETRY_ATTEMPTS ?? 2),
    timeoutMs: Number(import.meta.env.VITE_API_TIMEOUT_MS ?? 10000),
  },
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
