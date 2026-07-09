import type { BackendProvider } from "../api";
import { appConfig } from "../config";
import type { EntityId, Organization } from "../types/domain";
import type { ListResult, QueryOptions, RepositoryResult } from "./base";

const now = "2026-07-08T00:00:00.000Z";

export type OrganizationStatus = "active" | "trialing" | "past_due" | "cancelled" | "archived";

export const defaultOrganization: Organization = {
  id: "org-gymcord",
  name: "GymCord",
  slug: "gymcord",
  ownerUserId: "demo-user",
  defaultGymId: "gym-main",
  createdAt: now,
  updatedAt: now,
  brand: {
    appName: "GymCord",
    logoUrl: "",
    primaryColor: "#ff4fa0",
    secondaryColor: "#ff8a65",
    accentColor: "#ff7ab8",
    typography: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  theme: { mode: "dark", radius: "rounded" },
  memberIds: ["demo-user"],
  trainerIds: [],
  gymIds: ["gym-main"],
  planIds: ["plan-foundation"],
  billing: { provider: "manual", status: "trialing" },
  settings: { allowMemberSignup: true, requireTrainerApproval: false, timezone: "Etc/UTC" },
  routing: { subdomains: ["gym1", "gym2"], customDomains: ["trainer.company.com"] },
};

const createOrganization = (organization: Organization): Organization => organization;

export const adminOrganizations: Organization[] = [
  defaultOrganization,
  createOrganization({
    ...defaultOrganization,
    id: "org-gym-a",
    name: "Gym A Performance",
    slug: "gym-a",
    ownerUserId: "owner-gym-a",
    defaultGymId: "gym-a-main",
    brand: { ...defaultOrganization.brand, appName: "Gym A", primaryColor: "#4f46e5", secondaryColor: "#22c55e", accentColor: "#38bdf8" },
    memberIds: ["member-a-1", "member-a-2", "member-a-3"],
    trainerIds: ["trainer-a-1", "trainer-a-2"],
    gymIds: ["gym-a-main", "gym-a-south"],
    planIds: ["plan-enterprise"],
    billing: { provider: "stripe", status: "active", customerId: "cus_gym_a" },
    routing: { subdomains: ["gyma"], customDomains: ["app.gyma.example.com"] },
  }),
  createOrganization({
    ...defaultOrganization,
    id: "org-gym-b",
    name: "Gym B Athletics",
    slug: "gym-b",
    ownerUserId: "owner-gym-b",
    defaultGymId: "gym-b-main",
    brand: { ...defaultOrganization.brand, appName: "Gym B", primaryColor: "#f97316", secondaryColor: "#111827", accentColor: "#fde047" },
    memberIds: ["member-b-1", "member-b-2"],
    trainerIds: ["trainer-b-1"],
    gymIds: ["gym-b-main"],
    planIds: ["plan-growth"],
    billing: { provider: "stripe", status: "past_due", customerId: "cus_gym_b" },
    routing: { subdomains: ["gymb"], customDomains: ["train.gymb.example.com"] },
  }),
  createOrganization({
    ...defaultOrganization,
    id: "org-trainer-independent",
    name: "Independent Trainer",
    slug: "independent-trainer",
    ownerUserId: "trainer-owner",
    defaultGymId: undefined,
    brand: { ...defaultOrganization.brand, appName: "Trainer Pro", primaryColor: "#14b8a6", secondaryColor: "#0f172a", accentColor: "#a78bfa" },
    memberIds: ["client-1", "client-2"],
    trainerIds: ["trainer-independent"],
    gymIds: [],
    planIds: ["plan-trainer-business"],
    billing: { provider: "manual", status: "trialing" },
    routing: { subdomains: ["trainerpro"], customDomains: ["coach.example.com"] },
  }),
];

export function getOrganizationStatus(organization: Organization): OrganizationStatus {
  if (organization.deletedAt) return "archived";
  return organization.billing.status;
}

const endpoint = appConfig.backend.endpoints.organizations;

export class OrganizationRepository {
  constructor(private readonly backend: BackendProvider) {}

  async findById(id: EntityId): Promise<RepositoryResult<Organization | null>> {
    const result = await this.backend.request<Organization | null>({ method: "GET", path: `${endpoint}/${id}`, headers: {}, retryAttempts: appConfig.backend.retryAttempts, timeoutMs: appConfig.backend.timeoutMs, queuedWhenOffline: false });
    return { data: result.data, source: result.source };
  }

  async findBySlug(slug: string): Promise<RepositoryResult<Organization | null>> {
    const result = await this.backend.request<Organization | null>({ method: "GET", path: `${endpoint}/slug/${slug}`, headers: {}, retryAttempts: appConfig.backend.retryAttempts, timeoutMs: appConfig.backend.timeoutMs, queuedWhenOffline: false });
    return { data: result.data, source: result.source };
  }

  async list(_options?: QueryOptions): Promise<RepositoryResult<ListResult<Organization>>> {
    const result = await this.backend.request<ListResult<Organization>>({ method: "GET", path: endpoint, headers: {}, retryAttempts: appConfig.backend.retryAttempts, timeoutMs: appConfig.backend.timeoutMs, queuedWhenOffline: false });
    return { data: result.data, source: result.source };
  }

  async create(input: Omit<Organization, "id" | "createdAt" | "updatedAt">): Promise<RepositoryResult<Organization>> {
    const result = await this.backend.request<Organization>({ method: "POST", path: endpoint, body: input, headers: {}, retryAttempts: appConfig.backend.retryAttempts, timeoutMs: appConfig.backend.timeoutMs, queuedWhenOffline: true });
    return { data: result.data, source: result.source };
  }

  async update(id: EntityId, input: Partial<Organization>): Promise<RepositoryResult<Organization>> {
    const result = await this.backend.request<Organization>({ method: "PATCH", path: `${endpoint}/${id}`, body: input, headers: {}, retryAttempts: appConfig.backend.retryAttempts, timeoutMs: appConfig.backend.timeoutMs, queuedWhenOffline: true });
    return { data: result.data, source: result.source };
  }

  async archive(id: EntityId): Promise<RepositoryResult<Organization>> {
    return this.update(id, { deletedAt: new Date().toISOString() });
  }

  async restore(id: EntityId): Promise<RepositoryResult<Organization>> {
    return this.update(id, { deletedAt: undefined });
  }

  async search(query: string): Promise<RepositoryResult<ListResult<Organization>>> {
    const listed = await this.list();
    const normalized = query.trim().toLowerCase();
    const items = listed.data.items.filter((organization) => !normalized || organization.name.toLowerCase().includes(normalized) || organization.slug.toLowerCase().includes(normalized));
    return { data: { items }, source: listed.source };
  }

  async delete(id: EntityId): Promise<void> {
    await this.archive(id);
  }
}
