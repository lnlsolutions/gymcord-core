import type { MembershipPlan } from "../../repositories/BillingRepository";
import { BillingCard, MetadataList } from "./shared";
export function GymPlanManagement({ plans, onArchive }: { plans: MembershipPlan[]; onArchive?: (plan: MembershipPlan) => void }) { return <BillingCard title="Gym plan management"><MetadataList rows={plans.map((plan) => ({ label: plan.name, value: plan.status, detail: <button type="button" onClick={() => onArchive?.(plan)}>Archive metadata</button> }))} /></BillingCard>; }
