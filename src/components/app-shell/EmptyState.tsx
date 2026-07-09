export function EmptyState({ title, description, actionLabel, onAction }: { title: string; description: string; actionLabel?: string; onAction?: () => void }) {
  return <section className="panel center empty-state"><span className="pill">Beta module</span><h3>{title}</h3><p>{description}</p>{actionLabel && <button className="primary-button" onClick={onAction}>{actionLabel}</button>}</section>;
}
