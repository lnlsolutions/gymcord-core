export const AnalyticsEventNames = {
  AppLaunch: "App Launch",
  Login: "Login",
  Signup: "Signup",
  WorkoutStarted: "Workout Started",
  WorkoutCompleted: "Workout Completed",
  MissionCompleted: "Mission Completed",
  XpEarned: "XP Earned",
  AchievementUnlocked: "Achievement Unlocked",
  AtlasConversation: "Atlas Conversation",
  ProgressPhotoAdded: "Progress Photo Added",
  MealLogged: "Meal Logged",
  OrganizationCreated: "Organization Created",
  TrainerAdded: "Trainer Added",
  MemberJoined: "Member Joined",
} as const;

export type AnalyticsEventName = (typeof AnalyticsEventNames)[keyof typeof AnalyticsEventNames];
export type AnalyticsProviderName = "mock" | "posthog" | "mixpanel" | "amplitude" | "google-analytics" | "azure-app-insights";
export type AnalyticsSeverity = "debug" | "info" | "warn" | "error" | "fatal";

export interface AnalyticsEvent {
  id: string;
  name: AnalyticsEventName | string;
  properties: Record<string, unknown>;
  occurredAt: string;
  source: string;
  provider: AnalyticsProviderName;
  processingTimeMs?: number;
}

export interface PerformanceMetric {
  id: string;
  name: "Render time" | "API latency" | "Event processing time" | "Memory usage" | "Offline sync duration" | "Queue depth" | string;
  value: number;
  unit: "ms" | "count" | "mb" | "percent";
  recordedAt: string;
  tags?: Record<string, string>;
}

export interface LogEntry {
  id: string;
  severity: AnalyticsSeverity;
  message: string;
  context?: Record<string, unknown>;
  occurredAt: string;
}

export interface CrashReport extends LogEntry {
  severity: "error" | "fatal";
  stack?: string;
  componentStack?: string;
}

export interface QueueHealth {
  depth: number;
  failed: number;
  lastFlushAt?: string;
  status: "idle" | "flushing" | "degraded";
}

export interface AnalyticsSnapshot {
  events: AnalyticsEvent[];
  metrics: PerformanceMetric[];
  errors: CrashReport[];
  queue: QueueHealth;
  realtime: { connected: boolean; provider: AnalyticsProviderName; lastEventAt?: string };
  apiLatency: PerformanceMetric[];
}
