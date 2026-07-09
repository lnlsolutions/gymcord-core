import { apiClient } from "../api/client";
import { offlineEngine, type QueuedWrite } from "../services/sync";
import type { ListResult, QueryOptions, RepositoryResult } from "./base";
import type { EntityId } from "../types/domain";

export type BillingStatus = "active" | "trialing" | "past_due" | "canceled" | "incomplete" | "unpaid" | "archived";
export type InvoiceStatus = "draft" | "open" | "paid" | "void" | "uncollectible";
export type PaymentMethodType = "card" | "bank_account" | "wallet" | "unknown";

export interface StripeMetadata { stripeId?: string; livemode: boolean; lastSyncedAt?: string; metadata: Record<string, string>; }
export interface MembershipPlan { id: EntityId; organizationId: EntityId; name: string; description: string; amountCents: number; currency: string; interval: "month" | "year"; status: "active" | "archived"; features: string[]; stripePrice: StripeMetadata; createdAt: string; updatedAt: string; deletedAt?: string; }
export interface BillingAccount { id: EntityId; organizationId: EntityId; ownerUserId: EntityId; customer: StripeMetadata & { email?: string; name?: string }; portal: BillingPortalMetadata; paymentMethod?: PaymentMethodMetadata; preferences: BillingPreferences; createdAt: string; updatedAt: string; }
export interface BillingPreferences { invoiceEmails: boolean; failedPaymentAlerts: boolean; renewalReminders: boolean; portalReturnPath: string; updatedAt: string; }
export interface SubscriptionRecord { id: EntityId; organizationId: EntityId; memberId: EntityId; planId: EntityId; status: BillingStatus; currentPeriodStart: string; currentPeriodEnd: string; cancelAtPeriodEnd: boolean; trial?: TrialMetadata; stripeSubscription: StripeMetadata; createdAt: string; updatedAt: string; deletedAt?: string; }
export interface InvoiceRecord { id: EntityId; organizationId: EntityId; subscriptionId: EntityId; status: InvoiceStatus; amountDueCents: number; amountPaidCents: number; currency: string; dueDate?: string; hostedInvoiceUrl?: string; stripeInvoice: StripeMetadata; createdAt: string; updatedAt: string; }
export interface PaymentMethodMetadata { id: EntityId; organizationId: EntityId; customerId: EntityId; type: PaymentMethodType; brand?: string; last4?: string; expMonth?: number; expYear?: number; billingName?: string; stripePaymentMethod: StripeMetadata; updatedAt: string; }
export interface BillingPortalMetadata { enabled: boolean; returnUrl?: string; configurationId?: string; lastSessionCreatedAt?: string; metadata: Record<string, string>; }
export interface TrialMetadata { active: boolean; startAt?: string; endAt?: string; daysRemaining: number; convertedAt?: string; }
export interface FailedPaymentAlert { id: EntityId; organizationId: EntityId; subscriptionId: EntityId; invoiceId?: EntityId; severity: "info" | "warning" | "critical"; message: string; status: "open" | "acknowledged" | "resolved" | "archived"; createdAt: string; updatedAt: string; }
export interface WebhookEventMetadata { id: EntityId; organizationId: EntityId; stripeEventId?: string; eventType: string; deliveryStatus: "received" | "processed" | "failed" | "ignored"; relatedCustomerId?: string; relatedSubscriptionId?: string; payloadMetadata: Record<string, string>; receivedAt: string; processedAt?: string; }
export interface BillingSnapshot { account: BillingAccount; plans: MembershipPlan[]; subscriptions: SubscriptionRecord[]; invoices: InvoiceRecord[]; failedPaymentAlerts: FailedPaymentAlert[]; webhookEvents: WebhookEventMetadata[]; }

const now = () => new Date().toISOString();
const source = (name: string): RepositoryResult<unknown>["source"] => name === "mock" || name === "cache" ? name : "remote";
const paths = { accounts: "/billingAccounts", plans: "/membershipPlans", subscriptions: "/billingSubscriptions", invoices: "/billingInvoices", alerts: "/billingFailedPaymentAlerts", webhooks: "/billingWebhookEvents" } as const;

export class BillingRepository {
  getOfflineQueue(): QueuedWrite[] { return offlineEngine.getQueue().filter((item) => item.entity.includes("billingPreference") || item.entity.includes("billingPreferences")); }
  defaultPreferences(): BillingPreferences { return { invoiceEmails: true, failedPaymentAlerts: true, renewalReminders: true, portalReturnPath: "/settings/billing", updatedAt: now() }; }

  seedSamples(organizationId = "org-demo", userId = "developer", memberId = "member-demo"): BillingSnapshot {
    const timestamp = now();
    const plan: MembershipPlan = { id: "plan-strength", organizationId, name: "Strength Studio Unlimited", description: "Unlimited group training plus member app access.", amountCents: 14900, currency: "usd", interval: "month", status: "active", features: ["Member app", "Trainer portal visibility", "Invoice history", "Failed payment notifications"], stripePrice: { stripeId: "price_metadata_only", livemode: false, lastSyncedAt: timestamp, metadata: { gymcordPlan: "strength-studio" } }, createdAt: timestamp, updatedAt: timestamp };
    const account: BillingAccount = { id: "billing-account-demo", organizationId, ownerUserId: userId, customer: { stripeId: "cus_metadata_only", livemode: false, lastSyncedAt: timestamp, email: "member@gymcord.test", name: "Demo Member", metadata: { gymcordOrganizationId: organizationId, gymcordUserId: userId } }, portal: { enabled: true, returnUrl: "/settings/billing", configurationId: "bpc_metadata_only", lastSessionCreatedAt: timestamp, metadata: { surface: "future-backend-action" } }, paymentMethod: { id: "pm-meta-demo", organizationId, customerId: "billing-account-demo", type: "card", brand: "visa", last4: "4242", expMonth: 12, expYear: 2030, billingName: "Demo Member", stripePaymentMethod: { stripeId: "pm_metadata_only", livemode: false, lastSyncedAt: timestamp, metadata: { source: "stripe-webhook" } }, updatedAt: timestamp }, preferences: this.defaultPreferences(), createdAt: timestamp, updatedAt: timestamp };
    const subscription: SubscriptionRecord = { id: "sub-demo", organizationId, memberId, planId: plan.id, status: "trialing", currentPeriodStart: timestamp, currentPeriodEnd: new Date(Date.now() + 14 * 86400000).toISOString(), cancelAtPeriodEnd: false, trial: { active: true, startAt: timestamp, endAt: new Date(Date.now() + 14 * 86400000).toISOString(), daysRemaining: 14 }, stripeSubscription: { stripeId: "sub_metadata_only", livemode: false, lastSyncedAt: timestamp, metadata: { gymcordMemberId: memberId, gymcordPlanId: plan.id } }, createdAt: timestamp, updatedAt: timestamp };
    const invoice: InvoiceRecord = { id: "in-demo", organizationId, subscriptionId: subscription.id, status: "open", amountDueCents: 14900, amountPaidCents: 0, currency: "usd", dueDate: subscription.currentPeriodEnd, stripeInvoice: { stripeId: "in_metadata_only", livemode: false, lastSyncedAt: timestamp, metadata: { collectionMethod: "charge_automatically" } }, createdAt: timestamp, updatedAt: timestamp };
    const alert: FailedPaymentAlert = { id: "alert-demo", organizationId, subscriptionId: subscription.id, invoiceId: invoice.id, severity: "warning", message: "Card retry scheduled by Stripe metadata webhook.", status: "open", createdAt: timestamp, updatedAt: timestamp };
    const webhook: WebhookEventMetadata = { id: "evt-demo", organizationId, stripeEventId: "evt_metadata_only", eventType: "invoice.payment_failed", deliveryStatus: "received", relatedCustomerId: account.customer.stripeId, relatedSubscriptionId: subscription.stripeSubscription.stripeId, payloadMetadata: { routedTo: "notifications", processing: "future-secure-backend" }, receivedAt: timestamp };
    return { account, plans: [plan], subscriptions: [subscription], invoices: [invoice], failedPaymentAlerts: [alert], webhookEvents: [webhook] };
  }

  async loadSnapshot(organizationId?: EntityId, userId?: EntityId): Promise<RepositoryResult<BillingSnapshot>> {
    const seeded = this.seedSamples(organizationId, userId);
    const [accounts, plans, subscriptions, invoices, alerts, webhooks] = await Promise.all([
      this.list<BillingAccount>(paths.accounts, organizationId), this.list<MembershipPlan>(paths.plans, organizationId), this.list<SubscriptionRecord>(paths.subscriptions, organizationId), this.list<InvoiceRecord>(paths.invoices, organizationId), this.list<FailedPaymentAlert>(paths.alerts, organizationId), this.list<WebhookEventMetadata>(paths.webhooks, organizationId),
    ]);
    return { source: accounts.source, data: { account: accounts.data.items[0] ?? seeded.account, plans: plans.data.items.length ? plans.data.items : seeded.plans, subscriptions: subscriptions.data.items.length ? subscriptions.data.items : seeded.subscriptions, invoices: invoices.data.items.length ? invoices.data.items : seeded.invoices, failedPaymentAlerts: alerts.data.items.length ? alerts.data.items : seeded.failedPaymentAlerts, webhookEvents: webhooks.data.items.length ? webhooks.data.items : seeded.webhookEvents } };
  }

  async savePreferences(account: BillingAccount, preferences: BillingPreferences): Promise<RepositoryResult<BillingAccount>> {
    const updated = { ...account, preferences: { ...preferences, updatedAt: now() }, updatedAt: now() };
    const response = await apiClient.patch<BillingAccount, Partial<BillingAccount>>(`${paths.accounts}/${account.id}`, updated, { queueWhenOffline: true });
    return { data: response.data, source: source(response.source) };
  }

  async archivePlan(plan: MembershipPlan): Promise<RepositoryResult<MembershipPlan>> { return this.patch<MembershipPlan>(paths.plans, plan.id, { status: "archived", deletedAt: now(), updatedAt: now() }); }
  async cancelSubscription(subscription: SubscriptionRecord): Promise<RepositoryResult<SubscriptionRecord>> { return this.patch<SubscriptionRecord>(paths.subscriptions, subscription.id, { status: "canceled", cancelAtPeriodEnd: true, deletedAt: now(), updatedAt: now() }); }
  private async list<T extends { organizationId?: EntityId; deletedAt?: string }>(path: string, organizationId?: EntityId): Promise<RepositoryResult<ListResult<T>>> { const response = await apiClient.get<ListResult<T>>(path, { headers: organizationId ? { "x-organization-id": organizationId } : undefined }); const items = (response.data.items ?? []).filter((item) => (!organizationId || item.organizationId === organizationId) && !item.deletedAt); return { data: { items, nextCursor: response.data.nextCursor }, source: source(response.source) }; }
  private async patch<T>(path: string, id: EntityId, payload: Partial<T>): Promise<RepositoryResult<T>> { const response = await apiClient.patch<T, Partial<T>>(`${path}/${id}`, payload, { queueWhenOffline: true }); return { data: response.data, source: source(response.source) }; }
}

export const billingRepository = new BillingRepository();
