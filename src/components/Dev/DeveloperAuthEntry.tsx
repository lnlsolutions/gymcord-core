import { authEntryRepository, inviteEntryRepository, sessionRoutingRepository, onboardingContinuationRepository } from "../../repositories/AuthEntryRepository";
import { offlineEngine } from "../../services/sync";

export function DeveloperAuthEntry() {
  const pending = authEntryRepository.getPending();
  const metadata = authEntryRepository.getMetadata(pending.mode, null);
  const decision = sessionRoutingRepository.getDecision(null, pending);
  const inviteSamples = inviteEntryRepository.list();
  const onboarding = onboardingContinuationRepository.getMetadata(pending.selectedPath, pending.pendingInvite);
  const rows = [
    ["active provider", metadata.activeProvider], ["auth mode", metadata.authMode], ["mock session state", metadata.mockSessionState], ["pending invite", pending.pendingInvite?.code ?? "none"], ["selected onboarding path", pending.selectedPath], ["return route", pending.returnRoute], ["session routing decision", `${decision.route} (${decision.reason})`], ["social provider metadata", metadata.socialProviders.map((p) => `${p.id}:${p.ready}:${p.mockMode ? "mock" : "live"}`).join(", ")], ["email verification metadata", JSON.stringify(metadata.emailVerification)], ["password reset metadata", JSON.stringify(metadata.passwordReset)], ["offline queue", `${offlineEngine.getQueue().length} queued writes`], ["save status", "local metadata saved"],
  ];
  return <main className="dev-page"><section className="dev-header"><p className="eyebrow">/dev/auth-entry</p><h1>Auth entry validation</h1><p>Repository-only diagnostics for auth, session routing, invites, and onboarding continuation.</p></section><section className="dev-card">{rows.map(([label, value]) => <div className="dev-row" key={label}><span>{label}</span><strong>{value}</strong></div>)}</section><section className="dev-card"><h2>Invite statuses</h2>{inviteSamples.map((invite) => <div className="dev-row" key={invite.id}><span>{invite.code}</span><strong>{invite.type} · {invite.status} · {invite.tenantName}</strong></div>)}</section><section className="dev-card"><h2>Onboarding continuation</h2>{onboarding.steps.map((step) => <p key={step}>{step}</p>)}</section></main>;
}
