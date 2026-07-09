import type { AppRouteId, AppRouteMeta } from "../../repositories/AppShellRepository";
export function AppNavigation({ routes, activeRoute, onRouteChange }: { routes: AppRouteMeta[]; activeRoute: AppRouteId; onRouteChange: (route: AppRouteId) => void }) {
  return <nav className="app-navigation">{routes.map((route) => <button key={route.id} className={route.id === activeRoute ? "active" : ""} onClick={() => onRouteChange(route.id)}><strong>{route.label}</strong><span>{route.betaStatus}</span></button>)}</nav>;
}
