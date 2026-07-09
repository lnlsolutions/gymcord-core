import type { QACheckItem, QAStatus } from "../../repositories/QARepository";

const statusLabel: Record<QAStatus, string> = { ready: "Ready", warning: "Needs review", blocked: "Blocked" };

export function QAPanel({ title, items }: { title: string; items: QACheckItem[] }) {
  return (
    <section className="shell-panel">
      <h2>{title}</h2>
      <div className="qa-list">
        {items.map((item) => (
          <article key={item.id} className={`qa-item qa-${item.status}`}>
            <div>
              <strong>{item.label}</strong>
              <p>{item.detail}</p>
            </div>
            <span>{statusLabel[item.status]}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
