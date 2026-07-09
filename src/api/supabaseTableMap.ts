const tables = [
  "organizations",
  "users",
  "member_profiles",
  "trainer_profiles",
  "workouts",
  "exercises",
  "workout_sessions",
  "exercise_logs",
  "missions",
  "achievements",
  "xp_events",
  "streaks",
  "nutrition_logs",
  "progress_photos",
  "measurements",
  "messages",
  "notifications",
  "atlas_memory",
  "atlas_conversations",
  "programs",
] as const;

export type SupabaseTableName = (typeof tables)[number];

export const supabaseTableMap: Record<SupabaseTableName, SupabaseTableName> = Object.fromEntries(
  tables.map((table) => [table, table]),
) as Record<SupabaseTableName, SupabaseTableName>;
