import { SessionManager } from "./SessionManager";
import type { AuthOrganization, AuthService, AuthSession, AuthUser, ResetPasswordRequest, SignInCredentials, SignUpCredentials } from "./types";

const now = () => new Date().toISOString();
const expiresAt = () => new Date(Date.now() + 60 * 60 * 1000).toISOString();

function buildOrganization(name = "GymCord HQ"): AuthOrganization {
  return {
    id: "org_gymcord_hq",
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "gymcord-hq",
    gyms: ["gym_main"],
    trainers: ["trainer_demo"],
    members: ["user_demo"],
    brand: { name, primaryColor: "#ff4fa0", accentColor: "#ff8a65" },
    theme: { mode: "dark", radius: "rounded" },
    settings: { allowMemberSignup: true, requireTrainerApproval: false, timezone: "UTC" },
  };
}

function buildUser(email: string, displayName?: string): AuthUser {
  const timestamp = now();
  return {
    id: `user_${btoa(email).replace(/=+$/g, "").toLowerCase()}`,
    email,
    displayName: displayName || email.split("@")[0] || "GymCord Member",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    locale: navigator.language || "en-US",
    roles: ["member"],
    organizationIds: ["org_gymcord_hq"],
    activeOrganizationId: "org_gymcord_hq",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function buildSession(user: AuthUser, organization = buildOrganization()): AuthSession {
  return {
    user,
    organization,
    tokens: {
      accessToken: `mock_access_${crypto.randomUUID()}`,
      refreshToken: `mock_refresh_${crypto.randomUUID()}`,
      tokenType: "Bearer",
      expiresAt: expiresAt(),
    },
  };
}

export class MockAuthService implements AuthService {
  private listeners = new Set<(session: AuthSession | null) => void>();

  async getCurrentSession(): Promise<AuthSession | null> {
    const session = SessionManager.load();
    if (!session) return null;
    if (SessionManager.isExpired(session)) {
      return this.refreshSession(session);
    }
    return { ...session, restoredAt: now() };
  }

  async signIn(credentials: SignInCredentials): Promise<AuthSession> {
    if (!credentials.email.trim() || !credentials.password.trim()) {
      throw new Error("Email and password are required.");
    }
    const session = buildSession(buildUser(credentials.email));
    this.persistAndNotify(session);
    return session;
  }

  async signUp(credentials: SignUpCredentials): Promise<AuthSession> {
    if (!credentials.displayName.trim()) {
      throw new Error("Display name is required.");
    }
    const organization = buildOrganization(credentials.organizationName || `${credentials.displayName}'s Gym`);
    const user = { ...buildUser(credentials.email, credentials.displayName), organizationIds: [organization.id], activeOrganizationId: organization.id };
    const session = buildSession(user, organization);
    this.persistAndNotify(session);
    return session;
  }

  async requestPasswordReset(_request: ResetPasswordRequest): Promise<void> {
    return;
  }

  async refreshSession(session: AuthSession): Promise<AuthSession> {
    const refreshed = {
      ...session,
      tokens: {
        ...session.tokens,
        accessToken: `mock_access_${crypto.randomUUID()}`,
        expiresAt: expiresAt(),
      },
      restoredAt: now(),
    };
    this.persistAndNotify(refreshed);
    return refreshed;
  }

  async signOut(): Promise<void> {
    SessionManager.clear();
    this.notify(null);
  }

  onAuthStateChanged(listener: (session: AuthSession | null) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private persistAndNotify(session: AuthSession): void {
    SessionManager.save(session);
    this.notify(session);
  }

  private notify(session: AuthSession | null): void {
    this.listeners.forEach((listener) => listener(session));
  }
}
