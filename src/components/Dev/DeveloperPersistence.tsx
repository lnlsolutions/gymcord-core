import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth";
import { dailyActivityRepository, type PersistenceState } from "../../repositories/DailyActivityRepository";

function row(label: string, value: string, detail?: string) {
  return { label, value, detail };
}

function StatusCard({ title, rows }: { title: string; rows: { label: string; value: string; detail?: string }[] }) {
  return (
    <section className="dev-card">
      <h2>{title}</h2>
      <div className="dev-grid">
        {rows.map((item) => (
          <div className="dev-row" key={item.label}>
            <strong>{item.label}</strong>
            <span>{item.value}</span>
            {item.detail && <small>{item.detail}</small>}
          </div>
        ))}
      </div>
    </section>
  );
}

export function DeveloperPersistence() {
  const auth = useAuth();
  const repository = useMemo(() => dailyActivityRepository, []);
  const [state, setState] = useState<PersistenceState | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    repository.load(auth.session)
      .then((next) => active && setState(next))
      .catch((unknownError: Error) => active && setError(unknownError.message));
    return () => { active = false; };
  }, [auth.session, repository]);

  const latestMission = state?.missions[0];
  const latestXp = state?.xpEvents[0];
  const latestStreak = state?.streaks[0];
  const logDates = Object.keys(state?.logs ?? {}).sort().reverse();

  return (
    <main className="dev-page">
      <header className="dev-header">
        <p className="eyebrow">GymCord Developer Verification</p>
        <h1>Persistence</h1>
        <p>Runtime diagnostics for live daily activity repository loading, saving, and offline fallback state.</p>
      </header>

      <StatusCard title="Runtime" rows={[
        row("Active provider", state?.provider ?? repository.providerName),
        row("Current user", state?.currentUser ?? auth.session?.user.email ?? auth.status),
        row("Organization", state?.organization ?? auth.session?.organization?.name ?? "not loaded"),
        row("Last save status", state?.lastSaveStatus ?? "loading"),
        row("Offline queue state", `${state?.offlineQueueSize ?? repository.getOfflineQueue().length} queued write(s)`),
      ]} />

      <StatusCard title="Loaded Activity" rows={[
        row("Loaded daily logs", `${logDates.length}`, logDates.slice(0, 7).join(", ") || "No persisted logs yet"),
        row("Latest mission", latestMission?.title ?? "No mission persisted", latestMission ? `${latestMission.date} · ${latestMission.completionPercentage}% complete` : undefined),
        row("Latest XP event", latestXp ? `${latestXp.points} XP` : "No XP event persisted", latestXp?.reason),
        row("Latest streak", latestStreak ? `${latestStreak.currentCount} current / ${latestStreak.longestCount} longest` : "No streak persisted", latestStreak?.lastActivityOn),
      ]} />

      {error && <StatusCard title="Load Error" rows={[row("Repository", "failed", error)]} />}

      <section className="dev-card">
        <h2>Daily logs snapshot</h2>
        <pre>{JSON.stringify(state?.logs ?? {}, null, 2)}</pre>
      </section>
    </main>
  );
}
