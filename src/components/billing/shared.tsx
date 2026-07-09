import type { ReactNode } from "react";

export function formatMoney(cents: number, currency = "usd") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);
}

export function BillingCard({ title, children }: { title: string; children: ReactNode }) {
  return <section className="dev-card"><h2>{title}</h2>{children}</section>;
}

export function MetadataList({ rows }: { rows: { label: string; value: ReactNode; detail?: ReactNode }[] }) {
  return <div className="dev-grid">{rows.map((row) => <div className="dev-row" key={row.label}><strong>{row.label}</strong><span>{row.value}</span>{row.detail && <small>{row.detail}</small>}</div>)}</div>;
}
