import type { BackendProvider } from "../api";
import { appConfig } from "../config";
import type { EntityId, Organization } from "../types/domain";
import type { ListResult, QueryOptions, RepositoryResult } from "./base";

const now = "2026-07-08T00:00:00.000Z";

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

  async delete(id: EntityId): Promise<void> {
    await this.backend.request<void>({ method: "DELETE", path: `${endpoint}/${id}`, headers: {}, retryAttempts: appConfig.backend.retryAttempts, timeoutMs: appConfig.backend.timeoutMs, queuedWhenOffline: true });
  }
}
