import type { AppRouteMeta } from "../../repositories/AppShellRepository";
export function RouteGuardNotice({ route }: { route?: AppRouteMeta }) {
  if (!route || route.visible) return null;
  return <section className="panel route-guard"><h3>Route hidden</h3><p>{route.label} is not visible because {route.guardReason}.</p><span>Required: {route.requiredPermissions.join(", ")}</span></section>;
}
