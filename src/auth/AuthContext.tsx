import { createContext, useContext } from "react";
import type { AuthRole, AuthSession, AuthStatus, Permission, SignInCredentials, SignUpCredentials } from "./types";

export interface AuthContextValue {
  status: AuthStatus;
  session: AuthSession | null;
  error: string;
  isAuthenticated: boolean;
  signIn(credentials: SignInCredentials): Promise<void>;
  signUp(credentials: SignUpCredentials): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
  logout(): Promise<void>;
  hasRole(role: AuthRole | AuthRole[]): boolean;
  hasMinimumRole(role: AuthRole): boolean;
  can(permission: Permission): boolean;
  canAll(permissions: Permission[]): boolean;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }
  return context;
}

export function usePermission(permission: Permission): boolean {
  return useAuth().can(permission);
}

export function useRole(role: AuthRole | AuthRole[]): boolean {
  return useAuth().hasRole(role);
}
