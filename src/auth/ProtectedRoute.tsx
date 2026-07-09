import type { ReactNode } from "react";
import { LoadingScreen, UnauthorizedScreen } from "./screens";
import { useAuth } from "./AuthContext";
import { appConfig } from "../config";
import type { AuthRole, Permission } from "./types";

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: AuthRole[];
  permissions?: Permission[];
  fallback?: ReactNode;
  allowMockMode?: boolean;
}

export function ProtectedRoute({ children, roles, permissions, fallback, allowMockMode = false }: ProtectedRouteProps) {
  const auth = useAuth();

  const canBypassForMockMode = allowMockMode && appConfig.backend.provider === "mock";

  if (auth.status === "loading") return <LoadingScreen />;
  if (canBypassForMockMode) return <>{children}</>;
  if (!auth.isAuthenticated) return fallback ?? <UnauthorizedScreen message="Please sign in to continue." />;
  if (roles?.length && !auth.hasRole(roles)) return fallback ?? <UnauthorizedScreen />;
  if (permissions?.length && !auth.canAll(permissions)) return fallback ?? <UnauthorizedScreen />;

  return <>{children}</>;
}

export function Can({ children, permission, fallback = null }: { children: ReactNode; permission: Permission; fallback?: ReactNode }) {
  return useAuth().can(permission) ? <>{children}</> : <>{fallback}</>;
}
