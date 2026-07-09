import { apiClient } from "../api/client";
import type { ListResult, QueryOptions, RepositoryResult } from "./base";
import { offlineEngine } from "../services/sync";
import type { EntityId, Trainer, TrainerAtlasAlert, TrainerCoachNote, TrainerProgramAssignment, TrainerSummary, TrainerTask } from "../types/domain";

export type CreateTrainerInput = Omit<Trainer, "id" | "createdAt" | "updatedAt"> & Partial<Pick<Trainer, "id" | "createdAt" | "updatedAt">>;
export type UpdateTrainerInput = Partial<Omit<Trainer, "id" | "createdAt" | "updatedAt">>;

const trainerPath = "/trainerProfiles";

const assignmentPath = "/trainerProgramAssignments";
const notePath = "/trainerCoachNotes";
const taskPath = "/trainerTasks";
const alertPath = "/trainerAtlasAlerts";

export interface TrainerPortalState {
  summary: TrainerSummary;
  assignments: TrainerProgramAssignment[];
  notes: TrainerCoachNote[];
  tasks: TrainerTask[];
  alerts: TrainerAtlasAlert[];
  pendingSync: number;
  offlineQueueLength: number;
  saveStatus: string;
}

const demoAssignments: TrainerProgramAssignment[] = [
  { id: "assign_ava", organizationId: "org_demo", trainerId: "trainer_demo", memberId: "member_ava", programId: "program_strength_01", programTitle: "Strength Foundation", startsOn: new Date().toISOString().slice(0, 10), status: "active", createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: "assign_miles", organizationId: "org_demo", trainerId: "trainer_demo", memberId: "member_miles", programId: "program_habit_01", programTitle: "Consistency Builder", startsOn: new Date().toISOString().slice(0, 10), status: "active", createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
];
const demoNotes: TrainerCoachNote[] = [{ id: "note_ava", organizationId: "org_demo", trainerId: "trainer_demo", memberId: "member_ava", body: "Increase lower-body volume if recovery remains high this week.", pinned: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() }];
const demoTasks: TrainerTask[] = [
  { id: "task_checkins", organizationId: "org_demo", trainerId: "trainer_demo", title: "Review low-compliance check-ins", dueOn: new Date().toISOString().slice(0, 10), status: "open", createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: "task_programs", organizationId: "org_demo", trainerId: "trainer_demo", memberId: "member_noor", title: "Assign nutrition reset phase 2", dueOn: new Date().toISOString().slice(0, 10), status: "open", createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
];
const demoAlerts: TrainerAtlasAlert[] = [{ id: "alert_miles", organizationId: "org_demo", trainerId: "trainer_demo", memberId: "member_miles", title: "Compliance drop", description: "Workout and nutrition adherence both fell below 65%.", priority: "High", resolved: false, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() }];

const now = () => new Date().toISOString();

function toRepositorySource(source: string): RepositoryResult<Trainer>["source"] {
  return source === "mock" || source === "cache" ? source : "remote";
}

function normalizeTrainer(input: Partial<Trainer> & Pick<Trainer, "userId">): Trainer {
  const timestamp = now();
  return {
    id: input.id ?? crypto.randomUUID(),
    userId: input.userId,
    organizationIds: input.organizationIds ?? [],
    specialties: input.specialties ?? [],
    bio: input.bio,
    createdAt: input.createdAt ?? timestamp,
    updatedAt: input.updatedAt ?? timestamp,
  };
}

export class TrainerRepository {
  async findById(id: EntityId): Promise<RepositoryResult<Trainer | null>> {
    const response = await apiClient.get<Trainer | null>(`${trainerPath}/${id}`);
    return { data: response.data, source: toRepositorySource(response.source) };
  }

  async list(options?: QueryOptions): Promise<RepositoryResult<ListResult<Trainer>>> {
    const response = await apiClient.get<ListResult<Trainer>>(trainerPath, { headers: options?.organizationId ? { "x-organization-id": options.organizationId } : undefined });
    const items = response.data.items ?? [];
    const filteredItems = options?.organizationId ? items.filter((trainer) => trainer.organizationIds.includes(options.organizationId as EntityId)) : items;
    return { data: { items: filteredItems.slice(0, options?.limit ?? filteredItems.length), nextCursor: response.data.nextCursor }, source: toRepositorySource(response.source) };
  }

  async listByOrganization(organizationId: EntityId): Promise<RepositoryResult<Trainer[]>> {
    const result = await this.list({ organizationId });
    return { data: result.data.items, source: result.source };
  }

  async create(input: CreateTrainerInput): Promise<RepositoryResult<Trainer>> {
    const trainer = normalizeTrainer(input);
    const response = await apiClient.post<Trainer, Trainer>(trainerPath, trainer, { queueWhenOffline: true });
    return { data: response.data, source: toRepositorySource(response.source) };
  }

  async update(id: EntityId, input: UpdateTrainerInput): Promise<RepositoryResult<Trainer>> {
    const response = await apiClient.patch<Trainer, UpdateTrainerInput & { updatedAt: string }>(`${trainerPath}/${id}`, { ...input, updatedAt: now() }, { queueWhenOffline: true });
    return { data: response.data, source: toRepositorySource(response.source) };
  }

  async delete(id: EntityId): Promise<void> {
    await apiClient.delete(`${trainerPath}/${id}`, { queueWhenOffline: true });
  }

  async getPortalState(trainerId: EntityId, organizationId: EntityId): Promise<RepositoryResult<TrainerPortalState>> {
    const [assignments, notes, tasks, alerts] = await Promise.all([
      this.listCollection<TrainerProgramAssignment>(assignmentPath, demoAssignments, trainerId, organizationId),
      this.listCollection<TrainerCoachNote>(notePath, demoNotes, trainerId, organizationId),
      this.listCollection<TrainerTask>(taskPath, demoTasks, trainerId, organizationId),
      this.listCollection<TrainerAtlasAlert>(alertPath, demoAlerts, trainerId, organizationId),
    ]);
    const queue = offlineEngine.getQueue().filter((write) => write.entity.includes("trainer"));
    const summary: TrainerSummary = {
      trainerId,
      organizationId,
      activeMembers: 0,
      assignedPrograms: assignments.data.length,
      averageWorkoutCompliance: 77,
      averageNutritionCompliance: 78,
      openAlerts: alerts.data.filter((alert) => !alert.resolved).length,
      openTasks: tasks.data.filter((task) => task.status === "open").length,
    };
    return { data: { summary, assignments: assignments.data, notes: notes.data, tasks: tasks.data, alerts: alerts.data, pendingSync: queue.length, offlineQueueLength: queue.length, saveStatus: queue.length ? "Queued for sync" : "Saved" }, source: assignments.source };
  }

  async assignProgram(input: Omit<TrainerProgramAssignment, "id" | "createdAt" | "updatedAt">): Promise<RepositoryResult<TrainerProgramAssignment>> {
    const timestamp = now();
    const assignment = { ...input, id: crypto.randomUUID(), createdAt: timestamp, updatedAt: timestamp };
    const response = await apiClient.post<TrainerProgramAssignment, TrainerProgramAssignment>(assignmentPath, assignment, { queueWhenOffline: true });
    return { data: response.data ?? assignment, source: toRepositorySource(response.source) };
  }

  async saveNote(input: Omit<TrainerCoachNote, "id" | "createdAt" | "updatedAt">): Promise<RepositoryResult<TrainerCoachNote>> {
    const timestamp = now();
    const note = { ...input, id: crypto.randomUUID(), createdAt: timestamp, updatedAt: timestamp };
    const response = await apiClient.post<TrainerCoachNote, TrainerCoachNote>(notePath, note, { queueWhenOffline: true });
    return { data: response.data ?? note, source: toRepositorySource(response.source) };
  }

  private async listCollection<T extends { trainerId: EntityId; organizationId: EntityId }>(path: string, fallback: T[], trainerId: EntityId, organizationId: EntityId): Promise<RepositoryResult<T[]>> {
    try {
      const response = await apiClient.get<ListResult<T>>(path, { headers: { "x-organization-id": organizationId } });
      const items = response.data.items?.length ? response.data.items : fallback;
      return { data: items.filter((item) => item.trainerId === trainerId && item.organizationId === organizationId), source: toRepositorySource(response.source) };
    } catch {
      return { data: fallback.filter((item) => item.trainerId === trainerId && item.organizationId === organizationId), source: "mock" };
    }
  }

}

export const trainerRepository = new TrainerRepository();
