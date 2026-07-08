import { useEffect, useState } from "react";
import { notificationEngine, type AutomationSnapshot } from "../../core/automation";

function fmt(value?: string) {
  return value ? new Date(value).toLocaleString() : "—";
}

export function DeveloperEvents() {
  const [snapshot, setSnapshot] = useState<AutomationSnapshot>(() => notificationEngine.snapshot());

  useEffect(() => {
    const timer = window.setInterval(() => setSnapshot(notificationEngine.snapshot()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  const retry = (id: string) => {
    notificationEngine.retry(id);
    setSnapshot(notificationEngine.snapshot());
  };

  return (
    <div className="app dev-events-page">
      <main className="screen">
        <header className="topbar">
          <div>
            <p className="eyebrow">Hidden Developer Panel</p>
            <h1>Event Automation</h1>
          </div>
          <div className="avatar">DEV</div>
        </header>

        <section className="card dev-panel">
          <h2>Recent events</h2>
          {snapshot.recentEvents.length === 0 ? <p className="muted">No events captured yet.</p> : snapshot.recentEvents.map((event) => (
            <article className="dev-row" key={event.id}>
              <strong>{event.type}</strong>
              <span>{event.source}</span>
              <small>{fmt(event.occurredAt)}</small>
            </article>
          ))}
        </section>

        <section className="card dev-panel">
          <h2>Queued notifications</h2>
          {snapshot.queuedNotifications.length === 0 ? <p className="muted">No notifications queued.</p> : snapshot.queuedNotifications.map((job) => (
            <article className="dev-row" key={job.id}>
              <strong>{job.action.title}</strong>
              <span>{job.action.type} · {job.priority} · {job.status} · attempts {job.attempts}/{job.maxRetries}</span>
              <small>Scheduled {fmt(job.scheduledFor)} · expires {fmt(job.expiresAt)}</small>
            </article>
          ))}
        </section>

        <section className="card dev-panel">
          <h2>Automation execution history</h2>
          {snapshot.executionHistory.length === 0 ? <p className="muted">No automation executions yet.</p> : snapshot.executionHistory.map((execution) => (
            <article className="dev-row" key={execution.id}>
              <strong>{execution.ruleName}</strong>
              <span>{execution.eventType} → {execution.actionType} · {execution.status}</span>
              <small>{execution.message} · {fmt(execution.executedAt)}</small>
            </article>
          ))}
        </section>

        <section className="card dev-panel">
          <h2>Failed jobs</h2>
          {snapshot.failedJobs.length === 0 ? <p className="muted">No failed jobs.</p> : snapshot.failedJobs.map((job) => (
            <article className="dev-row" key={job.id}>
              <strong>{job.action.title}</strong>
              <span>{job.lastError ?? "Unknown failure"}</span>
              <button className="primary" onClick={() => retry(job.id)}>Retry action</button>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
