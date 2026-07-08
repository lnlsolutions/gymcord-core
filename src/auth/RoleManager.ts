import type { AuthRole } from "./types";

export const roleLabels: Record<AuthRole, string> = {
  member: "Member",
  trainer: "Trainer",
  gym_manager: "Gym Manager",
  gym_owner: "Gym Owner",
  admin: "Admin",
  super_admin: "Super Admin",
};

const roleRank: Record<AuthRole, number> = {
  member: 10,
  trainer: 20,
  gym_manager: 30,
  gym_owner: 40,
  admin: 50,
  super_admin: 60,
};

export class RoleManager {
  static hasRole(userRoles: AuthRole[], required: AuthRole | AuthRole[]): boolean {
    const requiredRoles = Array.isArray(required) ? required : [required];
    return requiredRoles.some((role) => userRoles.includes(role));
  }

  static hasMinimumRole(userRoles: AuthRole[], minimum: AuthRole): boolean {
    return userRoles.some((role) => roleRank[role] >= roleRank[minimum]);
  }

  static highestRole(userRoles: AuthRole[]): AuthRole {
    return [...userRoles].sort((a, b) => roleRank[b] - roleRank[a])[0] ?? "member";
  }
}
