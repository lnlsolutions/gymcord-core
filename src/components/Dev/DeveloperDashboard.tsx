import { useEffect, useState } from "react";
import { appConfig } from "../../config";
import { useAuth } from "../../auth";
import { dashboardRepository, type DashboardRepositoryState } from "../../repositories/DashboardRepository";

export function DeveloperDashboard() {
  const auth = useAuth();
  const [state, setState] = useState<DashboardRepositoryState | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    dashboardRepository.load(auth.session)
      .then((nextState) => { if (active) setState(nextState); })
      .catch((reason: Error) => { if (active) setError(reason.message); });
    return () => { active = false; };
  }, [auth.session]);

  return (
    <main className="page screen">
      <section className="panel premium-card">
        <p className="pill">Developer validation</p>
        <h2>Member dashboard repository check</h2>
        <p className="muted-line">Validates that dashboard data loads through DashboardRepository without importing Supabase from UI components.</p>
        {error && <p role="alert">Dashboard load failed: {error}</p>}
        <dl className="data-flow-grid">
          <div><dt>Route</dt><dd>/dev/dashboard</dd></div>
          <div><dt>Backend provider</dt><dd>{dashboardRepository.providerName}</dd></div>
          <div><dt>Configured mode</dt><dd>{appConfig.backend.provider}</dd></div>
          <div><dt>Supabase env present</dt><dd>{appConfig.backend.supabase.url && appConfig.backend.supabase.anonKey ? "yes" : "no"}</dd></div>
          <div><dt>Loaded via</dt><dd>{state?.loadedVia ?? "loading"}</dd></div>
          <div><dt>Current user</dt><dd>{state?.currentUser ?? "loading"}</dd></div>
          <div><dt>Daily logs</dt><dd>{state ? Object.keys(state.logs).length : "loading"}</dd></div>
          <div><dt>Last save status</dt><dd>{state?.lastSaveStatus ?? dashboardRepository.getLastSaveStatus()}</dd></div>
        </dl>
      </section>
    </main>
  );
}
