import type { EntityId, IsoDateTimeString, User } from "../types/domain";

export type AuthRole = "member" | "trainer" | "gym_manager" | "gym_owner" | "admin" | "super_admin";

export type Permission =
  | "dashboard:view"
  | "workouts:manage_own"
  | "meals:manage_own"
  | "progress:manage_own"
  | "coach:use"
  | "organization:view"
  | "organization:manage"
  | "gyms:manage"
  | "trainers:manage"
  | "members:manage"
  | "brand:manage"
  | "settings:manage"
  | "admin:access"
  | "system:manage";

export interface AuthTokenSet {
  accessToken: string;
  refreshToken?: string;
  tokenType: "Bearer";
  expiresAt: IsoDateTimeString;
}

export interface OrganizationBrand {
  name: string;
  logoUrl?: string;
  primaryColor: string;
  accentColor: string;
}

export interface OrganizationTheme {
  mode: "dark" | "light" | "system";
  radius: "compact" | "rounded" | "pill";
}

export interface OrganizationSettings {
  allowMemberSignup: boolean;
  requireTrainerApproval: boolean;
  timezone: string;
}

export interface AuthOrganization {
  id: EntityId;
  name: string;
  slug: string;
  gyms: EntityId[];
  trainers: EntityId[];
  members: EntityId[];
  brand: OrganizationBrand;
  theme: OrganizationTheme;
  settings: OrganizationSettings;
}

export interface AuthUser extends User {
  roles: AuthRole[];
  organizationIds: EntityId[];
  activeOrganizationId?: EntityId;
}

export interface AuthSession {
  user: AuthUser;
  tokens: AuthTokenSet;
  organization?: AuthOrganization;
  restoredAt?: IsoDateTimeString;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials extends SignInCredentials {
  displayName: string;
  organizationName?: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface AuthService {
  getCurrentSession(): Promise<AuthSession | null>;
  signIn(credentials: SignInCredentials): Promise<AuthSession>;
  signUp(credentials: SignUpCredentials): Promise<AuthSession>;
  requestPasswordReset(request: ResetPasswordRequest): Promise<void>;
  refreshSession(session: AuthSession): Promise<AuthSession>;
  signOut(): Promise<void>;
  onAuthStateChanged(listener: (session: AuthSession | null) => void): () => void;
}

export interface FutureAuthProvider {
  name: string;
  createService(): AuthService;
}

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";
