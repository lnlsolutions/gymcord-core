import { appConfig } from "../config";
import { offlineEngine, type QueuedWrite } from "../services/sync";
import type { MembershipRole, Organization } from "../types/domain";

export type AppShellMode = "consumer" | "trainer" | "gym" | "admin";

export interface AppShellRoute {
  id: string;
  label: string;
  path: string;
  module: string;
  modes: AppShellMode[];
  roles: MembershipRole[];
  guard: { requiresAuth: true; allowMock: boolean; providerMapping: string; permissions: string[] };
  status: "connected" | "beta";
  emptyState: string;
}

export interface AppShellSnapshot {
  activeMode: AppShellMode;
  activeTenant: Organization;
  activeBrand: { name: string; primaryColor: string; logoUrl?: string };
  activeContext: { gymName: string; trainerName: string; memberName: string };
  routes: AppShellRoute[];
  betaStatus: string[];
  devTools: string[];
  provider: typeof appConfig.backend.provider;
}

const activeTenant: Organization = {
  id: "org-beta-app-shell",
  name: "GymCord Beta Gym",
  slug: "beta-gym",
  ownerUserId: "owner-beta",
  brand: { appName: "GymCord Beta Gym", primaryColor: "#7c3aed", secondaryColor: "#14b8a6", accentColor: "#f97316", typography: "Inter", logoUrl: "" },
  theme: { mode: "dark", radius: "rounded" },
  memberIds: ["member-beta"],
  trainerIds: ["trainer-beta"],
  gymIds: ["gym-beta"],
  planIds: ["plan-beta"],
  billing: { provider: "manual", status: "trialing" },
  routing: { subdomains: ["beta"], customDomains: [] },
  settings: { allowMemberSignup: true, requireTrainerApproval: false, timezone: "Etc/UTC" },
  createdAt: "2026-07-09T00:00:00.000Z",
  updatedAt: "2026-07-09T00:00:00.000Z",
};

const routes: AppShellRoute[] = [
  ["home", "Dashboard", "/", "Dashboard", ["consumer", "trainer", "gym", "admin"]],
  ["train", "Workouts", "/train", "Workout", ["consumer", "trainer", "gym"]],
  ["meals", "Nutrition", "/meals", "Nutrition", ["consumer", "trainer", "gym"]],
  ["progress", "Progress", "/progress", "Progress", ["consumer", "trainer", "gym"]],
  ["coach", "Atlas Coach", "/coach", "Atlas Coach", ["consumer", "trainer", "gym"]],
  ["trainer-portal", "Trainer Portal", "/dev/trainer", "Trainer Portal", ["trainer", "gym", "admin"]],
  ["program-builder", "Program Builder", "/dev/program-builder", "Program Builder", ["trainer", "gym", "admin"]],
  ["exercise-library", "Exercise Library", "/dev/exercise-library", "Exercise Library", ["trainer", "gym", "admin"]],
  ["calendar", "Calendar", "/dev/calendar", "Calendar", ["consumer", "trainer", "gym", "admin"]],
  ["messaging", "Messaging", "/dev/messaging", "Messaging", ["consumer", "trainer", "gym", "admin"]],
  ["notifications", "Notifications", "/dev/notifications", "Notifications", ["consumer", "trainer", "gym", "admin"]],
  ["check-ins", "Check-ins", "/dev/check-ins", "Check-ins", ["trainer", "gym", "admin"]],
  ["billing", "Billing", "/dev/billing", "Billing", ["consumer", "gym", "admin"]],
  ["tenancy", "Tenancy", "/dev/tenancy", "Tenancy", ["gym", "admin"]],
  ["admin", "Admin", "/dev/admin", "Admin", ["admin"]],
].map(([id, label, path, module, modes]) => ({
  id: id as string,
  label: label as string,
  path: path as string,
  module: module as string,
  modes: modes as AppShellMode[],
  roles: ["member", "trainer", "owner", "admin"],
  guard: { requiresAuth: true, allowMock: true, providerMapping: String(path), permissions: [`${id}:read`] },
  status: "connected" as const,
  emptyState: `${label} has no beta data yet.`,
}));

export class AppShellRepository {
  private activeMode: AppShellMode = "consumer";

  loadSnapshot(): AppShellSnapshot {
    return {
      activeMode: this.activeMode,
      activeTenant,
      activeBrand: { name: activeTenant.brand.appName, primaryColor: activeTenant.brand.primaryColor, logoUrl: activeTenant.brand.logoUrl },
      activeContext: { gymName: activeTenant.name, trainerName: "Avery Coach", memberName: "Beta Member" },
      routes,
      betaStatus: ["mock mode enabled", "auth guards enforced", "supabase provider mappings only"],
      devTools: routes.filter((route) => route.path.startsWith("/dev")).map((route) => route.label),
      provider: appConfig.backend.provider,
    };
  }

  getVisibleRoutes(mode: AppShellMode = this.activeMode): AppShellRoute[] {
    return routes.filter((route) => route.modes.includes(mode));
  }

  getHiddenRoutes(mode: AppShellMode = this.activeMode): AppShellRoute[] {
    return routes.filter((route) => !route.modes.includes(mode));
  }

  switchMode(mode: AppShellMode): AppShellSnapshot {
    this.activeMode = mode;
    return this.loadSnapshot();
  }

  getOfflineQueue(): QueuedWrite[] {
    try {
      return offlineEngine.getQueue();
    } catch (error) {
      console.warn("[GymCord AppShell] offline queue diagnostics unavailable", error);
      return [];
    }
  }
}

export const appShellRepository = new AppShellRepository();
