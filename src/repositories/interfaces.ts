import type { AtlasConversationEntry, DailyLog } from "../types/gymcord";
import type { Achievement, EntityId, Organization, Trainer, Program, ExerciseLog, MealLog, MemberProfile, Mission, Notification, ProgressPhoto, User, WorkoutSession } from "../types/domain";
import type { Repository, RepositoryResult } from "./base";

export interface TrainerRepository extends Repository<Trainer, Omit<Trainer, "id" | "createdAt" | "updatedAt">> {
  listByOrganization(organizationId: EntityId): Promise<RepositoryResult<Trainer[]>>;
}

export interface MemberRepository extends Repository<MemberProfile, Omit<MemberProfile, "id" | "createdAt" | "updatedAt">> {
  listByTrainer(trainerId: EntityId): Promise<RepositoryResult<MemberProfile[]>>;
}

export interface UserRepository extends Repository<User, Omit<User, "id" | "createdAt" | "updatedAt">> {
  findByEmail(email: string): Promise<RepositoryResult<User | null>>;
}

export interface ProgramRepository extends Repository<Program, Omit<Program, "id" | "createdAt" | "updatedAt">> {
  duplicate(id: EntityId): Promise<RepositoryResult<Program>>;
  assign(id: EntityId, memberIds: EntityId[]): Promise<RepositoryResult<Program>>;
  publish(id: EntityId): Promise<RepositoryResult<Program>>;
  saveDraft(id: EntityId, input: Partial<Omit<Program, "id" | "createdAt" | "updatedAt">>): Promise<RepositoryResult<Program>>;
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

export interface ProgressRepository {
  listMealLogs(userId: EntityId): Promise<RepositoryResult<MealLog[]>>;
  listProgressPhotos(userId: EntityId): Promise<RepositoryResult<ProgressPhoto[]>>;
  saveMealLog(input: MealLog): Promise<RepositoryResult<MealLog>>;
  saveProgressPhoto(input: ProgressPhoto): Promise<RepositoryResult<ProgressPhoto>>;
}

export interface AtlasRepository {
  loadConversation(userId: EntityId): Promise<RepositoryResult<AtlasConversationEntry[]>>;
  rememberConversation(userId: EntityId, entry: AtlasConversationEntry): Promise<RepositoryResult<AtlasConversationEntry>>;
}

export interface NotificationRepository extends Repository<Notification> {
  listUnread(userId: EntityId): Promise<RepositoryResult<Notification[]>>;
  markRead(id: EntityId): Promise<RepositoryResult<Notification>>;
}

export interface AchievementRepository extends Repository<Achievement> {
  listForUser(userId: EntityId): Promise<RepositoryResult<Achievement[]>>;
}

export interface OrganizationRepository extends Repository<Organization, Omit<Organization, "id" | "createdAt" | "updatedAt">> {
  findBySlug(slug: string): Promise<RepositoryResult<Organization | null>>;
}
