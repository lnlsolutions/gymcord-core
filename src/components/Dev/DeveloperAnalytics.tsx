import { useEffect, useState } from "react";
import { telemetryService, type AnalyticsSnapshot } from "../../core/analytics";

function fmt(value?: string) { return value ? new Date(value).toLocaleString() : "—"; }
function metricValue(value: number, unit: string) { return `${value}${unit === "ms" ? "ms" : unit === "mb" ? "MB" : unit === "count" ? "" : unit}`; }

export function DeveloperAnalytics() {
  const [snapshot, setSnapshot] = useState<AnalyticsSnapshot>(() => telemetryService.snapshot());

  useEffect(() => {
    void telemetryService.initialize();
    const unsubscribe = telemetryService.subscribe(() => setSnapshot(telemetryService.snapshot()));
    const timer = window.setInterval(() => {
      telemetryService.performance.trackMemoryUsage();
      setSnapshot(telemetryService.snapshot());
    }, 2_000);
    return () => { unsubscribe(); window.clearInterval(timer); };
  }, []);

  return (
    <div className="app dev-events-page">
      <main className="screen">
        <header className="topbar">
          <div><p className="eyebrow">Hidden Developer Panel</p><h1>Analytics & Observability</h1></div>
          <div className="avatar">OBS</div>
        </header>

        <section className="card dev-panel">
          <h2>Realtime status</h2>
          <article className="dev-row"><strong>{snapshot.realtime.connected ? "Connected" : "Disconnected"}</strong><span>Provider: {snapshot.realtime.provider} · Last event: {fmt(snapshot.realtime.lastEventAt)}</span><small>Future providers: PostHog · Mixpanel · Amplitude · Google Analytics · Azure App Insights</small></article>
        </section>

        <section className="card dev-panel">
          <h2>Live events</h2>
          {snapshot.events.length === 0 ? <p className="muted">No analytics events captured yet.</p> : snapshot.events.slice(0, 12).map((event) => (
            <article className="dev-row" key={event.id}><strong>{event.name}</strong><span>{event.source} · {Object.keys(event.properties).length} properties</span><small>{fmt(event.occurredAt)}</small></article>
          ))}
        </section>

        <section className="card dev-panel">
          <h2>Performance metrics</h2>
          {snapshot.metrics.length === 0 ? <p className="muted">No metrics recorded yet.</p> : snapshot.metrics.slice(0, 12).map((metric) => (
            <article className="dev-row" key={metric.id}><strong>{metric.name}</strong><span>{metricValue(metric.value, metric.unit)}{metric.tags ? ` · ${Object.entries(metric.tags).map(([k, v]) => `${k}:${v}`).join(" · ")}` : ""}</span><small>{fmt(metric.recordedAt)}</small></article>
          ))}
        </section>

        <section className="card dev-panel">
          <h2>API latency</h2>
          {snapshot.apiLatency.length === 0 ? <p className="muted">No API latency captured yet.</p> : snapshot.apiLatency.slice(0, 8).map((metric) => (
            <article className="dev-row" key={metric.id}><strong>{metric.tags?.endpoint ?? "unknown endpoint"}</strong><span>{metricValue(metric.value, metric.unit)} · status {metric.tags?.status ?? "unknown"}</span><small>{fmt(metric.recordedAt)}</small></article>
          ))}
        </section>

        <section className="card dev-panel">
          <h2>Queue health</h2>
          <article className="dev-row"><strong>{snapshot.queue.status}</strong><span>Depth {snapshot.queue.depth} · Failed {snapshot.queue.failed}</span><small>Last flush {fmt(snapshot.queue.lastFlushAt)}</small></article>
        </section>

        <section className="card dev-panel">
          <h2>Recent errors</h2>
          {snapshot.errors.length === 0 ? <p className="muted">No crashes or errors reported.</p> : snapshot.errors.slice(0, 8).map((error) => (
            <article className="dev-row" key={error.id}><strong>{error.severity}: {error.message}</strong><span>{error.context ? JSON.stringify(error.context) : "No context"}</span><small>{fmt(error.occurredAt)}</small></article>
          ))}
        </section>
      </main>
    </div>
  );
}
