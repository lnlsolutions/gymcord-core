import type { AppEnvironment } from "./index";

export type DatabaseProviderKind = "supabase" | "firebase" | "postgres" | "sqlite" | "mock";
export type DatabaseConsistencyMode = "strong" | "eventual";

export interface DatabaseProviderConfig {
  provider: DatabaseProviderKind;
  connectionUrl?: string;
  databaseName?: string;
  projectId?: string;
  anonKey?: string;
  schema: string;
  migrationsTable: string;
  consistency: DatabaseConsistencyMode;
  enableOfflineQueue: boolean;
  enablePersistentCache: boolean;
  defaultTtlMs: number;
  healthcheckIntervalMs: number;
}

const baseConfig = {
  schema: import.meta.env.VITE_DATABASE_SCHEMA ?? "public",
  migrationsTable: import.meta.env.VITE_DATABASE_MIGRATIONS_TABLE ?? "schema_migrations",
  defaultTtlMs: Number(import.meta.env.VITE_DATABASE_CACHE_TTL_MS ?? 300000),
  healthcheckIntervalMs: Number(import.meta.env.VITE_DATABASE_HEALTH_INTERVAL_MS ?? 30000),
};

export const databaseConfigByEnvironment: Record<AppEnvironment, DatabaseProviderConfig> = {
  development: {
    ...baseConfig,
    provider: (import.meta.env.VITE_DATABASE_PROVIDER ?? "mock") as DatabaseProviderKind,
    connectionUrl: import.meta.env.VITE_DATABASE_URL ?? "sqlite://gymcord-dev",
    databaseName: import.meta.env.VITE_DATABASE_NAME ?? "gymcord_dev",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    consistency: "eventual",
    enableOfflineQueue: true,
    enablePersistentCache: true,
  },
  staging: {
    ...baseConfig,
    provider: (import.meta.env.VITE_DATABASE_PROVIDER ?? "supabase") as DatabaseProviderKind,
    connectionUrl: import.meta.env.VITE_DATABASE_URL ?? import.meta.env.VITE_SUPABASE_URL,
    databaseName: import.meta.env.VITE_DATABASE_NAME ?? "gymcord_staging",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    consistency: "eventual",
    enableOfflineQueue: true,
    enablePersistentCache: true,
  },
  production: {
    ...baseConfig,
    provider: (import.meta.env.VITE_DATABASE_PROVIDER ?? "supabase") as DatabaseProviderKind,
    connectionUrl: import.meta.env.VITE_DATABASE_URL ?? import.meta.env.VITE_SUPABASE_URL,
    databaseName: import.meta.env.VITE_DATABASE_NAME ?? "gymcord_prod",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    consistency: "strong",
    enableOfflineQueue: true,
    enablePersistentCache: true,
  },
};

export const databaseConfig = databaseConfigByEnvironment[(import.meta.env.MODE === "production" ? "production" : import.meta.env.MODE === "staging" ? "staging" : "development") as AppEnvironment];
