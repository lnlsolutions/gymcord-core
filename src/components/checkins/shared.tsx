import type { ReactNode } from "react";
import type { MemberCheckIn } from "../../repositories/CheckInRepository";
export function Panel({ title, children }: { title: string; children: ReactNode }) { return <section className="card"><h3>{title}</h3>{children}</section>; }
export function Metric({ label, value }: { label: string; value: string | number }) { return <div className="dev-row"><strong>{label}</strong><span>{value}</span></div>; }
export function statusLabel(checkIn?: MemberCheckIn) { return checkIn ? checkIn.status.replace(/_/g, " ") : "none selected"; }
