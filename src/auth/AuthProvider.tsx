import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import { MockAuthService } from "./MockAuthService";
import { PermissionManager } from "./PermissionManager";
import { RoleManager } from "./RoleManager";
import { SessionManager } from "./SessionManager";
import { telemetryService, AnalyticsEventNames } from "../core/analytics";
import type { AuthRole, AuthService, AuthSession, AuthStatus, FutureAuthProvider, Permission, SignInCredentials, SignUpCredentials } from "./types";

interface AuthProviderProps {
  children: ReactNode;
  service?: AuthService;
  provider?: FutureAuthProvider;
}

export function AuthProvider({ children, service, provider }: AuthProviderProps) {
  const authService = useMemo(() => service ?? provider?.createService() ?? new MockAuthService(), [provider, service]);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [session, setSession] = useState<AuthSession | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const unsubscribe = authService.onAuthStateChanged((nextSession) => {
      setSession(nextSession);
      setStatus(nextSession ? "authenticated" : "unauthenticated");
    });

    authService.getCurrentSession()
      .then((restoredSession) => {
        if (!active) return;
        setSession(restoredSession);
        setStatus(restoredSession ? "authenticated" : "unauthenticated");
      })
      .catch((restoreError: Error) => {
        if (!active) return;
        setError(restoreError.message);
        setStatus("unauthenticated");
      });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [authService]);

  useEffect(() => {
    if (!session) return;
    const refreshDelay = Math.max(new Date(session.tokens.expiresAt).getTime() - Date.now() - 5 * 60 * 1000, 30_000);
    const refreshTimer = window.setTimeout(() => {
      if (!SessionManager.shouldRefresh(session)) return;
      authService.refreshSession(session).catch((refreshError: Error) => {
        setError(refreshError.message);
        setStatus("unauthenticated");
      });
    }, refreshDelay);

    return () => window.clearTimeout(refreshTimer);
  }, [authService, session]);

  const roles = session?.user.roles ?? [];

  const value = useMemo(() => ({
    status,
    session,
    error,
    isAuthenticated: status === "authenticated" && Boolean(session),
    async signIn(credentials: SignInCredentials) {
      setError("");
      setStatus("loading");
      try {
        const nextSession = await authService.signIn(credentials);
        setSession(nextSession);
        telemetryService.track(AnalyticsEventNames.Login, { userId: nextSession.user.id, email: credentials.email }, "auth-provider");
        setStatus("authenticated");
      } catch (signInError) {
        setError(signInError instanceof Error ? signInError.message : "Unable to sign in.");
        setStatus("unauthenticated");
      }
    },
    async signUp(credentials: SignUpCredentials) {
      setError("");
      setStatus("loading");
      try {
        const nextSession = await authService.signUp(credentials);
        setSession(nextSession);
        telemetryService.track(AnalyticsEventNames.Signup, { userId: nextSession.user.id, email: credentials.email, organizationName: credentials.organizationName }, "auth-provider");
        telemetryService.track(AnalyticsEventNames.OrganizationCreated, { organizationName: credentials.organizationName || "GymCord" }, "auth-provider");
        telemetryService.track(AnalyticsEventNames.MemberJoined, { userId: nextSession.user.id }, "auth-provider");
        setStatus("authenticated");
      } catch (signUpError) {
        setError(signUpError instanceof Error ? signUpError.message : "Unable to create account.");
        setStatus("unauthenticated");
      }
    },
    async requestPasswordReset(email: string) {
      setError("");
      await authService.requestPasswordReset({ email });
    },
    async logout() {
      await authService.signOut();
      setSession(null);
      setStatus("unauthenticated");
    },
    hasRole(role: AuthRole | AuthRole[]) {
      return RoleManager.hasRole(roles, role);
    },
    hasMinimumRole(role: AuthRole) {
      return RoleManager.hasMinimumRole(roles, role);
    },
    can(permission: Permission) {
      return PermissionManager.hasPermission(roles, permission);
    },
    canAll(permissions: Permission[]) {
      return PermissionManager.hasEveryPermission(roles, permissions);
    },
  }), [authService, error, roles, session, status]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
