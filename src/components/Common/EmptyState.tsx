import type { ReactNode } from "react";

export function EmptyState({ icon, headline, description, cta, onAction }: { icon: ReactNode; headline: string; description: string; cta: string; onAction?: () => void }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3>{headline}</h3>
      <p>{description}</p>
      <button className="secondary-button" onClick={onAction}>{cta}</button>
    </div>
  );
}
