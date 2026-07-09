import type { QADiagnosticSnapshot } from "../../repositories/QARepository";

export function RouteAvailabilityMatrix({ snapshot }: { snapshot: QADiagnosticSnapshot }) {
  return (
    <section className="shell-panel">
      <h2>Route availability matrix</h2>
      <div className="qa-route-matrix">
        {snapshot.routes.map((route) => (
          <article key={route.id} className="qa-route-row">
            <strong>{route.label}</strong>
            <span>{route.path}</span>
            <span>{route.modes.join(", ")}</span>
            <span>{route.guard.requiresAuth ? "auth" : "public"} · {route.guard.providerMapping}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
