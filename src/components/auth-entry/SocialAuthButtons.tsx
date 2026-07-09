import { authEntryRepository, type SocialProvider } from "../../repositories/AuthEntryRepository";

export function SocialAuthButtons() {
  const metadata = authEntryRepository.getMetadata();
  function select(provider: SocialProvider) {
    localStorage.setItem("gc.auth.socialProvider", JSON.stringify({ provider, selectedAt: new Date().toISOString(), configured: metadata.socialProviders[provider].configured }));
    alert(`${provider} sign-in metadata captured. ${metadata.authMode === "mock" ? "Mock mode will continue with email auth." : "Provider redirect can be wired when secrets are configured."}`);
  }
  return <div className="module-grid">
    {Object.entries(metadata.socialProviders).map(([provider, item]) => <button key={provider} className="status-card" type="button" onClick={() => select(provider as SocialProvider)}>
      <h3>Continue with {provider}</h3><p>{item.configured ? "Provider configured" : "Provider-ready metadata; no secrets required yet"}</p>
    </button>)}
  </div>;
}
