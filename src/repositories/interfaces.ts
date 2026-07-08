import type { AtlasConversationEntry, DailyLog } from "../types/gymcord";
import type { Achievement, EntityId, Organization, ExerciseLog, MealLog, Mission, Notification, ProgressPhoto, Trainer, User, WorkoutSession } from "../types/domain";
import type { Repository, RepositoryResult } from "./base";

export interface UserRepository extends Repository<User, Omit<User, "id" | "createdAt" | "updatedAt">> {
  findByEmail(email: string): Promise<RepositoryResult<User | null>>;
}

export interface ExerciseRepository extends Repository<ExerciseLog> {
  listForSession(sessionId: EntityId): Promise<RepositoryResult<ExerciseLog[]>>;
}

export interface WorkoutRepository extends Repository<WorkoutSession> {
  listSessionsForUser(userId: EntityId): Promise<RepositoryResult<WorkoutSession[]>>;
  listExerciseLogs(sessionId: EntityId): Promise<RepositoryResult<ExerciseLog[]>>;
  saveDailyLog(userId: EntityId, log: DailyLog): Promise<RepositoryResult<DailyLog>>;
}

export interface MissionRepository extends Repository<Mission> {
  listForUser(userId: EntityId): Promise<RepositoryResult<Mission[]>>;
  completeMission(id: EntityId): Promise<RepositoryResult<Mission>>;
}

export interface NutritionRepository extends Repository<MealLog> {
  listForUser(userId: EntityId): Promise<RepositoryResult<MealLog[]>>;
}

export interface ProgressRepository {
  listMealLogs(userId: EntityId): Promise<RepositoryResult<MealLog[]>>;
  listProgressPhotos(userId: EntityId): Promise<RepositoryResult<ProgressPhoto[]>>;
  saveMealLog(input: MealLog): Promise<RepositoryResult<MealLog>>;
  saveProgressPhoto(input: ProgressPhoto): Promise<RepositoryResult<ProgressPhoto>>;
}

export interface TrainerRepository extends Repository<Trainer> {
  listForOrganization(organizationId: EntityId): Promise<RepositoryResult<Trainer[]>>;
}

export interface AtlasRepository {
  loadConversation(userId: EntityId): Promise<RepositoryResult<AtlasConversationEntry[]>>;
  rememberConversation(userId: EntityId, entry: AtlasConversationEntry): Promise<RepositoryResult<AtlasConversationEntry>>;
}

export interface NotificationRepository extends Repository<Notification> {
  listUnread(userId: EntityId): Promise<RepositoryResult<Notification[]>>;
  markRead(id: EntityId): Promise<RepositoryResult<Notification>>;
}

export interface AnalyticsRecord {
  id: EntityId;
  organizationId?: EntityId;
  name: string;
  payload: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsRepository extends Repository<AnalyticsRecord> {
  track(record: Omit<AnalyticsRecord, "id" | "createdAt" | "updatedAt">): Promise<RepositoryResult<AnalyticsRecord>>;
}

export interface AchievementRepository extends Repository<Achievement> {
  listForUser(userId: EntityId): Promise<RepositoryResult<Achievement[]>>;
}

export interface OrganizationRepository extends Repository<Organization, Omit<Organization, "id" | "createdAt" | "updatedAt">> {
  findBySlug(slug: string): Promise<RepositoryResult<Organization | null>>;
}
