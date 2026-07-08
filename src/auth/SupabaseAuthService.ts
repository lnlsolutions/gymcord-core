import { createClient, type SupabaseClient, type Session } from "@supabase/supabase-js";
import { defaultOrganization } from "../repositories/OrganizationRepository";
import type { Organization, User } from "../types/domain";
import type { AuthOrganization, AuthRole, AuthService, AuthSession, AuthUser, ResetPasswordRequest, SignInCredentials, SignUpCredentials } from "./types";

const now = () => new Date().toISOString();

function isRecord(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === "object" && !Array.isArray(value); }
function camelToSnake(key: string) { return key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`); }
function keysToSnake(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(keysToSnake);
  if (!isRecord(value)) return value;
  return Object.fromEntries(Object.entries(value).map(([key, entry]) => [camelToSnake(key), keysToSnake(entry)]));
}

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "gymcord";

function toAuthOrganization(org: Organization): AuthOrganization {
  return { id: org.id, name: org.name, slug: org.slug, gyms: org.gymIds, trainers: org.trainerIds, members: org.memberIds, brand: { name: org.brand.appName, logoUrl: org.brand.logoUrl, primaryColor: org.brand.primaryColor, accentColor: org.brand.accentColor }, theme: org.theme, settings: org.settings };
}

function buildOrganization(name: string, ownerUserId: string): Organization {
  const timestamp = now();
  return { ...defaultOrganization, id: crypto.randomUUID(), name, slug: `${slugify(name)}-${crypto.randomUUID().slice(0, 8)}`, ownerUserId, memberIds: [ownerUserId], createdAt: timestamp, updatedAt: timestamp, brand: { ...defaultOrganization.brand, appName: name }, routing: { ...defaultOrganization.routing, subdomains: [slugify(name)] } };
}

function tokenExpiry(session: Session) {
  return new Date((session.expires_at ? session.expires_at * 1000 : Date.now() + 3600_000)).toISOString();
}

export class SupabaseAuthService implements AuthService {
  private readonly client: SupabaseClient;

  constructor(url: string, anonKey: string, client?: SupabaseClient) {
    this.client = client ?? createClient(url, anonKey);
  }

  async getCurrentSession(): Promise<AuthSession | null> {
    const { data, error } = await this.client.auth.getSession();
    if (error) throw new Error(error.message);
    return data.session ? this.hydrateSession(data.session) : null;
  }

  async signIn(credentials: SignInCredentials): Promise<AuthSession> {
    const { data, error } = await this.client.auth.signInWithPassword(credentials);
    if (error || !data.session) throw new Error(error?.message ?? "Unable to sign in.");
    return this.hydrateSession(data.session);
  }

  async signUp(credentials: SignUpCredentials): Promise<AuthSession> {
    const { data, error } = await this.client.auth.signUp({ email: credentials.email, password: credentials.password, options: { data: { display_name: credentials.displayName } } });
    if (error || !data.user) throw new Error(error?.message ?? "Unable to create account.");
    const session = data.session ?? (await this.client.auth.signInWithPassword({ email: credentials.email, password: credentials.password })).data.session;
    if (!session) throw new Error("Check your email to confirm your GymCord account before signing in.");

    const role = credentials.role ?? "member";
    const organization = credentials.organizationName?.trim() ? await this.createOrganization(credentials.organizationName.trim(), data.user.id) : null;
    const user = await this.upsertUser(data.user.id, credentials.email, credentials.displayName, organization?.id, role);
    if (organization) await this.createProfile(role, user, organization.id);
    return this.hydrateSession(session, user, organization ?? undefined, role);
  }

  async requestPasswordReset(request: ResetPasswordRequest): Promise<void> {
    const { error } = await this.client.auth.resetPasswordForEmail(request.email);
    if (error) throw new Error(error.message);
  }

  async refreshSession(): Promise<AuthSession> {
    const { data, error } = await this.client.auth.refreshSession();
    if (error || !data.session) throw new Error(error?.message ?? "Unable to refresh session.");
    return this.hydrateSession(data.session);
  }

  async signOut(): Promise<void> { await this.client.auth.signOut(); }

  onAuthStateChanged(listener: (session: AuthSession | null) => void): () => void {
    const { data } = this.client.auth.onAuthStateChange((_event, session) => { void (session ? this.hydrateSession(session).then(listener) : Promise.resolve(listener(null))); });
    return () => data.subscription.unsubscribe();
  }

  private async createOrganization(name: string, ownerUserId: string) {
    const organization = buildOrganization(name, ownerUserId);
    const { data, error } = await this.client.from("organizations").insert(keysToSnake(organization)).select("*").single();
    if (error) throw new Error(error.message);
    return organization;
  }

  private async upsertUser(id: string, email: string, displayName: string, activeOrganizationId?: string, role: AuthRole = "member") {
    const timestamp = now();
    const user = { id, email, displayName, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC", locale: navigator.language || "en-US", organizationIds: activeOrganizationId ? [activeOrganizationId] : [], activeOrganizationId, roles: [role], createdAt: timestamp, updatedAt: timestamp };
    const { data, error } = await this.client.from("users").upsert(keysToSnake(user)).select("*").single();
    if (error) throw new Error(error.message);
    return user;
  }

  private async createProfile(role: AuthRole, user: AuthUser, organizationId: string) {
    const table = role === "trainer" ? "trainer_profiles" : "member_profiles";
    const timestamp = now();
    const { error } = await this.client.from(table).upsert({ id: crypto.randomUUID(), user_id: user.id, organization_id: organizationId, display_name: user.displayName, goals: [], measurements: {}, preferences: {}, injuries: [], settings: {}, created_at: timestamp, updated_at: timestamp });
    if (error) throw new Error(error.message);
  }

  private async hydrateSession(session: Session, userOverride?: AuthUser, orgOverride?: Organization, role: AuthRole = "member"): Promise<AuthSession> {
    const authUser = session.user;
    const user = userOverride ?? await this.loadUser(authUser.id, authUser.email ?? "", role);
    const organization = orgOverride ?? (user.activeOrganizationId ? await this.loadOrganization(user.activeOrganizationId) : null);
    return { user, organization: organization ? toAuthOrganization(organization) : undefined, tokens: { accessToken: session.access_token, refreshToken: session.refresh_token, tokenType: "Bearer", expiresAt: tokenExpiry(session) }, restoredAt: now() };
  }

  private async loadUser(id: string, email: string, role: AuthRole) {
    const { data } = await this.client.from("users").select("*").eq("id", id).maybeSingle();
    return (data as AuthUser | null) ?? this.upsertUser(id, email, sessionStorage.getItem("gc.displayName") ?? email.split("@")[0], undefined, role);
  }

  private async loadOrganization(id: string) {
    const { data, error } = await this.client.from("organizations").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return data as Organization | null;
  }
}
