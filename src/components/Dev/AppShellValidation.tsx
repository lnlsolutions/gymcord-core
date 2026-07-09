import { useMemo, useState } from "react";
import { appShellRepository, type AppShellMode } from "../../repositories/AppShellRepository";

const modes: AppShellMode[] = ["consumer", "trainer", "gym", "admin"];

export function AppShellValidation() {
  const [mode, setMode] = useState<AppShellMode>("consumer");
  const snapshot = useMemo(() => appShellRepository.switchMode(mode), [mode]);
  const visibleRoutes = appShellRepository.getVisibleRoutes(mode);
  const hiddenRoutes = appShellRepository.getHiddenRoutes(mode);
  const offlineQueue = appShellRepository.getOfflineQueue();

  return (
    <main className="app-shell-validation">
      <header className="app-shell-header" style={{ borderColor: snapshot.activeBrand.primaryColor }}>
        <div>
          <p className="eyebrow">Tenant-aware header</p>
          <h1>{snapshot.activeBrand.name}</h1>
          <p>Active brand indicator: {snapshot.activeBrand.primaryColor}</p>
        </div>
        <div>
          <strong>{snapshot.activeContext.gymName}</strong>
          <span>{snapshot.activeContext.trainerName} · {snapshot.activeContext.memberName}</span>
        </div>
      </header>

      <section className="shell-panel">
        <h2>Role mode switcher</h2>
        <div className="mode-switcher">
          {modes.map((nextMode) => <button key={nextMode} className={nextMode === mode ? "active" : ""} onClick={() => setMode(nextMode)}>{nextMode}</button>)}
        </div>
      </section>

      <nav className="shell-panel" aria-label="Beta app shell navigation">
        <h2>Navigation</h2>
        <div className="module-grid">
          {visibleRoutes.map((route) => <a key={route.id} href={route.path}>{route.label}</a>)}
        </div>
      </nav>

      <section className="shell-panel">
        <h2>Module launcher</h2>
        <ul>{visibleRoutes.map((route) => <li key={route.id}>{route.module} · {route.status}</li>)}</ul>
      </section>

      <section className="shell-panel">
        <h2>Beta status panel</h2>
        <ul>{snapshot.betaStatus.map((item) => <li key={item}>{item}</li>)}</ul>
        <p>Provider: {snapshot.provider}. Mock mode works through repository fixtures; Supabase mode routes through provider mappings.</p>
      </section>

      <section className="shell-panel">
        <h2>Dev tools index</h2>
        <ul>{snapshot.devTools.map((tool) => <li key={tool}>{tool}</li>)}</ul>
      </section>

      <section className="shell-panel">
        <h2>Route guard metadata</h2>
        <ul>{visibleRoutes.map((route) => <li key={route.id}>{route.label}: auth={String(route.guard.requiresAuth)}, mapping={route.guard.providerMapping}</li>)}</ul>
      </section>

      <section className="shell-panel">
        <h2>Empty states</h2>
        <ul>{visibleRoutes.map((route) => <li key={route.id}>{route.emptyState}</li>)}</ul>
        <p>Hidden in {mode}: {hiddenRoutes.map((route) => route.label).join(", ") || "none"}</p>
        <p>Offline queue entries: {offlineQueue.length}</p>
      </section>
    </main>
  );
}
