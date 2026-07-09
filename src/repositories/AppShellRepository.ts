import { appConfig } from "../config";
import { adminRepository } from "./AdminRepository";
import { tenancyRepository, type TenancySnapshot, type TenancyRole } from "./TenancyRepository";
import type { RepositoryResult } from "./base";

export type AppMode = "consumer" | "trainer" | "gym" | "admin";
export type AppRouteId = "dashboard" | "workouts" | "nutrition" | "progress" | "atlas" | "trainer" | "program-builder" | "exercise-library" | "calendar" | "messaging" | "notifications" | "check-ins" | "billing" | "tenancy" | "admin";

export interface AppRouteMeta {
  id: AppRouteId;
  label: string;
  path: string;
  description: string;
  modes: AppMode[];
  requiredPermissions: string[];
  featureFlag?: string;
  visible: boolean;
  guardReason?: string;
  betaStatus: "ready" | "beta" | "stub";
}

export interface AppShellSnapshot {
  provider: string;
  activeMode: AppMode;
  activeTenant: { id: string; name: string; slug: string; role: TenancyRole };
  activeTrainer?: { id: string; name: string };
  activeBrand: { name: string; logo: string; primaryColor: string; accentColor: string; domain: string; subdomain: string };
  visibleRoutes: AppRouteMeta[];
  hiddenRoutes: AppRouteMeta[];
  rolePermissions: string[];
  navigationVisibility: Record<string, boolean>;
  routeGuardMetadata: Record<string, { visible: boolean; reason: string; requiredPermissions: string[] }>;
  betaReadinessChecklist: { label: string; ready: boolean }[];
  pendingSync: number;
  saveStatus: "saved" | "pending" | "offline";
}

const allRoutes: Omit<AppRouteMeta, "visible" | "guardReason">[] = [
  { id: "dashboard", label: "Dashboard", path: "/", description: "Mission control, shortcuts, and today snapshot.", modes: ["consumer", "trainer", "gym", "admin"], requiredPermissions: ["own_data"], betaStatus: "ready" },
  { id: "workouts", label: "Workouts", path: "/workouts", description: "Daily training and completion tracking.", modes: ["consumer", "trainer", "gym"], requiredPermissions: ["own_data"], featureFlag: "member_app", betaStatus: "ready" },
  { id: "nutrition", label: "Nutrition", path: "/nutrition", description: "Meal logging and macros.", modes: ["consumer", "trainer", "gym"], requiredPermissions: ["own_data"], featureFlag: "member_app", betaStatus: "ready" },
  { id: "progress", label: "Progress", path: "/progress", description: "Measurements, photos, and transformation timeline.", modes: ["consumer", "trainer", "gym"], requiredPermissions: ["own_data"], featureFlag: "member_app", betaStatus: "ready" },
  { id: "atlas", label: "Atlas Coach", path: "/atlas", description: "AI coaching and memory insights.", modes: ["consumer", "trainer"], requiredPermissions: ["own_data"], betaStatus: "ready" },
  { id: "trainer", label: "Trainer Portal", path: "/trainer", description: "Client roster and trainer operating system.", modes: ["trainer", "gym", "admin"], requiredPermissions: ["coach_members"], featureFlag: "trainer_portal", betaStatus: "ready" },
  { id: "program-builder", label: "Program Builder", path: "/program-builder", description: "Build templates and assign plans.", modes: ["trainer", "gym"], requiredPermissions: ["coach_members"], betaStatus: "beta" },
  { id: "exercise-library", label: "Exercise Library", path: "/exercise-library", description: "Browse reusable exercise metadata.", modes: ["trainer", "gym"], requiredPermissions: ["coach_members"], betaStatus: "beta" },
  { id: "calendar", label: "Calendar", path: "/calendar", description: "Schedule sessions and check-ins.", modes: ["trainer", "gym"], requiredPermissions: ["coach_members"], betaStatus: "beta" },
  { id: "messaging", label: "Messaging", path: "/messaging", description: "Conversations and trainer/member comms.", modes: ["consumer", "trainer", "gym"], requiredPermissions: ["own_data"], betaStatus: "beta" },
  { id: "notifications", label: "Notifications", path: "/notifications", description: "Automation and user alerts.", modes: ["consumer", "trainer", "gym", "admin"], requiredPermissions: ["own_data"], featureFlag: "notifications", betaStatus: "beta" },
  { id: "check-ins", label: "Check-ins", path: "/check-ins", description: "AI and trainer check-in workflows.", modes: ["consumer", "trainer", "gym"], requiredPermissions: ["own_data"], betaStatus: "beta" },
  { id: "billing", label: "Billing", path: "/billing", description: "Plans, subscriptions, and invoices.", modes: ["gym", "admin"], requiredPermissions: ["manage_billing"], featureFlag: "billing", betaStatus: "beta" },
  { id: "tenancy", label: "Tenancy", path: "/tenancy", description: "Gym, trainer, and member relationship metadata.", modes: ["gym", "admin"], requiredPermissions: ["manage_branding"], betaStatus: "beta" },
  { id: "admin", label: "Admin", path: "/admin", description: "Platform admin readiness and metadata-only controls.", modes: ["admin"], requiredPermissions: ["all"], betaStatus: "beta" },
];

export class AppShellRepository {
  private roleForMode(mode: AppMode): TenancyRole { return mode === "admin" ? "owner" : mode === "gym" ? "admin" : mode === "trainer" ? "trainer" : "member"; }

  async loadSnapshot(mode: AppMode = "consumer"): Promise<RepositoryResult<AppShellSnapshot>> {
    const [tenancy, admin] = await Promise.all([tenancyRepository.loadSnapshot(), adminRepository.loadDashboard()]);
    const snapshot = tenancy.data;
    const role = this.roleForMode(mode);
    const permissions = snapshot.branding.rolePermissions[role] ?? [];
    const routes = this.applyVisibility(snapshot, mode, permissions);
    const pendingSync = tenancyRepository.getOfflineQueue().length + adminRepository.getOfflineQueue().length;
    const activeGym = snapshot.gyms.find((gym) => gym.id === snapshot.activeGymId) ?? snapshot.gyms[0];
    return { data: {
      provider: appConfig.backend.provider,
      activeMode: mode,
      activeTenant: { id: activeGym.id, name: activeGym.name, slug: activeGym.slug, role },
      activeTrainer: snapshot.activeTrainerId ? { id: snapshot.activeTrainerId, name: "Demo Trainer" } : undefined,
      activeBrand: { name: snapshot.branding.activeBrandName || admin.data.tenant.branding.appName, logo: snapshot.branding.logoMediaPlaceholder, primaryColor: snapshot.branding.primaryColor, accentColor: snapshot.branding.accentColor, domain: snapshot.branding.domain, subdomain: snapshot.branding.subdomain },
      visibleRoutes: routes.filter((route) => route.visible),
      hiddenRoutes: routes.filter((route) => !route.visible),
      rolePermissions: permissions,
      navigationVisibility: Object.fromEntries(routes.map((route) => [route.id, route.visible])),
      routeGuardMetadata: Object.fromEntries(routes.map((route) => [route.id, { visible: route.visible, reason: route.guardReason ?? "visible for active tenant context", requiredPermissions: route.requiredPermissions }])),
      betaReadinessChecklist: [
        { label: "Repository-only shell data", ready: true }, { label: "Mock provider", ready: true }, { label: "Supabase provider mappings", ready: true }, { label: "No auth/security bypass", ready: true }, { label: "Metadata-only tenant switches", ready: true }, { label: "No hard deletes", ready: true },
      ],
      pendingSync,
      saveStatus: pendingSync > 0 ? "pending" : "saved",
    }, source: tenancy.source };
  }

  private applyVisibility(snapshot: TenancySnapshot, mode: AppMode, permissions: string[]): AppRouteMeta[] {
    const features = new Set(snapshot.branding.enabledFeatures);
    return allRoutes.map((route) => {
      const modeAllowed = route.modes.includes(mode);
      const featureAllowed = !route.featureFlag || features.has(route.featureFlag);
      const permissionAllowed = route.requiredPermissions.some((permission) => permissions.includes("all") || permissions.includes(permission));
      const visible = modeAllowed && featureAllowed && permissionAllowed;
      const guardReason = visible ? undefined : !modeAllowed ? `hidden in ${mode} mode` : !featureAllowed ? `tenant feature ${route.featureFlag} is disabled` : "active role lacks required permissions";
      return { ...route, visible, guardReason };
    });
  }
}

export const appShellRepository = new AppShellRepository();
