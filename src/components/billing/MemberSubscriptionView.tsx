import type { SubscriptionRecord } from "../../repositories/BillingRepository";
import { BillingCard, MetadataList } from "./shared";
export function MemberSubscriptionView({ subscription }: { subscription?: SubscriptionRecord }) { return <BillingCard title="Member subscription view"><MetadataList rows={[{ label: "Member app", value: subscription ? "integration-ready" : "awaiting subscription", detail: subscription?.memberId }, { label: "Direct payment processing", value: "not present" }]} /></BillingCard>; }
