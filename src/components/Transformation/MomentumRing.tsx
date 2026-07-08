import type { MomentumSnapshot } from "../../types/gymcord";

function clamp(value: number) {
  return Math.min(100, Math.max(0, value));
}

export function MomentumRing({ snapshot }: { snapshot: MomentumSnapshot }) {
  const radius = 82;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamp(snapshot.momentum) / 100) * circumference;

  return (
    <article className="momentum-ring-card">
      <div className="momentum-ring-shell" aria-label={`Momentum ${snapshot.momentum}%`}>
        <svg viewBox="0 0 200 200" role="img">
          <circle className="ring-bg" cx="100" cy="100" r={radius} />
          <circle className="ring-progress" cx="100" cy="100" r={radius} strokeDasharray={circumference} strokeDashoffset={offset} />
        </svg>
        <div className="ring-core">
          <span>Momentum</span>
          <strong>{snapshot.momentum}%</strong>
          <small>Level {snapshot.level}</small>
        </div>
      </div>
      <div className="ring-stat-grid">
        <span><strong>{snapshot.xpPercentage}%</strong>XP</span>
        <span><strong>{snapshot.streak}</strong>Streak</span>
        <span><strong>{snapshot.missionPercentage}%</strong>Mission</span>
      </div>
    </article>
  );
}
