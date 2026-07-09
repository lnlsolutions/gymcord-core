import { useAuth } from "../../auth";
import { authEntryRepository } from "../../repositories/AuthEntryRepository";
import { inviteEntryRepository } from "../../repositories/InviteEntryRepository";
import { sessionRoutingRepository } from "../../repositories/SessionRoutingRepository";
import { publicBetaOnboardingRepository } from "../../services/PublicBetaRepositories";
import { SessionRoutingPanel } from "../auth-entry/SessionRoutingPanel";

export function DeveloperAuthEntry() {
  const auth = useAuth();
  const metadata = authEntryRepository.getMetadata();
  return <main className="screen dev-screen"><section className="hero-card"><p className="eyebrow">Developer</p><h1>/dev/auth-entry</h1><p>Production auth and invitation entry diagnostics.</p></section><section className="panel"><pre>{JSON.stringify({ activeProvider: metadata.activeProvider, authMode: metadata.authMode, mockSessionState: { status: auth.status, isAuthenticated: auth.isAuthenticated, userId: auth.session?.user.id ?? null }, pendingInvite: inviteEntryRepository.getPending(), selectedOnboardingPath: authEntryRepository.getSelectedOnboardingPath(), returnRoute: sessionRoutingRepository.getReturnRoute(), socialProviderMetadata: metadata.socialProviders, emailVerificationMetadata: metadata.emailVerification, passwordResetMetadata: metadata.passwordReset, offlineQueue: publicBetaOnboardingRepository.getOfflineQueue(), saveStatus: "local repository metadata persisted" }, null, 2)}</pre></section><SessionRoutingPanel session={auth.session} /></main>;
}
