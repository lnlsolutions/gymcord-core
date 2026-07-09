export type EntityId = string;
export type IsoDateString = string;
export type IsoDateTimeString = string;
export type MembershipRole = "owner" | "admin" | "manager" | "trainer" | "member" | "guest";
export type MembershipStatus = "active" | "invited" | "paused" | "cancelled";
export type NotificationChannel = "in_app" | "email" | "push" | "sms";
export type NotificationStatus = "queued" | "sent" | "read" | "failed";
export type MessageStatus = "draft" | "sent" | "delivered" | "read";

export interface AuditMetadata {
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
  deletedAt?: IsoDateTimeString;
}

export interface User extends AuditMetadata {
  id: EntityId;
  email: string;
  displayName: string;
  avatarUrl?: string;
  timezone: string;
  locale: string;
}

export interface Trainer extends AuditMetadata {
  id: EntityId;
  userId: EntityId;
  organizationIds: EntityId[];
  specialties: string[];
  bio?: string;
}

export interface MemberProfile extends AuditMetadata {
  id: EntityId;
  userId: EntityId;
  organizationId?: EntityId;
  trainerId?: EntityId;
  goals: string[];
  status: MembershipStatus;
}

export interface Gym extends AuditMetadata {
  id: EntityId;
  organizationId: EntityId;
  name: string;
  address?: string;
  timezone: string;
}

export interface OrganizationBrand {
  appName: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  typography: string;
}

export interface OrganizationTheme {
  mode: "dark" | "light" | "system";
  radius: "compact" | "rounded" | "pill";
}

export interface OrganizationBilling {
  provider: "manual" | "stripe" | "app_store";
  status: "trialing" | "active" | "past_due" | "cancelled";
  customerId?: string;
}

export interface OrganizationSettings {
  allowMemberSignup: boolean;
  requireTrainerApproval: boolean;
  timezone: string;
}

export interface OrganizationRouting {
  subdomains: string[];
  customDomains: string[];
}

export interface Organization extends AuditMetadata {
  id: EntityId;
  name: string;
  slug: string;
  ownerUserId: EntityId;
  defaultGymId?: EntityId;
  brand: OrganizationBrand;
  theme: OrganizationTheme;
  memberIds: EntityId[];
  trainerIds: EntityId[];
  gymIds: EntityId[];
  planIds: EntityId[];
  billing: OrganizationBilling;
  settings: OrganizationSettings;
  routing: OrganizationRouting;
}

export interface Membership extends AuditMetadata {
  id: EntityId;
  organizationId: EntityId;
  userId: EntityId;
  role: MembershipRole;
  status: MembershipStatus;
  gymId?: EntityId;
}


export type ProgramStatus = "draft" | "published" | "archived";

export interface ProgramExercise {
  id: EntityId;
  name: string;
  sets: number;
  reps: string;
  restSeconds?: number;
  notes?: string;
}

export interface ProgramDay {
  id: EntityId;
  title: string;
  exercises: ProgramExercise[];
}

export interface ProgramWeek {
  id: EntityId;
  title: string;
  days: ProgramDay[];
}

export interface Program extends AuditMetadata {
  id: EntityId;
  organizationId?: EntityId;
  trainerId?: EntityId;
  assignedMemberIds: EntityId[];
  title: string;
  description: string;
  status: ProgramStatus;
  weeks: ProgramWeek[];
  publishedAt?: IsoDateTimeString;
}


export type ExerciseStatus = "active" | "archived";

export interface Exercise extends AuditMetadata {
  id: EntityId;
  organizationId?: EntityId;
  trainerId?: EntityId;
  name: string;
  description: string;
  category: string;
  muscleGroups: string[];
  equipment: string[];
  instructions: string[];
  mediaUrl?: string;
  status: ExerciseStatus;
}


export type CalendarEventStatus = "scheduled" | "cancelled" | "archived";
export type CalendarEventKind = "program_milestone" | "trainer_appointment" | "member_check_in" | "workout_schedule" | "general";

export interface CalendarReminder {
  id: EntityId;
  offsetMinutes: number;
  channel: NotificationChannel;
  message?: string;
}

export interface CalendarRecurringMetadata {
  frequency: "daily" | "weekly" | "monthly";
  interval: number;
  count?: number;
  until?: IsoDateString;
  daysOfWeek?: number[];
}

export interface CalendarEvent extends AuditMetadata {
  id: EntityId;
  organizationId?: EntityId;
  trainerId?: EntityId;
  memberId?: EntityId;
  title: string;
  description?: string;
  kind: CalendarEventKind;
  startsAt: IsoDateTimeString;
  endsAt: IsoDateTimeString;
  timezone: string;
  status: CalendarEventStatus;
  sourceModule?: "program_builder" | "trainer_portal" | "member_check_ins" | "workout_schedules";
  sourceId?: EntityId;
  recurring?: CalendarRecurringMetadata;
  reminders?: CalendarReminder[];
}

export type CalendarAvailabilityStatus = "available" | "blocked" | "archived";

export interface CalendarAvailability extends AuditMetadata {
  id: EntityId;
  organizationId?: EntityId;
  trainerId: EntityId;
  startsAt: IsoDateTimeString;
  endsAt: IsoDateTimeString;
  timezone: string;
  status: CalendarAvailabilityStatus;
  recurring?: CalendarRecurringMetadata;
}


export type ConversationStatus = "active" | "archived";
export type ConversationKind = "direct" | "trainer_member" | "team_announcement" | "system";
export type MessagingParticipantRole = "trainer" | "member" | "admin" | "system";
export type MessagingDeliveryStatus = "queued" | "sent" | "delivered" | "read" | "failed";

export interface MessagingParticipant {
  userId: EntityId;
  role: MessagingParticipantRole;
  joinedAt: IsoDateTimeString;
  lastReadAt?: IsoDateTimeString;
}

export interface MessagingAttachmentMetadata {
  id: EntityId;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storagePath?: string;
  url?: string;
}

export interface MessagingModerationMetadata {
  status: "pending" | "approved" | "flagged" | "blocked";
  reviewedBy?: EntityId;
  reviewedAt?: IsoDateTimeString;
  reason?: string;
  score?: number;
}

export interface MessagingConversation extends AuditMetadata {
  id: EntityId;
  organizationId?: EntityId;
  title: string;
  kind: ConversationKind;
  participantIds: EntityId[];
  participants: MessagingParticipant[];
  status: ConversationStatus;
  sourceModule?: "trainer_portal" | "member_app" | "team_announcements" | "system_messages" | "realtime_subscriptions";
  sourceId?: EntityId;
  lastMessageAt?: IsoDateTimeString;
  archivedAt?: IsoDateTimeString;
}

export interface MessagingMessage extends AuditMetadata {
  id: EntityId;
  organizationId?: EntityId;
  conversationId: EntityId;
  senderId: EntityId;
  body: string;
  status: MessagingDeliveryStatus;
  readBy: EntityId[];
  editedAt?: IsoDateTimeString;
  attachments: MessagingAttachmentMetadata[];
  moderation?: MessagingModerationMetadata;
  system?: boolean;
}

export interface WorkoutSession extends AuditMetadata {
  id: EntityId;
  userId: EntityId;
  organizationId?: EntityId;
  workoutId?: EntityId;
  scheduledFor: IsoDateString;
  startedAt?: IsoDateTimeString;
  completedAt?: IsoDateTimeString;
  notes?: string;
}

export interface ExerciseLog extends AuditMetadata {
  id: EntityId;
  sessionId: EntityId;
  exerciseId: EntityId;
  sets: Array<{ reps: number; weight?: number; durationSeconds?: number; completed: boolean }>;
  notes?: string;
}

export interface MealLog extends AuditMetadata {
  id: EntityId;
  userId: EntityId;
  organizationId?: EntityId;
  loggedFor: IsoDateString;
  proteinGrams: number;
  calories: number;
  waterServings: number;
  photoUrl?: string;
  ingredients?: string;
}

export interface ProgressPhoto extends AuditMetadata {
  id: EntityId;
  userId: EntityId;
  organizationId?: EntityId;
  takenOn: IsoDateString;
  angle: "front" | "side" | "back" | "other";
  imageUrl: string;
}

export interface Message extends AuditMetadata {
  id: EntityId;
  organizationId?: EntityId;
  senderUserId: EntityId;
  recipientUserIds: EntityId[];
  body: string;
  status: MessageStatus;
}

export interface Notification extends AuditMetadata {
  id: EntityId;
  userId: EntityId;
  organizationId?: EntityId;
  title: string;
  body: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  readAt?: IsoDateTimeString;
}

export type NotificationKind = "reminder" | "workout_reminder" | "nutrition_reminder" | "progress_reminder" | "trainer_message" | "program_assignment" | "calendar_event" | "system_alert";
export type NotificationPriority = "low" | "normal" | "high" | "critical";
export type NotificationLifecycleStatus = "unread" | "read" | "archived";

export interface NotificationAction {
  label: string;
  href?: string;
  actionId?: string;
}

export interface PushNotificationMetadata {
  enabled: boolean;
  title?: string;
  body?: string;
  deepLink?: string;
  badgeCount?: number;
  collapseKey?: string;
  deviceTokens?: string[];
  data?: Record<string, string>;
}

export interface MessageChannelMetadata {
  enabled: boolean;
  to?: string;
  templateId?: string;
  subject?: string;
  body?: string;
  variables?: Record<string, string>;
  providerMessageId?: string;
}

export interface NotificationDeliveryMetadata {
  push: PushNotificationMetadata;
  email: MessageChannelMetadata;
  sms: MessageChannelMetadata;
}

export interface ReminderSettingsSnapshot {
  workout: boolean;
  nutrition: boolean;
  progress: boolean;
  calendar: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  timezone: string;
}

export interface NotificationPreference extends AuditMetadata {
  id: EntityId;
  userId: EntityId;
  organizationId?: EntityId;
  channels: Record<NotificationChannel, boolean>;
  reminders: ReminderSettingsSnapshot;
  digestFrequency: "off" | "daily" | "weekly";
}

export interface AppNotification extends AuditMetadata {
  id: EntityId;
  userId: EntityId;
  organizationId?: EntityId;
  audience: "member" | "trainer" | "team" | "system";
  kind: NotificationKind;
  title: string;
  body: string;
  priority: NotificationPriority;
  lifecycleStatus: NotificationLifecycleStatus;
  channels: NotificationChannel[];
  sourceModule?: "member_app" | "trainer_portal" | "calendar" | "messaging" | "program_builder" | "nutrition" | "progress" | "workout" | "system";
  sourceId?: EntityId;
  scheduledFor?: IsoDateTimeString;
  deliveredAt?: IsoDateTimeString;
  readAt?: IsoDateTimeString;
  archivedAt?: IsoDateTimeString;
  actions: NotificationAction[];
  delivery: NotificationDeliveryMetadata;
}

export interface Achievement extends AuditMetadata {
  id: EntityId;
  userId: EntityId;
  code: string;
  title: string;
  description: string;
  unlockedAt?: IsoDateTimeString;
  progress: number;
  target: number;
}

export interface Mission extends AuditMetadata {
  id: EntityId;
  userId: EntityId;
  organizationId?: EntityId;
  date: IsoDateString;
  title: string;
  description: string;
  xpReward: number;
  completedAt?: IsoDateTimeString;
}
