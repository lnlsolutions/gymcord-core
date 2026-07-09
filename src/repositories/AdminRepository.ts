import { apiClient, createBackendProvider } from "../api/client";
import { appConfig } from "../config";
import { offlineEngine, type QueuedWrite } from "../services/sync";
import type { EntityId, IsoDateTimeString, Organization } from "../types/domain";
import { billingRepository, type BillingSnapshot } from "./BillingRepository";
import { defaultOrganization, OrganizationRepository } from "./OrganizationRepository";
import { tenancyRepository } from "./TenancyRepository";
import type { RepositoryResult } from "./base";

export type WhiteLabelPreview = "GymCord Consumer" | "Gym Enterprise" | "Trainer Business";

export interface AdminTenantContext {
  activeTenantId: EntityId;
  activeOrganizationId: EntityId;
  activeOrganizationName: string;
  branding: Organization["brand"];
  permissions: string[];
  enabledFeatures: string[];
  navigationVisibility: Record<"memberApp" | "trainerPortal" | "billing" | "adminOperations", boolean>;
  billingState: Organization["billing"];
  switchHistory: { tenantId: EntityId; organizationId: EntityId; switchedAt: IsoDateTimeString; metadataOnly: true }[];
}

export interface AdminImpersonationContext {
  actorUserId: EntityId;
  viewedUserId: EntityId;
  organizationId: EntityId;
  mode: "metadata_only";
  securityBypass: false;
  authBypass: false;
  repositoryMetadataOnly: true;
  reason: string;
  viewedAt: IsoDateTimeString;
}

export interface AdminDashboard {
  tenant: AdminTenantContext;
  organizations: Organization[];
  billing: BillingSnapshot;
  whiteLabelPreviews: Record<WhiteLabelPreview, { appName: WhiteLabelPreview; enabledFeatures: string[]; canSwitchWithoutLogout: true }>;
  impersonation: AdminImpersonationContext;
  integrationReadiness: Record<"multiTenantFoundation" | "whiteLabelPreview" | "billing" | "trainerPortal" | "memberApp" | "adminOperations", "ready">;
  optimisticUpdates: { tenantSwitching: true; adminUpdates: true };
  providerRouting: { mockModeWorks: boolean; supabaseModeProviderMappingsOnly: boolean };
}

const adminPath = "/adminDashboards";
const adminAuditPath = "/adminAuditEvents";
const queueablePaths = [adminPath, adminAuditPath, "/organizations"];
const now = () => new Date().toISOString();
const source = (sourceName: string): RepositoryResult<unknown>["source"] => sourceName === "mock" || sourceName === "cache" ? sourceName : "remote";

export class AdminRepository {
  private readonly organizations = new OrganizationRepository(createBackendProvider());

  seedDashboard(): AdminDashboard {
    const timestamp = now();
    const organization = defaultOrganization;
    return {
      tenant: {
        activeTenantId: organization.defaultGymId ?? organization.id,
        activeOrganizationId: organization.id,
        activeOrganizationName: organization.name,
        branding: organization.brand,
        permissions: ["admin:dashboard", "organizations:manage", "billing:view", "tenants:switch", "impersonation:view_metadata"],
        enabledFeatures: ["member_app", "trainer_portal", "billing", "admin_operations", "white_label_preview"],
        navigationVisibility: { memberApp: true, trainerPortal: true, billing: true, adminOperations: true },
        billingState: organization.billing,
        switchHistory: [{ tenantId: organization.defaultGymId ?? organization.id, organizationId: organization.id, switchedAt: timestamp, metadataOnly: true }],
      },
      organizations: [organization],
      billing: billingRepository.seedSamples(organization.id),
      whiteLabelPreviews: {
        "GymCord Consumer": { appName: "GymCord Consumer", enabledFeatures: ["member_app", "atlas", "progress"], canSwitchWithoutLogout: true },
        "Gym Enterprise": { appName: "Gym Enterprise", enabledFeatures: ["admin_operations", "billing", "trainer_portal", "member_app"], canSwitchWithoutLogout: true },
        "Trainer Business": { appName: "Trainer Business", enabledFeatures: ["trainer_portal", "program_builder", "messaging"], canSwitchWithoutLogout: true },
      },
      impersonation: { actorUserId: "admin-demo", viewedUserId: "member-demo", organizationId: organization.id, mode: "metadata_only", securityBypass: false, authBypass: false, repositoryMetadataOnly: true, reason: "support_preview", viewedAt: timestamp },
      integrationReadiness: { multiTenantFoundation: "ready", whiteLabelPreview: "ready", billing: "ready", trainerPortal: "ready", memberApp: "ready", adminOperations: "ready" },
      optimisticUpdates: { tenantSwitching: true, adminUpdates: true },
      providerRouting: { mockModeWorks: appConfig.backend.provider === "mock", supabaseModeProviderMappingsOnly: true },
    };
  }

  async loadDashboard(organizationId: EntityId = defaultOrganization.id): Promise<RepositoryResult<AdminDashboard>> {
    const seeded = this.seedDashboard();
    try {
      const [organizations, billing, tenancy] = await Promise.all([
        this.organizations.list(),
        billingRepository.loadSnapshot(organizationId),
        tenancyRepository.loadSnapshot(),
      ]);
      const activeOrganization = organizations.data.items.find((item) => item.id === organizationId) ?? organizations.data.items[0] ?? seeded.organizations[0];
      return { data: { ...seeded, organizations: organizations.data.items.length ? organizations.data.items : seeded.organizations, billing: billing.data, tenant: { ...seeded.tenant, activeOrganizationId: activeOrganization.id, activeOrganizationName: activeOrganization.name, activeTenantId: activeOrganization.defaultGymId ?? tenancy.data.activeGymId, branding: activeOrganization.brand, billingState: activeOrganization.billing, enabledFeatures: tenancy.data.branding.enabledFeatures } }, source: organizations.source };
    } catch {
      return { data: seeded, source: "mock" };
    }
  }

  async switchTenant(input: { tenantId: EntityId; organizationId: EntityId; organization?: Organization }): Promise<RepositoryResult<AdminTenantContext>> {
    const current = this.seedDashboard().tenant;
    const organization = input.organization ?? defaultOrganization;
    const switchedAt = now();
    const next: AdminTenantContext = { ...current, activeTenantId: input.tenantId, activeOrganizationId: input.organizationId, activeOrganizationName: organization.name, branding: organization.brand, billingState: organization.billing, permissions: current.permissions, enabledFeatures: current.enabledFeatures, navigationVisibility: current.navigationVisibility, switchHistory: [{ tenantId: input.tenantId, organizationId: input.organizationId, switchedAt, metadataOnly: true }, ...current.switchHistory] };
    const response = await apiClient.post<AdminTenantContext, AdminTenantContext>(adminPath, next, { queueWhenOffline: true });
    return { data: response.data ?? next, source: source(response.source) };
  }

  async viewAs(input: Omit<AdminImpersonationContext, "mode" | "securityBypass" | "authBypass" | "repositoryMetadataOnly" | "viewedAt">): Promise<RepositoryResult<AdminImpersonationContext>> {
    const payload: AdminImpersonationContext = { ...input, mode: "metadata_only", securityBypass: false, authBypass: false, repositoryMetadataOnly: true, viewedAt: now() };
    const response = await apiClient.post<AdminImpersonationContext, AdminImpersonationContext>(adminAuditPath, payload, { queueWhenOffline: true });
    return { data: response.data ?? payload, source: source(response.source) };
  }

  getOfflineQueue(): QueuedWrite[] { return offlineEngine.getQueue().filter((item) => queueablePaths.some((path) => item.entity === path || item.entity.startsWith(`${path}/`))); }
}

export const adminRepository = new AdminRepository();
