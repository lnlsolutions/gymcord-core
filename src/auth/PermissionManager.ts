import type { AuthRole, Permission } from "./types";

const rolePermissions: Record<AuthRole, Permission[]> = {
  member: ["dashboard:view", "workouts:manage_own", "meals:manage_own", "progress:manage_own", "coach:use"],
  trainer: ["dashboard:view", "workouts:manage_own", "meals:manage_own", "progress:manage_own", "coach:use", "organization:view", "members:manage"],
  gym_manager: ["dashboard:view", "organization:view", "gyms:manage", "trainers:manage", "members:manage", "settings:manage"],
  gym_owner: ["dashboard:view", "organization:view", "organization:manage", "gyms:manage", "trainers:manage", "members:manage", "brand:manage", "settings:manage"],
  admin: ["dashboard:view", "organization:view", "organization:manage", "gyms:manage", "trainers:manage", "members:manage", "brand:manage", "settings:manage", "admin:access"],
  super_admin: ["dashboard:view", "organization:view", "organization:manage", "gyms:manage", "trainers:manage", "members:manage", "brand:manage", "settings:manage", "admin:access", "system:manage"],
};

export class PermissionManager {
  static permissionsForRoles(roles: AuthRole[]): Permission[] {
    return Array.from(new Set(roles.flatMap((role) => rolePermissions[role] ?? [])));
  }

  static hasPermission(roles: AuthRole[], permission: Permission): boolean {
    return this.permissionsForRoles(roles).includes(permission);
  }

  static hasEveryPermission(roles: AuthRole[], permissions: Permission[]): boolean {
    return permissions.every((permission) => this.hasPermission(roles, permission));
  }
}

export { rolePermissions };
