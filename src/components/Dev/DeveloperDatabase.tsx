import { useEffect, useState } from "react";
import { databaseConfig } from "../../config/database";
import { DatabaseHealthMonitor, type DatabaseHealthSnapshot } from "../../database";

const monitor = new DatabaseHealthMonitor(databaseConfig.provider);

export function DeveloperDatabase() {
  const [health, setHealth] = useState<DatabaseHealthSnapshot | null>(null);

  useEffect(() => {
    let active = true;
    const refresh = () => void monitor.snapshot().then((snapshot) => { if (active) setHealth(snapshot); });
    refresh();
    const timer = window.setInterval(refresh, databaseConfig.healthcheckIntervalMs);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  return (
    <main style={{ minHeight: "100vh", padding: "32px", background: "#09090f", color: "#f8f7ff", fontFamily: "Inter, sans-serif" }}>
      <p style={{ color: "#ff7ab8", letterSpacing: "0.14em", textTransform: "uppercase", fontSize: "12px" }}>GymCord Dev Console</p>
      <h1>Database Health</h1>
      <section style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <Metric label="Provider" value={health?.provider ?? databaseConfig.provider} />
        <Metric label="Connection" value={health?.connectionState ?? "checking"} />
        <Metric label="Latency" value={health?.latencyMs == null ? "—" : `${health.latencyMs}ms`} />
        <Metric label="Pending Sync" value={String(health?.pendingSyncCount ?? 0)} />
        <Metric label="Provider Status" value={health?.providerStatus ?? "unknown"} />
        <Metric label="Checked At" value={health?.checkedAt ?? "—"} />
      </section>
      {health?.message && <p style={{ color: "#ff8a65" }}>{health.message}</p>}
      <pre style={{ marginTop: "24px", padding: "16px", borderRadius: "16px", background: "#151522", overflow: "auto" }}>{JSON.stringify({ config: databaseConfig, health }, null, 2)}</pre>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <article style={{ padding: "18px", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "18px", background: "rgba(255,255,255,0.05)" }}><div style={{ color: "#a8a3b8", fontSize: "12px" }}>{label}</div><strong style={{ fontSize: "22px" }}>{value}</strong></article>;
}
