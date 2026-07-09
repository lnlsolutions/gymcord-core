import type { MembershipPlan } from "../../repositories/BillingRepository";
import { BillingCard, formatMoney, MetadataList } from "./shared";
export function MembershipPlans({ plans }: { plans: MembershipPlan[] }) { return <BillingCard title="Membership plans"><MetadataList rows={plans.map((plan) => ({ label: plan.name, value: `${formatMoney(plan.amountCents, plan.currency)} / ${plan.interval}`, detail: `${plan.status} · ${plan.features.join(", ")} · ${plan.stripePrice.stripeId ?? "no Stripe price metadata"}` }))} /></BillingCard>; }
