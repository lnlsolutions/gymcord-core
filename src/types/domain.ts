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

export type TrainerMemberStatus = "active" | "needs_attention" | "paused";
export type TrainerAlertPriority = "High" | "Medium" | "Low";
export type TrainerTaskStatus = "open" | "done";

export interface TrainerMember extends AuditMetadata {
  id: EntityId;
  userId: EntityId;
  organizationId: EntityId;
  trainerId: EntityId;
  name: string;
  goal: string;
  avatarUrl?: string;
  status: TrainerMemberStatus;
  currentProgramId?: EntityId;
  workoutCompliance: number;
  nutritionCompliance: number;
  progressScore: number;
  lastCheckInAt?: IsoDateTimeString;
}

export interface TrainerProgramAssignment extends AuditMetadata {
  id: EntityId;
  organizationId: EntityId;
  trainerId: EntityId;
  memberId: EntityId;
  programId: EntityId;
  programTitle: string;
  startsOn: IsoDateString;
  status: "active" | "queued" | "completed";
}

export interface TrainerCoachNote extends AuditMetadata {
  id: EntityId;
  organizationId: EntityId;
  trainerId: EntityId;
  memberId: EntityId;
  body: string;
  pinned: boolean;
}

export interface TrainerTask extends AuditMetadata {
  id: EntityId;
  organizationId: EntityId;
  trainerId: EntityId;
  memberId?: EntityId;
  title: string;
  dueOn: IsoDateString;
  status: TrainerTaskStatus;
}

export interface TrainerAtlasAlert extends AuditMetadata {
  id: EntityId;
  organizationId: EntityId;
  trainerId: EntityId;
  memberId: EntityId;
  title: string;
  description: string;
  priority: TrainerAlertPriority;
  resolved: boolean;
}

export interface TrainerSummary {
  trainerId: EntityId;
  organizationId: EntityId;
  activeMembers: number;
  assignedPrograms: number;
  averageWorkoutCompliance: number;
  averageNutritionCompliance: number;
  openAlerts: number;
  openTasks: number;
}
