import { useState, type FormEvent } from "react";
import { useAuth } from "./AuthContext";

export function LoadingScreen() {
  return (
    <main className="auth-screen">
      <section className="auth-card">
        <p className="eyebrow">GymCord</p>
        <h1>Restoring session…</h1>
        <p>Securing your organization, coaching data, and daily mission.</p>
      </section>
    </main>
  );
}

export function UnauthorizedScreen({ message = "You do not have permission to view this area." }: { message?: string }) {
  return (
    <main className="auth-screen">
      <section className="auth-card">
        <p className="eyebrow">Unauthorized</p>
        <h1>Access restricted</h1>
        <p>{message}</p>
      </section>
    </main>
  );
}

export function LoginScreen({ onModeChange }: { onModeChange: (mode: "login" | "signup" | "forgot") => void }) {
  const auth = useAuth();
  const [email, setEmail] = useState("member@gymcord.test");
  const [password, setPassword] = useState("mission-ready");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void auth.signIn({ email, password });
  };

  return (
    <AuthShell eyebrow="Welcome back" title="Sign in to GymCord" subtitle="Use the mock service today; swap in a production provider behind the same contract later.">
      <form className="auth-form" onSubmit={submit}>
        <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
        <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
        {auth.error && <p className="auth-error">{auth.error}</p>}
        <button className="primary-button" type="submit">Sign in</button>
      </form>
      <AuthLinks onModeChange={onModeChange} />
    </AuthShell>
  );
}

export function SignupScreen({ onModeChange }: { onModeChange: (mode: "login" | "signup" | "forgot") => void }) {
  const auth = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [role, setRole] = useState<"member" | "trainer">("member");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void auth.signUp({ displayName, organizationName, email, password, role });
  };

  return (
    <AuthShell eyebrow="Create account" title="Start your organization" subtitle="Users are created with an organization, brand, theme, settings, and member role.">
      <form className="auth-form" onSubmit={submit}>
        <label>Name<input value={displayName} onChange={(event) => setDisplayName(event.target.value)} required /></label>
        <label>Role<select value={role} onChange={(event) => setRole(event.target.value as "member" | "trainer")}><option value="member">Member</option><option value="trainer">Trainer</option></select></label>
        <label>Organization<input value={organizationName} onChange={(event) => setOrganizationName(event.target.value)} placeholder="Optional" /></label>
        <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
        <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
        {auth.error && <p className="auth-error">{auth.error}</p>}
        <button className="primary-button" type="submit">Create account</button>
      </form>
      <button className="auth-link" type="button" onClick={() => onModeChange("login")}>Already have an account?</button>
    </AuthShell>
  );
}

export function ForgotPasswordScreen({ onModeChange }: { onModeChange: (mode: "login" | "signup" | "forgot") => void }) {
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void auth.requestPasswordReset(email).then(() => setSent(true));
  };

  return (
    <AuthShell eyebrow="Password help" title="Reset password" subtitle="The auth abstraction exposes reset flow without binding the app to a vendor SDK.">
      <form className="auth-form" onSubmit={submit}>
        <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
        {sent && <p className="auth-success">If this account exists, reset instructions were sent.</p>}
        <button className="primary-button" type="submit">Send reset link</button>
      </form>
      <button className="auth-link" type="button" onClick={() => onModeChange("login")}>Back to sign in</button>
    </AuthShell>
  );
}

function AuthShell({ eyebrow, title, subtitle, children }: { eyebrow: string; title: string; subtitle: string; children: React.ReactNode }) {
  return <main className="auth-screen"><section className="auth-card"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{subtitle}</p>{children}</section></main>;
}

function AuthLinks({ onModeChange }: { onModeChange: (mode: "login" | "signup" | "forgot") => void }) {
  return <div className="auth-actions"><button className="auth-link" type="button" onClick={() => onModeChange("signup")}>Create account</button><button className="auth-link" type="button" onClick={() => onModeChange("forgot")}>Forgot password?</button></div>;
}
