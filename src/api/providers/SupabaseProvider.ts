import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseTableMap, type SupabaseTableName } from "../supabaseTableMap";
import { ApiError, type ApiRequest, type ApiResponse, type BackendProvider } from "../types";

const pathAliases: Record<string, SupabaseTableName> = {
  organizations: "organizations",
  users: "users",
  memberProfiles: "member_profiles",
  trainerProfiles: "trainer_profiles",
  programs: "programs",
  workouts: "workouts",
  exercises: "exercises",
  workoutSessions: "workout_sessions",
  exerciseLogs: "exercise_logs",
  missions: "missions",
  achievements: "achievements",
  xpEvents: "xp_events",
  streaks: "streaks",
  nutritionLogs: "nutrition_logs",
  progressPhotos: "progress_photos",
  measurements: "measurements",
  messagingConversations: "messaging_conversations",
  messagingMessages: "messaging_messages",
  messages: "messages",
  notifications: "notifications",
  notificationPreferences: "notification_preferences",
  atlasMemory: "atlas_memory",
  atlasConversations: "atlas_conversations",
  calendarEvents: "calendar_events",
  calendarAvailability: "calendar_availability",
  checkIns: "check_ins",
  billingPlans: "billing_plans",
  billingSubscriptions: "billing_subscriptions",
  billingPreferences: "billing_preferences",
  gyms: "gyms",
  tenantRelationships: "tenant_relationships",
  tenantBranding: "tenant_branding",
  tenantSettings: "tenant_settings",
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function camelToSnake(key: string) {
  return key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function snakeToCamel(key: string) {
  return key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

function keysToSnake(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(keysToSnake);
  if (!isPlainObject(value)) return value;
  return Object.fromEntries(Object.entries(value).map(([key, entry]) => [camelToSnake(key), keysToSnake(entry)]));
}

function keysToCamel(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(keysToCamel);
  if (!isPlainObject(value)) return value;
  return Object.fromEntries(Object.entries(value).map(([key, entry]) => [snakeToCamel(key), keysToCamel(entry)]));
}

function parsePath(path: string): { table: SupabaseTableName; id?: string; action?: string } {
  const [collection, id, action] = path.replace(/^\//, "").split("/");
  const table = pathAliases[collection];
  if (!table) throw new ApiError(`Unsupported Supabase table path: ${path}`, 400, "UNSUPPORTED_TABLE");
  return { table, id, action };
}

export class SupabaseProvider implements BackendProvider {
  readonly name = "supabase";
  private readonly client?: SupabaseClient;

  constructor(private readonly url?: string, private readonly anonKey?: string, client?: SupabaseClient) {
    this.client = client ?? (url && anonKey ? createClient(url, anonKey) : undefined);
  }

  async request<TResponse, TBody = unknown>(request: ApiRequest<TBody>): Promise<ApiResponse<TResponse>> {
    if (!this.client) throw new ApiError("Supabase is not configured.", 501, "SUPABASE_NOT_CONFIGURED");
    if (request.signal?.aborted) throw new ApiError("Request was cancelled.", 499, "REQUEST_CANCELLED");

    const { table, id, action } = parsePath(request.path);

    if (request.method === "GET") {
      if (id === "slug" && action) {
        const { data, error, status } = await this.client.from(table).select("*").eq("slug", action).maybeSingle();
        if (error) throw new ApiError(error.message, status, error.code, error);
        return this.response(keysToCamel(data) as TResponse, status);
      }

      if (id) {
        const { data, error, status } = await this.client.from(table).select("*").eq("id", id).maybeSingle();
        if (error) throw new ApiError(error.message, status, error.code, error);
        return this.response(keysToCamel(data) as TResponse, status);
      }

      const { data, error, status } = await this.client.from(table).select("*");
      if (error) throw new ApiError(error.message, status, error.code, error);
      return this.response({ items: keysToCamel(data ?? []) } as TResponse, status);
    }

    if (request.method === "POST") {
      const { data, error, status } = await this.client.from(table).insert(keysToSnake(request.body)).select("*").single();
      if (error) throw new ApiError(error.message, status, error.code, error);
      return this.response(keysToCamel(data) as TResponse, status);
    }

    if (request.method === "PATCH") {
      if (!id) throw new ApiError("Record id is required for updates.", 400, "MISSING_ID");
      const { data, error, status } = await this.client.from(table).update(keysToSnake(request.body)).eq("id", id).select("*").single();
      if (error) throw new ApiError(error.message, status, error.code, error);
      return this.response(keysToCamel(data) as TResponse, status);
    }

    if (request.method === "DELETE") {
      if (!id) throw new ApiError("Record id is required for deletes.", 400, "MISSING_ID");
      const { error, status } = await this.client.from(table).delete().eq("id", id);
      if (error) throw new ApiError(error.message, status, error.code, error);
      return this.response(undefined as TResponse, status || 204);
    }

    throw new ApiError(`Unsupported Supabase request: ${request.method} ${request.path}`, 400, "UNSUPPORTED_REQUEST");
  }

  private response<T>(data: T, status = 200): ApiResponse<T> {
    return { data, status, headers: {}, source: "remote" };
  }
}
