import { useEffect, useState, type CSSProperties } from "react";
import { ArrowRight, Building2, Dumbbell, Sparkles, Users } from "lucide-react";
import { landingRepository, type LandingExperience } from "../repositories/LandingRepository";
import { invitationRepository } from "../repositories/InvitationRepository";
import { universalOnboardingRepository, type OnboardingPath, type UniversalOnboardingState } from "../repositories/OnboardingRepository";
import { offlineEngine } from "../services/sync";
import { appConfig } from "../config";

const pathCopy: Record<OnboardingPath, string> = { consumer: "Start Personal Journey", trainer: "Join Your Trainer", gym: "Join Your Gym" };

export function PublicLanding() {
  const [experience, setExperience] = useState<LandingExperience | null>(null);
  useEffect(() => { void landingRepository.getExperience().then(setExperience); }, []);
  const branding = experience?.branding;
  return <main className="public-page" style={{ "--brand-accent": branding?.accent ?? "#f97316" } as CSSProperties}>
    <nav className="public-nav"><strong>{branding?.logoText ?? "GC"}</strong><span>{branding?.name ?? "GymCord"}</span><a href="/demo">Demo</a><a href="/app">Login</a></nav>
    <section className="public-hero"><p className="pill"><Sparkles size={14}/> Public Beta</p><h1>{branding?.tagline ?? "One GymCord account forever."}</h1><p>Enter as a consumer, trainer client, or gym member while keeping workouts, nutrition, progress, Atlas AI history, messages, and achievements owned by you.</p><div className="public-cta-row">{experience?.ctas.map((cta) => <a className="primary-button" href={`/onboarding?path=${cta.path}`} key={cta.path}>{cta.label}<ArrowRight size={18}/></a>)}</div></section>
    <section className="public-grid">{experience?.sections.map((section) => <article className="panel" key={section.id}><h3>{section.title}</h3><p>{section.description}</p></article>)}</section>
    <footer className="public-footer">© GymCord Public Beta · Provider: {experience?.activeProvider ?? appConfig.backend.provider}</footer>
  </main>;
}

export function PublicOnboarding() {
  const initialPath = new URLSearchParams(window.location.search).get("path") as OnboardingPath | null;
  const [state, setState] = useState<UniversalOnboardingState>(() => ({ ...universalOnboardingRepository.getLocal(), selectedPath: initialPath ?? universalOnboardingRepository.getLocal().selectedPath }));
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const save = (patch: Partial<UniversalOnboardingState>) => universalOnboardingRepository.saveDraft(patch).then(setState);
  const validate = async () => {
    const invite = await invitationRepository.validate(code, state.selectedPath === "consumer" ? undefined : state.selectedPath);
    setMessage(invite ? `${invite.status} ${invite.kind} invite for ${invite.tenantName}` : "No invite found.");
    if (invite) await save({ pendingInvitation: invite, relationship: { kind: invite.kind, tenantId: invite.tenantId, tenantName: invite.tenantName, invitationCode: invite.code, invitationStatus: invite.status } });
  };
  return <main className="public-page onboarding-v1"><section className="panel"><p className="eyebrow">Universal Onboarding V1</p><h1>{pathCopy[state.selectedPath]}</h1><progress value={universalOnboardingRepository.completionPercentage(state)} max={100}/>
    <div className="stepper"><button onClick={() => save({ step: 1 })}>1 Path</button><button onClick={() => save({ step: 2 })}>2 Profile</button><button onClick={() => save({ step: 3 })}>3 Relationship</button><button onClick={() => save({ step: 4 })}>4 Finish</button></div>
    {state.step === 1 && <div className="option-grid">{(["consumer","trainer","gym"] as OnboardingPath[]).map((path) => <button className={state.selectedPath === path ? "selected" : ""} onClick={() => save({ selectedPath: path, relationship: { kind: path === "consumer" ? "none" : path } })} key={path}>{pathCopy[path]}</button>)}</div>}
    {state.step === 2 && <div className="form-grid"><input className="input" placeholder="Name" value={state.profile.name ?? ""} onChange={(e) => save({ profile: { name: e.target.value } })}/><input className="input" placeholder="Goals" value={state.profile.goal ?? ""} onChange={(e) => save({ profile: { goal: e.target.value, goals: e.target.value.split(",").map((g) => g.trim()).filter(Boolean) } })}/><select className="input" value={state.profile.units ?? "imperial"} onChange={(e) => save({ profile: { units: e.target.value as "imperial" | "metric" } })}><option>imperial</option><option>metric</option></select><select className="input" value={state.profile.experience ?? "Beginner"} onChange={(e) => save({ profile: { experience: e.target.value } })}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></div>}
    {state.step === 3 && <div><div className="option-grid"><button onClick={() => save({ relationship: { kind: "none" } })}>No trainer</button><button onClick={() => save({ relationship: { kind: "trainer" } })}>Join trainer</button><button onClick={() => save({ relationship: { kind: "gym" } })}>Join gym</button></div><input className="input" placeholder="Invitation code" value={code} onChange={(e) => setCode(e.target.value)}/><button className="secondary-button" onClick={validate}>Validate invitation</button><p>{message}</p></div>}
    {state.step === 4 && <div><p>One permanent account is ready. Relationship metadata can be archived without deleting personal data.</p><a className="primary-button" onClick={() => void universalOnboardingRepository.complete(null).then(setState)} href="/app">Launch app</a></div>}
  </section></main>;
}

export function BetaDemo() {
  const [mode, setMode] = useState<OnboardingPath>("consumer");
  return <main className="public-page"><section className="public-hero"><h1>Interactive beta demo</h1><p>Switch repository metadata without login. This does not bypass auth for the real app.</p><div className="public-cta-row">{(["consumer","trainer","gym"] as OnboardingPath[]).map((item) => <button className="primary-button" onClick={() => setMode(item)} key={item}>{item}</button>)}</div></section><section className="public-grid"><article className="panel"><Dumbbell/><h3>{mode === "consumer" ? "Personal Journey" : mode === "trainer" ? "Trainer Client" : "Gym Member"}</h3><p>Selected path: {mode}</p></article><article className="panel"><Users/><h3>Relationship metadata</h3><p>{mode === "consumer" ? "No trainer or gym attached." : `Pending ${mode} invite metadata only.`}</p></article><article className="panel"><Building2/><h3>Repository state</h3><pre>{JSON.stringify({ provider: appConfig.backend.provider, mode, offlineQueue: offlineEngine.getQueue().length }, null, 2)}</pre></article></section></main>;
}

export function DeveloperOnboarding() {
  const [state, setState] = useState(universalOnboardingRepository.getLocal());
  useEffect(() => { const id = window.setInterval(() => setState(universalOnboardingRepository.getLocal()), 1000); return () => window.clearInterval(id); }, []);
  const branding = landingRepository.detectBranding();
  return <main className="public-page"><section className="panel"><h1>Developer onboarding</h1><pre>{JSON.stringify({ activeProvider: appConfig.backend.provider, tenant: branding.tenantId ?? "consumer", branding, selectedOnboardingPath: state.selectedPath, pendingInvitation: state.pendingInvitation ?? null, relationshipMetadata: state.relationship, completionPercentage: universalOnboardingRepository.completionPercentage(state), offlineQueue: offlineEngine.getQueue() }, null, 2)}</pre></section></main>;
}
