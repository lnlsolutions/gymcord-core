import type { MembershipRole } from "../../types/domain";

export type OrganizationPermission =
  | "organization:view" | "organization:manage" | "brand:manage" | "theme:manage"
  | "members:manage" | "trainers:manage" | "gyms:manage" | "plans:manage"
  | "billing:manage" | "settings:manage";

const permissionsByRole: Record<MembershipRole, OrganizationPermission[]> = {
  owner: ["organization:view", "organization:manage", "brand:manage", "theme:manage", "members:manage", "trainers:manage", "gyms:manage", "plans:manage", "billing:manage", "settings:manage"],
  admin: ["organization:view", "organization:manage", "brand:manage", "theme:manage", "members:manage", "trainers:manage", "gyms:manage", "plans:manage", "settings:manage"],
  manager: ["organization:view", "members:manage", "trainers:manage", "gyms:manage", "settings:manage"],
  trainer: ["organization:view", "members:manage"],
  member: ["organization:view"],
  guest: [],
};

export class PermissionEngine {
  static permissionsFor(role: MembershipRole): OrganizationPermission[] {
    return permissionsByRole[role];
  }

  static can(role: MembershipRole, permission: OrganizationPermission): boolean {
    return permissionsByRole[role].includes(permission);
  }
}
