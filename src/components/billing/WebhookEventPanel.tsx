import type { WebhookEventMetadata } from "../../repositories/BillingRepository";
import { BillingCard, MetadataList } from "./shared";
export function WebhookEventPanel({ events }: { events: WebhookEventMetadata[] }) { return <BillingCard title="Webhook metadata"><MetadataList rows={events.map((event) => ({ label: event.eventType, value: event.deliveryStatus, detail: `${event.stripeEventId ?? event.id} · ${JSON.stringify(event.payloadMetadata)}` }))} /></BillingCard>; }
