import type { EntityId, Organization } from "../types/domain";
import type { ListResult, QueryOptions, RepositoryResult } from "./base";
import { appConfig } from "../config";

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

const storageKey = `${appConfig.appName}:organizations`;

function loadOrganizations(): Organization[] {
  if (typeof localStorage === "undefined") return [defaultOrganization];
  const raw = localStorage.getItem(storageKey);
  if (!raw) return [defaultOrganization];

  try {
    return JSON.parse(raw) as Organization[];
  } catch {
    return [defaultOrganization];
  }
}

function saveOrganizations(organizations: Organization[]) {
  if (typeof localStorage !== "undefined") localStorage.setItem(storageKey, JSON.stringify(organizations));
}

export class OrganizationRepository {
  async findById(id: EntityId): Promise<RepositoryResult<Organization | null>> {
    return { data: loadOrganizations().find((organization) => organization.id === id) ?? null, source: "cache" };
  }

  async findBySlug(slug: string): Promise<RepositoryResult<Organization | null>> {
    return { data: loadOrganizations().find((organization) => organization.slug === slug) ?? null, source: "cache" };
  }

  async list(_options?: QueryOptions): Promise<RepositoryResult<ListResult<Organization>>> {
    return { data: { items: loadOrganizations() }, source: "cache" };
  }

  async create(input: Omit<Organization, "id" | "createdAt" | "updatedAt">): Promise<RepositoryResult<Organization>> {
    const organizations = loadOrganizations();
    const organization: Organization = { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    saveOrganizations([...organizations, organization]);
    return { data: organization, source: "cache" };
  }

  async update(id: EntityId, input: Partial<Organization>): Promise<RepositoryResult<Organization>> {
    const organizations = loadOrganizations();
    const existing = organizations.find((organization) => organization.id === id);
    if (!existing) throw new Error(`Organization ${id} was not found.`);
    const updated: Organization = { ...existing, ...input, updatedAt: new Date().toISOString() };
    saveOrganizations(organizations.map((organization) => organization.id === id ? updated : organization));
    return { data: updated, source: "cache" };
  }

  async delete(id: EntityId): Promise<void> {
    saveOrganizations(loadOrganizations().filter((organization) => organization.id !== id));
  }
}
