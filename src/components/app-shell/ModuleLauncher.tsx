import type { AppRouteId, AppRouteMeta } from "../../repositories/AppShellRepository";
export function ModuleLauncher({ routes, onRouteChange }: { routes: AppRouteMeta[]; onRouteChange: (route: AppRouteId) => void }) {
  return <section className="panel"><h3>Dashboard shortcuts</h3><div className="module-grid">{routes.slice(0, 6).map((route) => <button key={route.id} onClick={() => onRouteChange(route.id)}><span className="pill">{route.betaStatus}</span><strong>{route.label}</strong><small>{route.description}</small></button>)}</div></section>;
}
