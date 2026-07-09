import { apiClient } from "../api/client";
import { offlineEngine, type QueuedWrite } from "../services/sync";
import type { RepositoryResult } from "./base";
import type { EntityId, IsoDateTimeString } from "../types/domain";

export type TenancyRole = "owner" | "admin" | "trainer" | "member" | "billing";
export type RelationshipStatus = "active" | "invited" | "ended" | "revoked";
export type JoinPath = "consumer_signup" | "trainer_onboarding_link" | "gym_enterprise_onboarding_link";

export interface GymTenant { id: EntityId; name: string; slug: string; domain: string; subdomain: string; status: "active" | "deactivated"; }
export interface GymBranding { activeBrandName: string; logoMediaPlaceholder: string; primaryColor: string; accentColor: string; domain: string; subdomain: string; enabledFeatures: string[]; rolePermissions: Record<TenancyRole, string[]>; onboardingPath: JoinPath; updatedAt: IsoDateTimeString; }
export interface TenantRelationship { id: EntityId; userId: EntityId; gymId: EntityId; trainerId?: EntityId; role: TenancyRole; status: RelationshipStatus; accessOnly: boolean; personalDataOwner: "user"; metadata: Record<string, string>; acceptedAt?: IsoDateTimeString; endedAt?: IsoDateTimeString; updatedAt: IsoDateTimeString; }
export interface TenancySettings { id: EntityId; gymId: EntityId; allowConsumerSignup: boolean; allowTrainerLinks: boolean; allowEnterpriseLinks: boolean; metadataWritesOnly: boolean; updatedAt: IsoDateTimeString; }
export interface TenancySnapshot { activeGymId: EntityId; activeTrainerId?: EntityId; gyms: GymTenant[]; branding: GymBranding; relationships: TenantRelationship[]; settings: TenancySettings; userOwnedAccountModel: string[]; joinPaths: Record<JoinPath, Record<string, string>>; integrationReadiness: Record<"memberApp" | "trainerPortal" | "adminDashboard" | "billing" | "notifications", "ready">; }

const paths = { gyms: "/gyms", relationships: "/tenantRelationships", branding: "/tenantBranding", settings: "/tenantSettings" } as const;
const queueable = [paths.relationships, paths.branding, paths.settings];
const now = () => new Date().toISOString();
const source = (sourceName: string): RepositoryResult<unknown>["source"] => sourceName === "mock" || sourceName === "cache" ? sourceName : "remote";

export class GymRepository {
  async list(): Promise<RepositoryResult<GymTenant[]>> {
    const response = await apiClient.get<{ items: GymTenant[] }>(paths.gyms);
    return { data: response.data.items, source: source(response.source) };
  }
}

export class TenancyRepository {
  seedSnapshot(): TenancySnapshot {
    const timestamp = now();
    const gym: GymTenant = { id: "gym-demo", name: "Atlas Strength Club", slug: "atlas-strength", domain: "atlasstrength.example.com", subdomain: "atlasstrength", status: "active" };
    return {
      activeGymId: gym.id,
      activeTrainerId: "trainer-demo",
      gyms: [gym],
      branding: { activeBrandName: gym.name, logoMediaPlaceholder: "Logo/media upload placeholder", primaryColor: "#4f46e5", accentColor: "#22c55e", domain: gym.domain, subdomain: gym.subdomain, enabledFeatures: ["member_app", "trainer_portal", "billing", "notifications"], rolePermissions: { owner: ["all"], admin: ["manage_members", "manage_branding"], trainer: ["coach_members"], member: ["own_data"], billing: ["manage_billing"] }, onboardingPath: "gym_enterprise_onboarding_link", updatedAt: timestamp },
      relationships: [{ id: "rel-demo", userId: "user-demo", gymId: gym.id, trainerId: "trainer-demo", role: "member", status: "active", accessOnly: true, personalDataOwner: "user", metadata: { inviteMetadata: "source=trainer_link", acceptanceMetadata: "acceptedBy=user-demo", transferMetadata: "user_data_retained" }, acceptedAt: timestamp, updatedAt: timestamp }],
      settings: { id: gym.id, gymId: gym.id, allowConsumerSignup: true, allowTrainerLinks: true, allowEnterpriseLinks: true, metadataWritesOnly: true, updatedAt: timestamp },
      userOwnedAccountModel: ["user account is permanent", "personal data remains user-owned", "gym/trainer relationships only grant access", "user keeps data after leaving gym/trainer"],
      joinPaths: { consumer_signup: { metadata: "campaign, source, requestedGymSlug" }, trainer_onboarding_link: { inviteMetadata: "trainerId, gymId, expiresAt" }, gym_enterprise_onboarding_link: { acceptanceMetadata: "acceptedBy, acceptedAt", transferMetadata: "previousGymId, retainUserData" } },
      integrationReadiness: { memberApp: "ready", trainerPortal: "ready", adminDashboard: "ready", billing: "ready", notifications: "ready" },
    };
  }

  async loadSnapshot(gymId: EntityId = "gym-demo"): Promise<RepositoryResult<TenancySnapshot>> {
    const seeded = this.seedSnapshot();
    try {
      const [gyms, relationships, branding, settings] = await Promise.all([
        apiClient.get<{ items: GymTenant[] }>(paths.gyms), apiClient.get<{ items: TenantRelationship[] }>(paths.relationships), apiClient.get<GymBranding | null>(`${paths.branding}/${gymId}`), apiClient.get<TenancySettings | null>(`${paths.settings}/${gymId}`),
      ]);
      return { data: { ...seeded, gyms: gyms.data.items.length ? gyms.data.items.filter((item) => item.status !== "deactivated") : seeded.gyms, relationships: relationships.data.items.length ? relationships.data.items.filter((item) => item.status !== "revoked") : seeded.relationships, branding: branding.data ?? seeded.branding, settings: settings.data ?? seeded.settings }, source: source(settings.source) };
    } catch {
      return { data: seeded, source: "mock" };
    }
  }

  async switchTenantContext(gymId: EntityId) { return this.updateSettings({ ...this.seedSnapshot().settings, gymId, id: gymId, metadataWritesOnly: true }); }
  async switchTrainerContext(trainerId: EntityId) { return this.updateRelationship({ ...this.seedSnapshot().relationships[0], trainerId, metadata: { contextSwitch: "optimistic" } }); }
  async acceptInvite(input: TenantRelationship) { return this.saveRelationship({ ...input, status: "active", acceptedAt: now(), updatedAt: now() }); }
  async updateRelationship(input: TenantRelationship) { return this.saveRelationship({ ...input, updatedAt: now() }); }
  async revokeAccess(id: EntityId) { return this.patchRelationship(id, { status: "revoked", updatedAt: now(), metadata: { lifecycle: "revoked_not_deleted" } }); }
  async endRelationship(id: EntityId) { return this.patchRelationship(id, { status: "ended", endedAt: now(), updatedAt: now(), metadata: { lifecycle: "ended_not_deleted", dataRetention: "user_keeps_data" } }); }
  async updateBranding(input: GymBranding) { const response = await apiClient.post<GymBranding, GymBranding>(paths.branding, { ...input, updatedAt: now() }, { queueWhenOffline: true }); return { data: response.data ?? input, source: source(response.source) }; }
  async updateSettings(input: TenancySettings) { const response = await apiClient.post<TenancySettings, TenancySettings>(paths.settings, { ...input, updatedAt: now() }, { queueWhenOffline: true }); return { data: response.data ?? input, source: source(response.source) }; }
  getOfflineQueue(): QueuedWrite[] { return offlineEngine.getQueue().filter((item) => queueable.some((path) => item.entity === path || item.entity.startsWith(`${path}/`))); }

  private async saveRelationship(input: TenantRelationship) { const response = await apiClient.post<TenantRelationship, TenantRelationship>(paths.relationships, input, { queueWhenOffline: true }); return { data: response.data ?? input, source: source(response.source) }; }
  private async patchRelationship(id: EntityId, patch: Partial<TenantRelationship>) { const response = await apiClient.patch<TenantRelationship, Partial<TenantRelationship>>(`${paths.relationships}/${id}`, patch, { queueWhenOffline: true }); return { data: response.data, source: source(response.source) }; }
}

export const gymRepository = new GymRepository();
export const tenancyRepository = new TenancyRepository();
