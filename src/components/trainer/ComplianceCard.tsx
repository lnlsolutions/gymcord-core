export function ComplianceCard({ title, value, detail }: { title: string; value: number; detail: string }) {
  return <article className="panel premium-card"><p className="pill">{title}</p><h2>{value}%</h2><p className="muted-line">{detail}</p></article>;
}
