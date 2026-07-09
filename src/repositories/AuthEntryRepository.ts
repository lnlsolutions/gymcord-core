import { appConfig } from "../config";
import type { AuthSession } from "../auth/types";
import { inviteEntryRepository } from "./InviteEntryRepository";
import type { OnboardingPath } from "../services/PublicBetaRepositories";

export type AuthEntryMode = "mock" | "provider";
export type SocialProvider = "google" | "apple";

export interface PasswordResetMetadata { requested: boolean; tokenPresent: boolean; requestedAt?: string; email?: string }
export interface EmailVerificationMetadata { required: boolean; status: "mock_verified" | "provider_pending"; sentAt?: string; email?: string }

export interface AuthEntryMetadata {
  activeProvider: string;
  authMode: AuthEntryMode;
  socialProviders: Record<SocialProvider, { ready: boolean; configured: boolean; redirectPath: string }>;
  emailVerification: EmailVerificationMetadata;
  passwordReset: PasswordResetMetadata;
}

const resetKey = "gc.auth.passwordReset";
const verifyKey = "gc.auth.emailVerification";

export class AuthEntryRepository {
  getMetadata(): AuthEntryMetadata {
    const reset = this.getPasswordResetMetadata();
    const verify = this.getEmailVerificationMetadata();
    const providerMode = appConfig.backend.provider === "mock" ? "mock" : "provider";
    return {
      activeProvider: appConfig.backend.provider,
      authMode: providerMode,
      socialProviders: {
        google: { ready: true, configured: providerMode === "provider", redirectPath: "/auth/login?provider=google" },
        apple: { ready: true, configured: providerMode === "provider", redirectPath: "/auth/login?provider=apple" },
      },
      emailVerification: verify,
      passwordReset: reset,
    };
  }

  preserveOnboardingPath(path: OnboardingPath): void { localStorage.setItem("gc.onboarding.selectedPath", path); }
  getSelectedOnboardingPath(): OnboardingPath { return (localStorage.getItem("gc.onboarding.selectedPath") as OnboardingPath | null) ?? "consumer"; }
  markPasswordResetRequested(email: string): void { localStorage.setItem(resetKey, JSON.stringify({ requested: true, tokenPresent: false, requestedAt: new Date().toISOString(), email })); }
  getPasswordResetMetadata(): PasswordResetMetadata { try { return { requested: false, tokenPresent: new URLSearchParams(location.search).has("token"), ...JSON.parse(localStorage.getItem(resetKey) || "{}") } as PasswordResetMetadata; } catch { return { requested: false, tokenPresent: false }; } }
  markEmailVerificationSent(email: string): void { localStorage.setItem(verifyKey, JSON.stringify({ required: appConfig.backend.provider !== "mock", status: appConfig.backend.provider === "mock" ? "mock_verified" : "provider_pending", sentAt: new Date().toISOString(), email })); }
  getEmailVerificationMetadata(): EmailVerificationMetadata { try { return { required: appConfig.backend.provider !== "mock", status: appConfig.backend.provider === "mock" ? "mock_verified" : "provider_pending", ...JSON.parse(localStorage.getItem(verifyKey) || "{}") } as EmailVerificationMetadata; } catch { return { required: false, status: "mock_verified" }; } }
  recordAuthSuccess(session: AuthSession): void { inviteEntryRepository.acceptAfterAuth(session.user.id); }
}

export const authEntryRepository = new AuthEntryRepository();
