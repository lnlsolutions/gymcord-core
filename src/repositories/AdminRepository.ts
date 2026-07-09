import { appConfig } from "../config";
import { apiClient } from "../api/client";
import { offlineEngine, type QueuedWrite } from "../services/sync";
import type { EntityId, IsoDateTimeString, MembershipRole, Organization } from "../types/domain";
import type { RepositoryResult } from "./base";
import { adminOrganizations, getOrganizationStatus, type OrganizationStatus } from "./OrganizationRepository";

export type AdminTenantKind = "consumer" | "gym_enterprise" | "trainer_business";
export type AdminImpersonationRole = "gym" | "trainer" | "member";
export type AdminBillingState = "trialing" | "active" | "past_due" | "cancelled" | "comped";

export interface AdminPerson { id: EntityId; name: string; email: string; organizationId: EntityId; role: MembershipRole; status: "active" | "invited" | "paused"; }
export interface AdminGym { id: EntityId; name: string; organizationId: EntityId; timezone: string; status: "active" | "archived"; memberCount: number; trainerCount: number; }
export interface AdminSubscription { id: EntityId; organizationId: EntityId; planName: string; billingState: AdminBillingState; seats: number; renewalDate: string; }
export interface TenantSwitchHistoryEntry { id: EntityId; fromOrganizationId?: EntityId; toOrganizationId: EntityId; tenantKind: AdminTenantKind; switchedAt: IsoDateTimeString; metadataOnly: true; }
export interface AdminImpersonationTarget { id: EntityId; role: AdminImpersonationRole; organizationId: EntityId; displayName: string; metadataOnly: true; securityBypass: false; authBypass: false; startedAt: IsoDateTimeString; }

export interface AdminTenantContext {
  tenantKind: AdminTenantKind;
  organization: Organization;
  branding: Organization["brand"];
  permissions: string[];
  enabledFeatures: string[];
  navigation: string[];
  billingState: AdminBillingState;
}

export interface AdminDashboardSnapshot {
  activeProvider: string;
  activeTenant: AdminTenantContext;
  impersonationTarget?: AdminImpersonationTarget;
  organizations: Organization[];
  organizationStatuses: Record<EntityId, OrganizationStatus>;
  gyms: AdminGym[];
  trainers: AdminPerson[];
  members: AdminPerson[];
  subscriptions: AdminSubscription[];
  featureFlags: Record<EntityId, string[]>;
  tenantSwitchHistory: TenantSwitchHistoryEntry[];
  pendingSync: QueuedWrite[];
  saveStatus: "seeded" | "saved" | "queued";
}

const now = () => new Date().toISOString();
const adminPaths = { context: "/adminTenantContext", impersonation: "/adminImpersonation" } as const;

const featureFlags: Record<string, string[]> = {
  "org-gymcord": ["consumer_app", "atlas_coach", "progress", "nutrition"],
  "org-gym-a": ["member_app", "trainer_portal", "billing", "white_label", "feature_flags"],
  "org-gym-b": ["member_app", "trainer_portal", "billing", "white_label", "branding_preview"],
  "org-trainer-independent": ["trainer_business", "client_roster", "calendar", "messaging"],
};

const permissionMap: Record<AdminTenantKind, string[]> = {
  consumer: ["dashboard:view", "profile:manage", "coach:use"],
  gym_enterprise: ["admin:organizations", "gym:manage", "trainer:manage", "member:view", "billing:view", "branding:manage", "features:manage"],
  trainer_business: ["trainer:business", "member:view", "program:manage", "calendar:manage", "messaging:send"],
};

function tenantKindForOrganization(organization: Organization): AdminTenantKind {
  if (organization.id === "org-gymcord") return "consumer";
  if (organization.trainerIds.length > 0 && organization.gymIds.length === 0) return "trainer_business";
  return "gym_enterprise";
}

function navigationFor(kind: AdminTenantKind) {
  if (kind === "consumer") return ["Home", "Train", "Meals", "Progress", "Coach"];
  if (kind === "trainer_business") return ["Trainer OS", "Clients", "Calendar", "Messages", "Billing"];
  return ["Admin", "Gyms", "Trainers", "Members", "Subscriptions", "Branding", "Feature Flags"];
}

export class AdminRepository {
  seedDashboard(activeOrganizationId = "org-gym-a"): AdminDashboardSnapshot {
    const organizations = adminOrganizations;
    const active = organizations.find((organization) => organization.id === activeOrganizationId) ?? organizations[0];
    const activeTenant = this.buildTenantContext(active);
    const gyms: AdminGym[] = organizations.flatMap((organization) => organization.gymIds.map((gymId, index) => ({ id: gymId, organizationId: organization.id, name: `${organization.name} ${index + 1}`, timezone: organization.settings.timezone, status: getOrganizationStatus(organization) === "archived" ? "archived" : "active", memberCount: organization.memberIds.length, trainerCount: organization.trainerIds.length })));
    const trainers: AdminPerson[] = organizations.flatMap((organization) => organization.trainerIds.map((id, index) => ({ id, organizationId: organization.id, name: `${organization.name} Trainer ${index + 1}`, email: `${id}@example.com`, role: "trainer", status: "active" })));
    const members: AdminPerson[] = organizations.flatMap((organization) => organization.memberIds.map((id, index) => ({ id, organizationId: organization.id, name: `${organization.name} Member ${index + 1}`, email: `${id}@example.com`, role: "member", status: "active" })));
    const subscriptions: AdminSubscription[] = organizations.map((organization) => ({ id: `sub-${organization.id}`, organizationId: organization.id, planName: organization.planIds[0] ?? "manual", billingState: organization.billing.status, seats: organization.memberIds.length + organization.trainerIds.length, renewalDate: "2026-08-01" }));
    return { activeProvider: appConfig.backend.provider, activeTenant, organizations, organizationStatuses: Object.fromEntries(organizations.map((organization) => [organization.id, getOrganizationStatus(organization)])), gyms, trainers, members, subscriptions, featureFlags, tenantSwitchHistory: [], pendingSync: this.getPendingSync(), saveStatus: "seeded" };
  }

  async loadDashboard(activeOrganizationId = "org-gym-a"): Promise<RepositoryResult<AdminDashboardSnapshot>> {
    try {
      const response = await apiClient.get<AdminDashboardSnapshot>(`${adminPaths.context}/${activeOrganizationId}`);
      return { data: response.data ?? this.seedDashboard(activeOrganizationId), source: response.source === "cache" ? "cache" : response.source === "mock" ? "mock" : "remote" };
    } catch {
      return { data: this.seedDashboard(activeOrganizationId), source: "mock" };
    }
  }

  async switchTenant(current: AdminDashboardSnapshot, organizationId: EntityId): Promise<RepositoryResult<AdminDashboardSnapshot>> {
    const organization = current.organizations.find((item) => item.id === organizationId) ?? current.organizations[0];
    const switched: TenantSwitchHistoryEntry = { id: crypto.randomUUID(), fromOrganizationId: current.activeTenant.organization.id, toOrganizationId: organization.id, tenantKind: tenantKindForOrganization(organization), switchedAt: now(), metadataOnly: true };
    const next = { ...current, activeTenant: this.buildTenantContext(organization), tenantSwitchHistory: [switched, ...current.tenantSwitchHistory], saveStatus: navigator.onLine ? "saved" as const : "queued" as const };
    await apiClient.post(adminPaths.context, { activeOrganizationId: organization.id, switched }, { queueWhenOffline: true });
    return { data: { ...next, pendingSync: this.getPendingSync() }, source: navigator.onLine ? "remote" : "cache" };
  }

  async viewAs(current: AdminDashboardSnapshot, role: AdminImpersonationRole): Promise<RepositoryResult<AdminDashboardSnapshot>> {
    const organizationId = current.activeTenant.organization.id;
    const source = role === "trainer" ? current.trainers.find((item) => item.organizationId === organizationId) : role === "member" ? current.members.find((item) => item.organizationId === organizationId) : current.gyms.find((item) => item.organizationId === organizationId);
    const target: AdminImpersonationTarget = { id: source?.id ?? `${role}-${organizationId}`, role, organizationId, displayName: source?.name ?? `${role} preview`, metadataOnly: true, securityBypass: false, authBypass: false, startedAt: now() };
    await apiClient.post(adminPaths.impersonation, target, { queueWhenOffline: true });
    return { data: { ...current, impersonationTarget: target, saveStatus: navigator.onLine ? "saved" : "queued", pendingSync: this.getPendingSync() }, source: navigator.onLine ? "remote" : "cache" };
  }

  getPendingSync(): QueuedWrite[] { return offlineEngine.getQueue().filter((item) => item.entity.startsWith("/admin") || item.entity.startsWith("/organizations")); }

  private buildTenantContext(organization: Organization): AdminTenantContext {
    const tenantKind = tenantKindForOrganization(organization);
    return { tenantKind, organization, branding: organization.brand, permissions: permissionMap[tenantKind], enabledFeatures: featureFlags[organization.id] ?? [], navigation: navigationFor(tenantKind), billingState: organization.billing.status };
  }
}

export const adminRepository = new AdminRepository();
