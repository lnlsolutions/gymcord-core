import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface SupabaseEnvironment {
  url: string;
  anonKey: string;
  storageBucket: string;
  realtimeChannel: string;
  schema: string;
}

export interface SupabaseEnvironmentStatus {
  configured: boolean;
  missing: string[];
  values: Partial<SupabaseEnvironment>;
}

const readEnv = (key: string): string | undefined => {
  const value = import.meta.env[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
};

export function getSupabaseEnvironmentStatus(): SupabaseEnvironmentStatus {
  const values: Partial<SupabaseEnvironment> = {
    url: readEnv("VITE_SUPABASE_URL"),
    anonKey: readEnv("VITE_SUPABASE_ANON_KEY"),
    storageBucket: readEnv("VITE_SUPABASE_STORAGE_BUCKET") ?? "gymcord-assets",
    realtimeChannel: readEnv("VITE_SUPABASE_REALTIME_CHANNEL") ?? "gymcord-events",
    schema: readEnv("VITE_SUPABASE_SCHEMA") ?? "public",
  };

  const missing = [
    ["VITE_SUPABASE_URL", values.url],
    ["VITE_SUPABASE_ANON_KEY", values.anonKey],
  ].filter(([, value]) => !value).map(([key]) => key);

  return { configured: missing.length === 0, missing, values };
}

export function requireSupabaseEnvironment(): SupabaseEnvironment {
  const status = getSupabaseEnvironmentStatus();
  if (!status.configured || !status.values.url || !status.values.anonKey) {
    throw new Error(`Missing required Supabase environment variables: ${status.missing.join(", ")}`);
  }
  return {
    url: status.values.url,
    anonKey: status.values.anonKey,
    storageBucket: status.values.storageBucket ?? "gymcord-assets",
    realtimeChannel: status.values.realtimeChannel ?? "gymcord-events",
    schema: status.values.schema ?? "public",
  };
}

let client: SupabaseClient<any, any, any> | null = null;

export function getSupabaseClient(): SupabaseClient<any, any, any> {
  if (!client) {
    const env = requireSupabaseEnvironment();
    client = createClient(env.url, env.anonKey, {
      db: { schema: env.schema },
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      realtime: { params: { eventsPerSecond: 10 } },
    });
  }
  return client;
}
