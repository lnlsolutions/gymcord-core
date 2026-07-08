import type { ReactNode } from "react";
import { LoadingScreen, UnauthorizedScreen } from "./screens";
import { useAuth } from "./AuthContext";
import type { AuthRole, Permission } from "./types";

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: AuthRole[];
  permissions?: Permission[];
  fallback?: ReactNode;
}

export function ProtectedRoute({ children, roles, permissions, fallback }: ProtectedRouteProps) {
  const auth = useAuth();

  if (auth.status === "loading") return <LoadingScreen />;
  if (!auth.isAuthenticated) return fallback ?? <UnauthorizedScreen message="Please sign in to continue." />;
  if (roles?.length && !auth.hasRole(roles)) return fallback ?? <UnauthorizedScreen />;
  if (permissions?.length && !auth.canAll(permissions)) return fallback ?? <UnauthorizedScreen />;

  return <>{children}</>;
}

export function Can({ children, permission, fallback = null }: { children: ReactNode; permission: Permission; fallback?: ReactNode }) {
  return useAuth().can(permission) ? <>{children}</> : <>{fallback}</>;
}
