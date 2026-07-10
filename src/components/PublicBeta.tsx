import { useMemo, useState } from "react";
import { appConfig } from "../config";
import { invitationRepository, landingRepository, publicBetaOnboardingRepository, type OnboardingPath } from "../services/PublicBetaRepositories";

function routeLink(path: string, label: string) { return <a className="primary-button" href={path}>{label}</a>; }

export function PublicLanding() {
  const content = landingRepository.getLandingContent();
  return <main className="screen public-beta-screen">
    <section className="hero-card"><p className="pill">{content.branding.brandName} Public Beta</p><h1>hero: one account for every fitness relationship.</h1><p>Atlas AI, workout tracking, nutrition, progress, community, trainer platform, and gym platform tools launch from a user-owned profile.</p><div className="button-row">{routeLink("/onboarding", "Start Personal Journey")}{routeLink("/onboarding?invite=TRAINER-BETA", "Join Your Trainer")}{routeLink("/onboarding?invite=GYM-BETA", "Join Your Gym")}</div></section>
    <section className="panel"><h2>features</h2><div className="module-grid">{content.sections.filter((section) => section !== "hero" && section !== "footer").map((section) => <article key={section} className="status-card"><h3>{section}</h3><p>{section.includes("placeholder") ? "Public beta placeholder content reserved for validation." : `${section} included in the public beta landing.`}</p></article>)}</div></section>
    <footer className="panel"><h2>footer</h2><p>GymCord branding is the default when no tenant/domain metadata matches.</p></footer>
  </main>;
}

export function PublicOnboarding() {
  const params = new URLSearchParams(window.location.search);
  const invite = invitationRepository.validateCode(params.get("invite") ?? "");
  const initialPath: OnboardingPath = invite?.type === "trainer" ? "trainer_invite" : invite?.type === "gym" ? "gym_invite" : "consumer";
  const [path, setPath] = useState<OnboardingPath>(initialPath);
  const metadata = publicBetaOnboardingRepository.getMetadata(path, invite);
  return <main className="screen public-beta-screen">
    <section className="hero-card"><p className="pill">Public beta onboarding</p><h1>Choose how you are joining GymCord.</h1><p>Supports consumer path, trainer invite path, and gym invite path without creating duplicate accounts.</p></section>
    <section className="panel"><h2>Onboarding path</h2><div className="button-row"><button onClick={() => setPath("consumer")}>consumer path</button><button onClick={() => setPath("trainer_invite")}>trainer invite path</button><button onClick={() => setPath("gym_invite")}>gym invite path</button></div><p>Selected: {metadata.selectedPath}</p></section>
    <section className="panel"><h2>Steps</h2><ol>{metadata.steps.map((step) => <li key={step}>{step}</li>)}</ol><button className="primary-button" onClick={() => { localStorage.setItem(appConfig.storageKeys.profileComplete, "true"); window.location.href = "/app"; }}>finish / launch app</button></section>
    <section className="panel"><h2>Account model</h2><ul>{metadata.accountModel.map((item) => <li key={item}>{item}</li>)}</ul><p>Relationship step: gym/trainer metadata can be archived instead of deleted.</p></section>
  </main>;
}

export function PublicDemo() {
  const [mode, setMode] = useState<"consumer" | "trainer" | "gym">("consumer");
  const content = useMemo(() => landingRepository.getLandingContent(mode === "consumer" ? "default" : mode === "trainer" ? "atlasstrength.example.com" : "summit.example.com"), [mode]);
  return <main className="screen public-beta-screen"><section className="hero-card"><p className="pill">Demo Mode</p><h1>/demo switches consumer/trainer/gym without login.</h1><p>No auth bypass is used; this route renders repository metadata only.</p><div className="button-row"><button onClick={() => setMode("consumer")}>consumer</button><button onClick={() => setMode("trainer")}>trainer</button><button onClick={() => setMode("gym")}>gym</button></div></section><section className="panel"><h2>{mode} metadata</h2><pre>{JSON.stringify(content, null, 2)}</pre></section></main>;
}

export function PublicBetaDevOnboarding() {
  const pendingInvitation = invitationRepository.validateCode("TRAINER-BETA");
  const metadata = publicBetaOnboardingRepository.getMetadata("trainer_invite", pendingInvitation);
  const branding = landingRepository.getBrandingForDomain(pendingInvitation?.tenantId);
  return <main className="screen dev-screen"><section className="hero-card"><p className="eyebrow">Developer</p><h1>/dev/onboarding</h1><p>Public beta onboarding diagnostics.</p></section><section className="panel"><pre>{JSON.stringify({ activeProvider: appConfig.backend.provider, tenant: pendingInvitation?.tenantName, branding, selectedOnboardingPath: metadata.selectedPath, pendingInvitation, relationshipMetadata: pendingInvitation?.relationshipMetadata, completionPercentage: metadata.completionPercentage, offlineQueue: publicBetaOnboardingRepository.getOfflineQueue() }, null, 2)}</pre></section></main>;
}
