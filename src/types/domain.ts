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

export type ExerciseDifficulty = "beginner" | "intermediate" | "advanced";
export type ExerciseStatus = "active" | "archived";
export type ExerciseMediaType = "image" | "video" | "external_link";

export interface ExerciseMediaMetadata {
  id: EntityId;
  type: ExerciseMediaType;
  title: string;
  url: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  altText?: string;
  provider?: string;
}

export interface ExerciseProgramBuilderDefaults {
  defaultSets: number;
  defaultReps: string;
  defaultRestSeconds: number;
  tempo?: string;
  loadType?: "bodyweight" | "weight" | "distance" | "time";
}

export interface Exercise extends AuditMetadata {
  id: EntityId;
  organizationId?: EntityId;
  trainerId?: EntityId;
  name: string;
  description: string;
  muscleGroups: string[];
  equipment: string[];
  difficulty: ExerciseDifficulty;
  media: ExerciseMediaMetadata[];
  coachingCues: string[];
  movementStandards: string[];
  safetyNotes: string[];
  tags: string[];
  status: ExerciseStatus;
  programBuilder: ExerciseProgramBuilderDefaults;
}
