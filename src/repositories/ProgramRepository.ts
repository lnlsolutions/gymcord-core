import { apiClient } from "../api/client";
import { appConfig } from "../config";
import { offlineEngine } from "../services/sync";
import { keyValueStorage } from "../services/storage";
import type { EntityId, IsoDateString, IsoDateTimeString } from "../types/domain";
import type { ListResult, QueryOptions, RepositoryResult } from "./base";

export type ProgramStatus = "draft" | "published" | "archived";
export type ProgramDifficulty = "beginner" | "intermediate" | "advanced";

export interface ProgramSetPrescription { id: EntityId; reps: string; restSeconds: number; tempo: string; weight?: string; notes?: string; }
export interface ProgramExerciseBlock { id: EntityId; exerciseName: string; category: string; notes?: string; sets: ProgramSetPrescription[]; }
export interface ProgramWorkoutDay { id: EntityId; dayOfWeek: number; title: string; focus: string; blocks: ProgramExerciseBlock[]; }
export interface ProgramAssignment { id: EntityId; programId: EntityId; memberId: EntityId; assignedAt: IsoDateTimeString; startsOn: IsoDateString; status: "active" | "scheduled" | "completed" | "cancelled"; }
export interface ProgramTemplate { id: EntityId; title: string; goal: string; difficulty: ProgramDifficulty; weeks: number; description: string; schedule: ProgramWorkoutDay[]; }
export interface Program { id: EntityId; organizationId?: EntityId; trainerId: EntityId; title: string; description: string; goal: string; difficulty: ProgramDifficulty; durationWeeks: number; status: ProgramStatus; schedule: ProgramWorkoutDay[]; assignments: ProgramAssignment[]; templateId?: EntityId; publishedAt?: IsoDateTimeString; createdAt: IsoDateTimeString; updatedAt: IsoDateTimeString; }

export type CreateProgramInput = Omit<Program, "id" | "createdAt" | "updatedAt" | "assignments"> & Partial<Pick<Program, "id" | "createdAt" | "updatedAt" | "assignments">>;
export type UpdateProgramInput = Partial<Omit<Program, "id" | "createdAt" | "updatedAt">>;

const programPath = "/programs";
const cacheKey = `${appConfig.storageKeys.profile}:programs`;
const now = () => new Date().toISOString();
const source = (value: string): RepositoryResult<Program>["source"] => value === "mock" || value === "cache" ? value : "remote";
const uuid = () => crypto.randomUUID();
export const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const programTemplates: ProgramTemplate[] = [
  { id: "template_strength_3day", title: "3-Day Strength Foundation", goal: "Build strength", difficulty: "beginner", weeks: 8, description: "A simple full-body strength plan for consistency.", schedule: [0, 2, 4].map((day, index) => createWorkoutDay(day, ["Full Body A", "Full Body B", "Full Body C"][index], "Strength")) },
  { id: "template_hypertrophy_4day", title: "4-Day Hypertrophy Split", goal: "Build muscle", difficulty: "intermediate", weeks: 10, description: "Upper/lower split with progressive volume.", schedule: [1, 2, 4, 5].map((day, index) => createWorkoutDay(day, ["Upper", "Lower", "Upper Volume", "Lower Volume"][index], "Hypertrophy")) },
  { id: "template_conditioning_5day", title: "5-Day Conditioning", goal: "Improve conditioning", difficulty: "advanced", weeks: 6, description: "Strength maintenance plus high-output conditioning days.", schedule: [1, 2, 3, 4, 6].map((day, index) => createWorkoutDay(day, ["Strength", "Intervals", "Mobility", "Tempo", "Engine"][index], "Conditioning")) },
];

export function createWorkoutDay(dayOfWeek = 1, title = "Workout Day", focus = "Strength"): ProgramWorkoutDay {
  return { id: uuid(), dayOfWeek, title, focus, blocks: [createExerciseBlock()] };
}
export function createExerciseBlock(exerciseName = "Goblet squat"): ProgramExerciseBlock {
  return { id: uuid(), exerciseName, category: "Strength", notes: "Coach cues and substitutions.", sets: [{ id: uuid(), reps: "8-10", restSeconds: 90, tempo: "3-1-1", weight: "RPE 7" }] };
}
function normalize(input: CreateProgramInput): Program {
  const timestamp = now();
  return { id: input.id ?? uuid(), trainerId: input.trainerId, organizationId: input.organizationId, title: input.title, description: input.description, goal: input.goal, difficulty: input.difficulty, durationWeeks: input.durationWeeks, status: input.status ?? "draft", schedule: input.schedule ?? [], assignments: input.assignments ?? [], templateId: input.templateId, publishedAt: input.publishedAt, createdAt: input.createdAt ?? timestamp, updatedAt: input.updatedAt ?? timestamp };
}
function cached(): Program[] { return keyValueStorage.get<Program[]>(cacheKey, []); }
function persist(programs: Program[]) { keyValueStorage.set(cacheKey, programs); }

export class ProgramRepository {
  readonly providerName = appConfig.backend.provider;
  getOfflineQueue() { return offlineEngine.getQueue().filter((write) => write.entity.includes(programPath)); }
  async findById(id: EntityId): Promise<RepositoryResult<Program | null>> { const response = await apiClient.get<Program | null>(`${programPath}/${id}`); return { data: response.data, source: source(response.source) }; }
  async list(options?: QueryOptions): Promise<RepositoryResult<ListResult<Program>>> { const response = await apiClient.get<ListResult<Program>>(programPath, { headers: options?.organizationId ? { "x-organization-id": options.organizationId } : undefined }); const remote = response.data.items ?? []; const items = remote.length ? remote : cached(); if (remote.length) persist(remote); const filtered = options?.organizationId ? items.filter((program) => program.organizationId === options.organizationId) : items; return { data: { items: filtered.slice(0, options?.limit ?? filtered.length), nextCursor: response.data.nextCursor }, source: source(response.source) }; }
  async create(input: CreateProgramInput): Promise<RepositoryResult<Program>> { const optimistic = normalize(input); persist([optimistic, ...cached().filter((program) => program.id !== optimistic.id)]); const response = await apiClient.post<Program, Program>(programPath, optimistic, { queueWhenOffline: true }); return { data: response.data ?? optimistic, source: source(response.source) }; }
  async update(id: EntityId, input: UpdateProgramInput): Promise<RepositoryResult<Program>> { const optimistic = { ...cached().find((program) => program.id === id), ...input, id, updatedAt: now() } as Program; persist(cached().map((program) => program.id === id ? optimistic : program)); const response = await apiClient.patch<Program, UpdateProgramInput & { updatedAt: string }>(`${programPath}/${id}`, { ...input, updatedAt: now() }, { queueWhenOffline: true }); return { data: response.data ?? optimistic, source: source(response.source) }; }
  async delete(id: EntityId): Promise<void> { persist(cached().filter((program) => program.id !== id)); await apiClient.delete(`${programPath}/${id}`, { queueWhenOffline: true }); }
  async duplicate(id: EntityId): Promise<RepositoryResult<Program>> {
    const current = cached().find((program) => program.id === id) ?? (await this.findById(id)).data;
    if (!current) throw new Error("Program not found.");
    return this.create({
      ...current,
      id: uuid(),
      title: `${current.title} Copy`,
      status: "draft",
      publishedAt: undefined,
      assignments: [],
      schedule: current.schedule.map((day) => ({
        ...day,
        id: uuid(),
        blocks: day.blocks.map((block) => ({
          ...block,
          id: uuid(),
          sets: block.sets.map((set) => ({ ...set, id: uuid() })),
        })),
      })),
    });
  }
  async assign(programId: EntityId, memberId: EntityId, startsOn: IsoDateString): Promise<RepositoryResult<Program>> { const program = cached().find((item) => item.id === programId) ?? (await this.findById(programId)).data; if (!program) throw new Error("Program not found."); const assignment: ProgramAssignment = { id: uuid(), programId, memberId, startsOn, assignedAt: now(), status: startsOn > new Date().toISOString().slice(0, 10) ? "scheduled" : "active" }; return this.update(programId, { assignments: [assignment, ...program.assignments] }); }
  async publish(programId: EntityId) { return this.update(programId, { status: "published", publishedAt: now() }); }
  async saveDraft(programId: EntityId, input: UpdateProgramInput) { return this.update(programId, { ...input, status: "draft", publishedAt: undefined }); }
}
export const programRepository = new ProgramRepository();
