import { appConfig } from "../config";
import { publicBetaOnboardingRepository, invitationRepository, type InvitationMetadata, type OnboardingPath } from "../services/PublicBetaRepositories";
import type { AuthSession } from "../auth/types";

export type AuthMode = "signup" | "login" | "forgot-password" | "reset-password" | "verify-email";
export type SocialProviderId = "google" | "apple";

export interface SocialProviderMetadata { id: SocialProviderId; label: string; ready: boolean; scopes: string[]; mockMode: boolean; }
export interface AuthEntryMetadata { activeProvider: string; authMode: AuthMode; mockSessionState: string; socialProviders: SocialProviderMetadata[]; emailVerification: Record<string, string>; passwordReset: Record<string, string>; }
export interface PendingAuthEntry { mode: AuthMode; returnRoute: string; selectedPath: OnboardingPath; pendingInvite: InvitationMetadata | null; }

const pendingKey = "gc.authEntry.pending";
const completedKey = appConfig.storageKeys.profileComplete;

function read<T>(key: string, fallback: T): T { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; } }
function write<T>(key: string, value: T) { localStorage.setItem(key, JSON.stringify(value)); }

export class AuthEntryRepository {
  getMetadata(mode: AuthMode = "login", session: AuthSession | null = null): AuthEntryMetadata {
    const mockMode = appConfig.backend.provider === "mock" || !appConfig.backend.supabase.url || !appConfig.backend.supabase.anonKey;
    return {
      activeProvider: appConfig.backend.provider,
      authMode: mode,
      mockSessionState: session ? "authenticated" : "anonymous",
      socialProviders: [
        { id: "google", label: "Continue with Google", ready: true, scopes: ["openid", "email", "profile"], mockMode },
        { id: "apple", label: "Continue with Apple", ready: true, scopes: ["name", "email"], mockMode },
      ],
      emailVerification: { route: "/auth/verify-email", status: "metadata-ready", redirect: "/auth/login" },
      passwordReset: { route: "/auth/reset-password", status: "metadata-ready", tokenSource: "url-token" },
    };
  }

  savePending(entry: PendingAuthEntry): PendingAuthEntry { write(pendingKey, entry); return entry; }
  getPending(): PendingAuthEntry { return read<PendingAuthEntry>(pendingKey, { mode: "login", returnRoute: "/onboarding", selectedPath: "consumer", pendingInvite: null }); }
  setInviteFromCode(code: string): InvitationMetadata | null { const invite = invitationRepository.validateCode(code); const current = this.getPending(); this.savePending({ ...current, pendingInvite: invite, selectedPath: invite?.type === "trainer" ? "trainer_invite" : invite?.type === "gym" ? "gym_invite" : current.selectedPath }); return invite; }
}

export class InviteEntryRepository {
  list() { return invitationRepository.list(); }
  validateBeforeAuth(code: string) { return invitationRepository.validateCode(code); }
  acceptAfterAuth(invite: InvitationMetadata | null, session: AuthSession | null) {
    if (!invite) return { accepted: false, status: "missing", metadata: null };
    if (!session) return { accepted: false, status: "auth-required", metadata: invite.relationshipMetadata };
    if (invite.status !== "pending") return { accepted: false, status: invite.status, metadata: invite.relationshipMetadata };
    return { accepted: true, status: "accepted", metadata: { ...invite.relationshipMetadata, acceptedBy: session.user.id, acceptedAt: new Date().toISOString() } };
  }
  archive(id: string) { return invitationRepository.archive(id); }
}

export class SessionRoutingRepository {
  getDecision(session: AuthSession | null, pending = authEntryRepository.getPending()) {
    const onboardingComplete = read<boolean>(completedKey, false);
    if (!session) return { route: `/auth/${pending.mode === "signup" ? "signup" : "login"}`, reason: "auth-required", returnRoute: pending.returnRoute };
    const acceptedInvite = inviteEntryRepository.acceptAfterAuth(pending.pendingInvite, session);
    return { route: onboardingComplete ? "/app" : "/onboarding", reason: onboardingComplete ? "onboarding-complete" : "return-to-onboarding", selectedPath: pending.selectedPath, pendingInvite: pending.pendingInvite, acceptedInvite };
  }
}

export const authEntryRepository = new AuthEntryRepository();
export const inviteEntryRepository = new InviteEntryRepository();
export const sessionRoutingRepository = new SessionRoutingRepository();
export const onboardingContinuationRepository = publicBetaOnboardingRepository;
