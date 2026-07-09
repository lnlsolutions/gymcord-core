import { useState, type FormEvent } from "react";
import { useAuth } from "../../auth";
import { authEntryRepository } from "../../repositories/AuthEntryRepository";
import { sessionRoutingRepository } from "../../repositories/SessionRoutingRepository";
import { PendingInviteBanner } from "./PendingInviteBanner";
import { SocialAuthButtons } from "./SocialAuthButtons";

export function LoginEntry() {
  const auth = useAuth();
  const [email, setEmail] = useState("demo@gymcord.app");
  const [password, setPassword] = useState("password");
  async function submit(event: FormEvent) { event.preventDefault(); await auth.signIn({ email, password }); }
  if (auth.isAuthenticated && auth.session) {
    authEntryRepository.recordAuthSuccess(auth.session);
    window.location.href = sessionRoutingRepository.decide(auth.session).destination;
  }
  return <main className="screen public-beta-screen"><section className="hero-card"><p className="pill">Welcome back</p><h1>Log in to continue onboarding or enter the app.</h1></section><PendingInviteBanner /><section className="panel"><SocialAuthButtons /><form onSubmit={submit} className="stack"><input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} /><input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} /><button className="primary-button">Log in</button>{auth.error && <p>{auth.error}</p>}</form><p><a href="/auth/forgot-password">Forgot password?</a> · <a href="/auth/signup">Create account</a></p></section></main>;
}
