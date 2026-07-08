import { getSupabaseClient } from "../../config/supabase";
import { SessionManager } from "../../auth/SessionManager";
import type { AuthOrganization, AuthService, AuthSession, AuthUser, FutureAuthProvider, ResetPasswordRequest, SignInCredentials, SignUpCredentials } from "../../auth/types";

const expiresAt = (seconds?: number | null) => new Date((seconds ?? Math.floor(Date.now() / 1000) + 3600) * 1000).toISOString();
const fallbackOrg = (name = "GymCord"): AuthOrganization => ({
  id: "org-gymcord", name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "gymcord",
  gyms: [], trainers: [], members: [], brand: { name, primaryColor: "#ff4fa0", accentColor: "#ff8a65" }, theme: { mode: "dark", radius: "rounded" }, settings: { allowMemberSignup: true, requireTrainerApproval: false, timezone: "UTC" },
});

export class SupabaseAuthService implements AuthService {
  private listeners = new Set<(session: AuthSession | null) => void>();

  async getCurrentSession(): Promise<AuthSession | null> {
    const { data, error } = await getSupabaseClient().auth.getSession();
    if (error) throw error;
    if (!data.session) return null;
    const session = this.mapSession(data.session);
    SessionManager.save(session);
    return session;
  }

  async signIn(credentials: SignInCredentials): Promise<AuthSession> {
    const { data, error } = await getSupabaseClient().auth.signInWithPassword(credentials);
    if (error || !data.session) throw error ?? new Error("Supabase did not return a session.");
    return this.persistAndNotify(this.mapSession(data.session));
  }

  async signUp(credentials: SignUpCredentials): Promise<AuthSession> {
    const { data, error } = await getSupabaseClient().auth.signUp({ email: credentials.email, password: credentials.password, options: { data: { displayName: credentials.displayName, organizationName: credentials.organizationName } } });
    if (error || !data.session) throw error ?? new Error("Confirm your email address to finish creating your account.");
    return this.persistAndNotify(this.mapSession(data.session, credentials.displayName, credentials.organizationName));
  }

  async requestPasswordReset(request: ResetPasswordRequest): Promise<void> {
    const { error } = await getSupabaseClient().auth.resetPasswordForEmail(request.email);
    if (error) throw error;
  }

  async refreshSession(): Promise<AuthSession> {
    const { data, error } = await getSupabaseClient().auth.refreshSession();
    if (error || !data.session) throw error ?? new Error("Unable to refresh Supabase session.");
    return this.persistAndNotify(this.mapSession(data.session));
  }

  async signOut(): Promise<void> {
    const { error } = await getSupabaseClient().auth.signOut();
    if (error) throw error;
    SessionManager.clear();
    this.notify(null);
  }

  onAuthStateChanged(listener: (session: AuthSession | null) => void): () => void {
    this.listeners.add(listener);
    const { data } = getSupabaseClient().auth.onAuthStateChange((_event, session) => this.notify(session ? this.mapSession(session) : null));
    return () => { this.listeners.delete(listener); data.subscription.unsubscribe(); };
  }

  private mapSession(session: import("@supabase/supabase-js").Session, displayName?: string, organizationName?: string): AuthSession {
    const metadata = session.user.user_metadata;
    const org = fallbackOrg(String(metadata.organizationName ?? organizationName ?? "GymCord"));
    const user: AuthUser = {
      id: session.user.id,
      email: session.user.email ?? "",
      displayName: String(metadata.displayName ?? metadata.name ?? displayName ?? session.user.email?.split("@")[0] ?? "GymCord Member"),
      avatarUrl: typeof metadata.avatar_url === "string" ? metadata.avatar_url : undefined,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      locale: navigator.language || "en-US",
      roles: ["member"],
      organizationIds: [org.id],
      activeOrganizationId: org.id,
      createdAt: session.user.created_at,
      updatedAt: new Date().toISOString(),
    };
    return { user, organization: org, tokens: { accessToken: session.access_token, refreshToken: session.refresh_token, tokenType: "Bearer", expiresAt: expiresAt(session.expires_at) } };
  }

  private persistAndNotify(session: AuthSession): AuthSession { SessionManager.save(session); this.notify(session); return session; }
  private notify(session: AuthSession | null): void { this.listeners.forEach((listener) => listener(session)); }
}

export class SupabaseAuthProvider implements FutureAuthProvider {
  readonly name = "supabase";
  createService(): AuthService { return new SupabaseAuthService(); }
}
