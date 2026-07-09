import type { SubscriptionRecord } from "../../repositories/BillingRepository";
import { BillingCard, MetadataList } from "./shared";
export function TrainerBillingView({ subscriptions }: { subscriptions: SubscriptionRecord[] }) { return <BillingCard title="Trainer billing visibility"><MetadataList rows={[{ label: "Trainer Portal", value: "integration-ready", detail: "Read-only subscription status and failed payment awareness." }, { label: "Visible subscriptions", value: subscriptions.length }]} /></BillingCard>; }
