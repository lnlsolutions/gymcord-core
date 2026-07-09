import { appConfig } from "../config";
import type { AuthSession } from "../auth/types";
import { authEntryRepository } from "./AuthEntryRepository";
import { inviteEntryRepository } from "./InviteEntryRepository";

export interface SessionRoutingDecision {
  isAuthenticated: boolean;
  selectedOnboardingPath: string;
  returnRoute: string;
  profileComplete: boolean;
  pendingInviteStatus: string;
  destination: "/auth/login" | "/onboarding" | "/app";
  reasons: string[];
}

export class SessionRoutingRepository {
  getReturnRoute(): string { return sessionStorage.getItem("gc.auth.returnRoute") || "/app"; }
  setReturnRoute(route: string): void { sessionStorage.setItem("gc.auth.returnRoute", route); }
  decide(session: AuthSession | null): SessionRoutingDecision {
    const profileComplete = localStorage.getItem(appConfig.storageKeys.profileComplete) === "true";
    const pendingInvite = inviteEntryRepository.getPending();
    const selectedOnboardingPath = authEntryRepository.getSelectedOnboardingPath();
    if (!session) return { isAuthenticated: false, selectedOnboardingPath, returnRoute: this.getReturnRoute(), profileComplete, pendingInviteStatus: pendingInvite?.status ?? "none", destination: "/auth/login", reasons: ["authentication required"] };
    if (!profileComplete) return { isAuthenticated: true, selectedOnboardingPath, returnRoute: this.getReturnRoute(), profileComplete, pendingInviteStatus: pendingInvite?.status ?? "none", destination: "/onboarding", reasons: ["resume onboarding draft", pendingInvite ? "attach pending invitation metadata" : "no pending invitation"] };
    return { isAuthenticated: true, selectedOnboardingPath, returnRoute: this.getReturnRoute(), profileComplete, pendingInviteStatus: pendingInvite?.status ?? "none", destination: "/app", reasons: ["profile complete", "enter protected app"] };
  }
}

export const sessionRoutingRepository = new SessionRoutingRepository();
