import type { EventType, GymCordEvent } from "../events";

export type AutomationTrigger =
  | "WorkoutCompleted"
  | "MissionCompleted"
  | "XpEarned"
  | "AchievementUnlocked"
  | "StreakAtRisk"
  | "WorkoutMissed"
  | "AtlasInsightGenerated"
  | "MemberJoined"
  | "TrainerAssigned";

export type AutomationActionType = "in_app" | "push" | "email" | "atlas_message" | "sms" | "webhook";
export type NotificationStatus = "queued" | "scheduled" | "processing" | "delivered" | "failed" | "expired" | "deduped";
export type NotificationPriority = "low" | "normal" | "high" | "critical";

export interface AutomationAction {
  type: AutomationActionType;
  title: string;
  body: string;
  target?: string;
  metadata?: Record<string, unknown>;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: AutomationTrigger;
  enabled: boolean;
  priority: NotificationPriority;
  actions: AutomationAction[];
  delayMs?: number;
  ttlMs?: number;
  dedupeWindowMs?: number;
  maxRetries?: number;
}

export interface QueuedNotification {
  id: string;
  ruleId: string;
  eventId: string;
  eventType: AutomationTrigger;
  action: AutomationAction;
  priority: NotificationPriority;
  status: NotificationStatus;
  attempts: number;
  maxRetries: number;
  dedupeKey: string;
  createdAt: string;
  scheduledFor: string;
  expiresAt: string;
  deliveredAt?: string;
  failedAt?: string;
  lastError?: string;
}

export interface AutomationExecution {
  id: string;
  ruleId: string;
  ruleName: string;
  eventId: string;
  eventType: string;
  actionType: AutomationActionType;
  notificationId?: string;
  status: "queued" | "skipped" | "failed";
  message: string;
  executedAt: string;
}

export interface AutomationSnapshot {
  recentEvents: GymCordEvent[];
  queuedNotifications: QueuedNotification[];
  executionHistory: AutomationExecution[];
  failedJobs: QueuedNotification[];
}

export const automationTriggerToEventType: Partial<Record<AutomationTrigger, EventType>> = {
  WorkoutCompleted: "WorkoutCompleted" as EventType,
  MissionCompleted: "MissionCompleted" as EventType,
  XpEarned: "XpEarned" as EventType,
  AchievementUnlocked: "AchievementUnlocked" as EventType,
  StreakAtRisk: "StreakAtRisk" as EventType,
  WorkoutMissed: "WorkoutMissed" as EventType,
  AtlasInsightGenerated: "AtlasInsightGenerated" as EventType,
  MemberJoined: "MemberJoined" as EventType,
  TrainerAssigned: "TrainerAssigned" as EventType,
};
