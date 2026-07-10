import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useAuth } from "../auth";
import { authEntryRepository, inviteEntryRepository, sessionRoutingRepository, type AuthMode, type SocialProviderId } from "../repositories/AuthEntryRepository";
import type { OnboardingPath } from "../services/PublicBetaRepositories";

function pathMode(): AuthMode {
  const path = window.location.pathname;
  if (path.endsWith("/signup")) return "signup";
  if (path.endsWith("/forgot-password")) return "forgot-password";
  if (path.endsWith("/reset-password")) return "reset-password";
  if (path.endsWith("/verify-email")) return "verify-email";
  return "login";
}

export function AuthEntryScreen({ initialMode = pathMode() }: { initialMode?: AuthMode }) {
  const auth = useAuth();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("member@gymcord.test");
  const [password, setPassword] = useState("mission-ready");
  const [name, setName] = useState("GymCord Member");
  const [inviteCode, setInviteCode] = useState(new URLSearchParams(window.location.search).get("invite") ?? "");
  const [selectedPath, setSelectedPath] = useState<OnboardingPath>("consumer");
  const [message, setMessage] = useState("");
  const metadata = authEntryRepository.getMetadata(mode, auth.session);
  const pending = authEntryRepository.getPending();
  const decision = sessionRoutingRepository.getDecision(auth.session, pending);

  function preserveInvite() {
    const invite = inviteCode ? inviteEntryRepository.validateBeforeAuth(inviteCode) : pending.pendingInvite;
    const path = invite?.type === "trainer" ? "trainer_invite" : invite?.type === "gym" ? "gym_invite" : selectedPath;
    setSelectedPath(path);
    authEntryRepository.savePending({ mode, returnRoute: "/onboarding", selectedPath: path, pendingInvite: invite ?? null });
    return invite;
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    preserveInvite();
    if (mode === "signup") await auth.signUp({ displayName: name, email, password, role: "member" });
    else if (mode === "forgot-password") { await auth.requestPasswordReset(email); setMessage("If this account exists, reset instructions were sent."); }
    else await auth.signIn({ email, password });
  }

  function mockSocial(provider: SocialProviderId) {
    preserveInvite();
    setMessage(`${provider} provider metadata is ready; mock mode signs in without provider secrets.`);
    void auth.signIn({ email: `${provider}@gymcord.test`, password: "mock-provider" });
  }

  if (mode === "reset-password" || mode === "verify-email") {
    return <AuthShell mode={mode} setMode={setMode}><p>{mode === "reset-password" ? "Password reset metadata is ready from the URL token." : "Email verification metadata is ready from the confirmation link."}</p><pre>{JSON.stringify(mode === "reset-password" ? metadata.passwordReset : metadata.emailVerification, null, 2)}</pre></AuthShell>;
  }

  return <AuthShell mode={mode} setMode={setMode}>
    <form className="auth-form" onSubmit={submit}>
      {mode === "signup" && <label>Name<input value={name} onChange={(e) => setName(e.target.value)} required /></label>}
      <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
      {mode !== "forgot-password" && <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>}
      <label>Invite code<input value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} placeholder="TRAINER-BETA or GYM-BETA" /></label>
      <label>Onboarding path<select value={selectedPath} onChange={(e) => setSelectedPath(e.target.value as OnboardingPath)}><option value="consumer">Consumer</option><option value="trainer_invite">Trainer invite</option><option value="gym_invite">Gym invite</option></select></label>
      {auth.error && <p className="auth-error">{auth.error}</p>}{message && <p className="auth-success">{message}</p>}
      <button className="primary-button" type="submit">{mode === "signup" ? "Create beta account" : mode === "forgot-password" ? "Send reset link" : "Sign in"}</button>
    </form>
    <div className="button-row">{metadata.socialProviders.map((p) => <button key={p.id} type="button" onClick={() => mockSocial(p.id)}>{p.label}{p.mockMode ? " (mock)" : ""}</button>)}</div>
    {auth.isAuthenticated && <button className="auth-link" type="button" onClick={() => void auth.logout()}>Log out</button>}
    <small className="muted">Routing decision: {decision.route} · {decision.reason}</small>
  </AuthShell>;
}

function AuthShell({ mode, setMode, children }: { mode: AuthMode; setMode: (mode: AuthMode) => void; children: ReactNode }) {
  return <main className="auth-screen"><section className="auth-card"><p className="eyebrow">Auth entry</p><h1>{mode === "signup" ? "Create your account" : mode === "forgot-password" ? "Reset password" : mode === "login" ? "Welcome back" : "Auth metadata"}</h1><p>Beta-ready auth entry with invite preservation, social metadata, and protected app routing.</p>{children}<div className="auth-actions"><button className="auth-link" onClick={() => setMode("login")}>Login</button><button className="auth-link" onClick={() => setMode("signup")}>Sign up</button><button className="auth-link" onClick={() => setMode("forgot-password")}>Forgot password</button></div></section></main>;
}

export function InviteEntryScreen({ code }: { code: string }) {
  const [value, setValue] = useState(code);
  const invite = useMemo(() => value ? inviteEntryRepository.validateBeforeAuth(value) : null, [value]);
  if (code) authEntryRepository.setInviteFromCode(code);
  return <main className="screen"><section className="hero-card"><p className="pill">Invitation entry</p><h1>Join GymCord with an invite.</h1><p>Invite validation runs before auth and is preserved through signup/login.</p></section><section className="panel"><label>Invite code<input value={value} onChange={(e) => setValue(e.target.value)} /></label>{invite ? <div><h3>{invite.tenantName}</h3><p>{invite.type} invite from {invite.invitedBy}</p><p>Status: {invite.status}</p><a className="primary-button" href={`/auth/signup?invite=${invite.code}`}>Continue with preserved invite</a></div> : <p>Enter TRAINER-BETA, GYM-BETA, GYM-EXPIRED, TRAINER-REJECTED, or TRAINER-ACCEPTED.</p>}</section></main>;
}
