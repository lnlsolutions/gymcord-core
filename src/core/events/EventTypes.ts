import type { Achievement, AtlasInsight, DailyLog, Mission, Profile, WorkoutDay, XpSnapshot } from "../../types/gymcord";
import type { Organization } from "../../types/domain";

export const EventTypes = {
  WorkoutCompleted: "WorkoutCompleted",
  MissionCompleted: "MissionCompleted",
  XpEarned: "XpEarned",
  AchievementUnlocked: "AchievementUnlocked",
  MessageReceived: "MessageReceived",
  NotificationCreated: "NotificationCreated",
  AtlasUpdated: "AtlasUpdated",
  MemberUpdated: "MemberUpdated",
  OrganizationUpdated: "OrganizationUpdated",
} as const;

export type EventType = (typeof EventTypes)[keyof typeof EventTypes];

export interface EventEnvelope<TType extends EventType = EventType, TPayload = unknown> {
  id: string;
  type: TType;
  payload: TPayload;
  occurredAt: string;
  source: string;
}

export interface WorkoutCompletedPayload {
  workout: WorkoutDay;
  dayLog: DailyLog;
  completedAt: string;
  durationMinutes: number;
  xpEarned: number;
}

export interface MissionCompletedPayload {
  mission: Mission;
  completedAt: string;
}

export interface XpEarnedPayload {
  amount: number;
  totalXp: number;
  snapshot: XpSnapshot;
  reason: string;
}

export interface AchievementUnlockedPayload {
  achievement: Achievement;
  unlockedAt: string;
}

export interface MessageReceivedPayload {
  id: string;
  conversationId: string;
  senderId: string;
  message: string;
  receivedAt: string;
}

export interface NotificationCreatedPayload {
  id: string;
  title: string;
  body: string;
  createdAt: string;
}

export interface AtlasUpdatedPayload {
  insights: AtlasInsight[];
  mission: Mission;
  updatedAt: string;
}

export interface MemberUpdatedPayload {
  profile: Profile;
  updatedAt: string;
}

export interface OrganizationUpdatedPayload {
  organization: Organization;
  updatedAt: string;
}

export type GymCordEventMap = {
  [EventTypes.WorkoutCompleted]: WorkoutCompletedPayload;
  [EventTypes.MissionCompleted]: MissionCompletedPayload;
  [EventTypes.XpEarned]: XpEarnedPayload;
  [EventTypes.AchievementUnlocked]: AchievementUnlockedPayload;
  [EventTypes.MessageReceived]: MessageReceivedPayload;
  [EventTypes.NotificationCreated]: NotificationCreatedPayload;
  [EventTypes.AtlasUpdated]: AtlasUpdatedPayload;
  [EventTypes.MemberUpdated]: MemberUpdatedPayload;
  [EventTypes.OrganizationUpdated]: OrganizationUpdatedPayload;
};

export type GymCordEvent<TType extends EventType = EventType> = {
  [K in EventType]: EventEnvelope<K, GymCordEventMap[K]>;
}[TType];
