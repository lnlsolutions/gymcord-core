import { appConfig } from "../config";
import { createBackendProvider } from "../api/client";
import type { BackendProvider } from "../api";
import type { AuthSession } from "../auth/types";
import type { RepositoryResult } from "./base";

export interface TrainerClientSummary {
  id: string;
  name: string;
  goal: string;
  adherence: number;
  latestWorkoutCompletion: string;
  nutritionCompliance: number;
  progressPhotoStatus: string;
  unreadMessages: number;
  atRisk: boolean;
  riskReason?: string;
}

export interface TrainerClientDetail extends TrainerClientSummary {
  profile: { age: number; gender: string; height: string; currentWeight: string; goalWeight: string; startDate: string };
  goals: string[];
  injuries: string[];
  workoutHistory: { id: string; title: string; completedAt: string; completion: number }[];
  nutritionLogs: { id: string; date: string; calories: number; protein: number; compliance: number }[];
  progressPhotos: { id: string; takenOn: string; angle: string; status: string }[];
  measurements: { date: string; weight: string; waist: string; chest: string }[];
  xpStatus: { totalXp: number; level: number; streakDays: number; streakInDanger: boolean };
  atlasSummary: string;
  trainerNotes: { id: string; note: string; createdAt: string }[];
}

export interface TrainerWorkspaceState {
  provider: string;
  trainerUser: string;
  assignedClients: TrainerClientSummary[];
  sampleClientDetail: TrainerClientDetail | null;
  lastRepositoryStatus: string;
}

type ListResult<T> = { items: T[] };

const trainerStatusKey = "gc.trainer.lastRepositoryStatus";
const trainerNotesKey = "gc.trainer.notes";
const riskFlagsKey = "gc.trainer.riskFlags";

function saved<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) || "") as T; } catch { return fallback; }
}

function save<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function trainerUser(session: AuthSession | null) {
  return session?.user.email ?? session?.user.displayName ?? "demo-trainer@gymcord.app";
}

function organizationId(session: AuthSession | null) {
  return session?.organization?.id ?? session?.user.activeOrganizationId ?? "org-gymcord";
}

const mockClients: TrainerClientDetail[] = [
  {
    id: "client-maya",
    name: "Maya Chen",
    goal: "Build lean strength while reducing body fat",
    adherence: 86,
    latestWorkoutCompletion: "Upper Strength · 92% · yesterday",
    nutritionCompliance: 78,
    progressPhotoStatus: "Front/side/back updated 2 days ago",
    unreadMessages: 2,
    atRisk: false,
    profile: { age: 31, gender: "Female", height: "5'6\"", currentWeight: "151", goalWeight: "142", startDate: "2026-06-01" },
    goals: ["Lose 9 lb", "3 strength sessions weekly", "Hit 125g protein"],
    injuries: ["Prior right knee irritation"],
    workoutHistory: [
      { id: "ws-maya-1", title: "Upper Strength", completedAt: "2026-07-07", completion: 92 },
      { id: "ws-maya-2", title: "Lower Hypertrophy", completedAt: "2026-07-05", completion: 84 },
    ],
    nutritionLogs: [
      { id: "nl-maya-1", date: "2026-07-07", calories: 1840, protein: 128, compliance: 82 },
      { id: "nl-maya-2", date: "2026-07-06", calories: 1960, protein: 116, compliance: 74 },
    ],
    progressPhotos: [{ id: "pp-maya-1", takenOn: "2026-07-06", angle: "front/side/back", status: "complete" }],
    measurements: [{ date: "2026-07-06", weight: "151", waist: "29.5", chest: "36" }],
    xpStatus: { totalXp: 4820, level: 5, streakDays: 9, streakInDanger: false },
    atlasSummary: "Atlas sees strong training consistency and recommends one recovery reminder after lower-body days.",
    trainerNotes: [],
  },
  {
    id: "client-eli",
    name: "Eli Rivera",
    goal: "Return to consistent training after travel",
    adherence: 52,
    latestWorkoutCompletion: "Full Body Reset · 41% · 5 days ago",
    nutritionCompliance: 48,
    progressPhotoStatus: "Missing this week",
    unreadMessages: 5,
    atRisk: true,
    riskReason: "Missed 3 workouts and nutrition under 50%",
    profile: { age: 38, gender: "Male", height: "5'10\"", currentWeight: "204", goalWeight: "190", startDate: "2026-05-12" },
    goals: ["Restart 4-day program", "Log meals 5 days/week", "Drop 14 lb"],
    injuries: ["Low back tightness"],
    workoutHistory: [{ id: "ws-eli-1", title: "Full Body Reset", completedAt: "2026-07-03", completion: 41 }],
    nutritionLogs: [{ id: "nl-eli-1", date: "2026-07-06", calories: 2440, protein: 91, compliance: 48 }],
    progressPhotos: [],
    measurements: [{ date: "2026-06-28", weight: "204", waist: "38", chest: "42" }],
    xpStatus: { totalXp: 2110, level: 3, streakDays: 0, streakInDanger: true },
    atlasSummary: "Atlas flags reduced momentum, missed check-ins, and recommends a trainer nudge with a simplified 20-minute workout.",
    trainerNotes: [],
  },
];

export class TrainerRepository {
  constructor(private readonly backend: BackendProvider = createBackendProvider()) {}

  get providerName() { return this.backend.name; }
  getLastRepositoryStatus() { return saved(trainerStatusKey, "No trainer repository calls yet."); }

  async listAssignedMembers(session: AuthSession | null): Promise<RepositoryResult<TrainerClientSummary[]>> {
    try {
      const result = await this.backend.request<ListResult<TrainerClientSummary>>({ method: "GET", path: "/trainerAssignments", headers: {}, timeoutMs: appConfig.backend.timeoutMs, retryAttempts: 0, queuedWhenOffline: false });
      const items = result.data.items?.length ? result.data.items : mockClients;
      this.setStatus(`Loaded ${items.length} assigned clients for ${trainerUser(session)}`);
      return { data: items.map(toSummary), source: result.source };
    } catch {
      this.setStatus(`Loaded ${mockClients.length} mock assigned clients for ${trainerUser(session)}`);
      return { data: mockClients.map(toSummary), source: "mock" };
    }
  }

  async getClientDetail(session: AuthSession | null, clientId: string): Promise<RepositoryResult<TrainerClientDetail | null>> {
    try {
      const result = await this.backend.request<TrainerClientDetail>({ method: "GET", path: `/trainerClientDetails/${clientId}`, headers: {}, timeoutMs: appConfig.backend.timeoutMs, retryAttempts: 0, queuedWhenOffline: false });
      this.setStatus(`Loaded client detail ${clientId}`);
      return { data: mergeLocal(result.data ?? mockClients.find((client) => client.id === clientId) ?? null), source: result.source };
    } catch {
      this.setStatus(`Loaded mock client detail ${clientId} for ${organizationId(session)}`);
      return { data: mergeLocal(mockClients.find((client) => client.id === clientId) ?? null), source: "mock" };
    }
  }

  async assignWorkout(session: AuthSession | null, clientId: string, workoutId: string): Promise<RepositoryResult<{ clientId: string; workoutId: string }>> {
    const body = { id: crypto.randomUUID(), organizationId: organizationId(session), trainerUser: trainerUser(session), clientId, workoutId, assignedAt: new Date().toISOString() };
    await this.write("assigned workout", "/workoutAssignments", body);
    return { data: { clientId, workoutId }, source: this.backend.name === "mock" ? "mock" : "remote" };
  }

  async addTrainerNote(session: AuthSession | null, clientId: string, note: string): Promise<RepositoryResult<TrainerClientDetail["trainerNotes"][number]>> {
    const record = { id: crypto.randomUUID(), organizationId: organizationId(session), trainerUser: trainerUser(session), clientId, note, createdAt: new Date().toISOString() };
    save(trainerNotesKey, [record, ...saved<any[]>(trainerNotesKey, [])]);
    await this.write("trainer note", "/trainerNotes", record);
    return { data: record, source: this.backend.name === "mock" ? "mock" : "remote" };
  }

  async flagClientRisk(session: AuthSession | null, clientId: string, reason: string): Promise<RepositoryResult<{ clientId: string; reason: string }>> {
    const record = { id: crypto.randomUUID(), organizationId: organizationId(session), trainerUser: trainerUser(session), clientId, reason, flaggedAt: new Date().toISOString() };
    save(riskFlagsKey, [record, ...saved<any[]>(riskFlagsKey, [])]);
    await this.write("client risk flag", "/clientRiskFlags", record);
    return { data: { clientId, reason }, source: this.backend.name === "mock" ? "mock" : "remote" };
  }

  async loadWorkspace(session: AuthSession | null): Promise<TrainerWorkspaceState> {
    const assigned = await this.listAssignedMembers(session);
    const detail = assigned.data[0] ? await this.getClientDetail(session, assigned.data[0].id) : { data: null };
    return { provider: this.backend.name, trainerUser: trainerUser(session), assignedClients: assigned.data, sampleClientDetail: detail.data, lastRepositoryStatus: this.getLastRepositoryStatus() };
  }

  private async write(label: string, path: string, body: Record<string, unknown>) {
    try {
      await this.backend.request({ method: "POST", path, body, headers: {}, timeoutMs: appConfig.backend.timeoutMs, retryAttempts: 0, queuedWhenOffline: true });
      this.setStatus(`Saved ${label} at ${new Date().toLocaleTimeString()}`);
    } catch (error) {
      this.setStatus(`Queued ${label} locally: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  }

  private setStatus(message: string) { save(trainerStatusKey, message); }
}

function toSummary(client: TrainerClientSummary | TrainerClientDetail): TrainerClientSummary {
  return { id: client.id, name: client.name, goal: client.goal, adherence: client.adherence, latestWorkoutCompletion: client.latestWorkoutCompletion, nutritionCompliance: client.nutritionCompliance, progressPhotoStatus: client.progressPhotoStatus, unreadMessages: client.unreadMessages, atRisk: client.atRisk, riskReason: client.riskReason };
}

function mergeLocal(client: TrainerClientDetail | null) {
  if (!client) return null;
  const notes = saved<any[]>(trainerNotesKey, []).filter((note) => note.clientId === client.id);
  const risk = saved<any[]>(riskFlagsKey, []).find((flag) => flag.clientId === client.id);
  return { ...client, trainerNotes: [...notes, ...client.trainerNotes], atRisk: Boolean(risk) || client.atRisk, riskReason: risk?.reason ?? client.riskReason };
}

export const trainerRepository = new TrainerRepository();
