import { useState, type FormEvent } from "react";
import { useAuth } from "../../auth";
import { authEntryRepository } from "../../repositories/AuthEntryRepository";
import { sessionRoutingRepository } from "../../repositories/SessionRoutingRepository";
import { PendingInviteBanner } from "./PendingInviteBanner";
import { SocialAuthButtons } from "./SocialAuthButtons";

export function SignupEntry() {
  const auth = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    await auth.signUp({ displayName, email, password });
    authEntryRepository.markEmailVerificationSent(email);
  }
  if (auth.isAuthenticated && auth.session) {
    authEntryRepository.recordAuthSuccess(auth.session);
    const decision = sessionRoutingRepository.decide(auth.session);
    window.location.href = decision.destination;
  }
  return <main className="screen public-beta-screen"><section className="hero-card"><p className="pill">Create one account forever</p><h1>Sign up for GymCord.</h1><p>Your trainer and gym links attach as access metadata, never as duplicate ownership.</p></section><PendingInviteBanner /><section className="panel"><SocialAuthButtons /><form onSubmit={submit} className="stack"><input placeholder="Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} /><input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} /><input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} /><button className="primary-button">Create account</button>{auth.error && <p>{auth.error}</p>}</form><p><a href="/auth/login">Already have an account?</a></p></section></main>;
}
