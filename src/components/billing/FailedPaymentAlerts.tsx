import type { FailedPaymentAlert } from "../../repositories/BillingRepository";
import { BillingCard, MetadataList } from "./shared";
export function FailedPaymentAlerts({ alerts }: { alerts: FailedPaymentAlert[] }) { return <BillingCard title="Failed payment alerts"><MetadataList rows={alerts.length ? alerts.map((alert) => ({ label: alert.severity, value: alert.message, detail: `${alert.status} · invoice ${alert.invoiceId ?? "n/a"}` })) : [{ label: "Alerts", value: "none" }]} /></BillingCard>; }
