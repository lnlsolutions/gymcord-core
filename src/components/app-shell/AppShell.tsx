import { useEffect, useState, type ReactNode } from "react";
import { appShellRepository, type AppMode, type AppRouteId, type AppShellSnapshot } from "../../repositories/AppShellRepository";
import { AppNavigation } from "./AppNavigation";
import { BetaStatusPanel } from "./BetaStatusPanel";
import { ModuleLauncher } from "./ModuleLauncher";
import { RoleModeSwitcher } from "./RoleModeSwitcher";
import { RouteGuardNotice } from "./RouteGuardNotice";
import { TenantHeader } from "./TenantHeader";

export function AppShell({ activeRoute, onRouteChange, children, developer = false }: { activeRoute: AppRouteId; onRouteChange: (route: AppRouteId) => void; children: ReactNode; developer?: boolean }) {
  const [mode, setMode] = useState<AppMode>("consumer");
  const [snapshot, setSnapshot] = useState<AppShellSnapshot | null>(null);
  useEffect(() => { let mounted = true; appShellRepository.loadSnapshot(mode).then((result) => { if (mounted) setSnapshot(result.data); }); return () => { mounted = false; }; }, [mode]);
  if (!snapshot) return <main className="screen"><section className="panel">Loading app shell…</section></main>;
  const activeMeta = [...snapshot.visibleRoutes, ...snapshot.hiddenRoutes].find((route) => route.id === activeRoute);
  return <div className="app app-shell"><main className="screen shell-screen"><TenantHeader snapshot={snapshot} /><RoleModeSwitcher mode={mode} onModeChange={setMode} /><AppNavigation routes={snapshot.visibleRoutes} activeRoute={activeRoute} onRouteChange={onRouteChange} />{!developer && <ModuleLauncher routes={snapshot.visibleRoutes} onRouteChange={onRouteChange} />}<RouteGuardNotice route={activeMeta} />{children}<BetaStatusPanel snapshot={snapshot} /></main></div>;
}
