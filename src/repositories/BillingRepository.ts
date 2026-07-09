import { apiClient } from "../api/client";
import { offlineEngine, type QueuedWrite } from "../services/sync";
import type { RepositoryResult } from "./base";
import type { EntityId, IsoDateTimeString } from "../types/domain";

export type BillingPlanStatus = "active" | "archived";
export type SubscriptionStatus = "trialing" | "active" | "past_due" | "cancelled" | "paused";
export type BillingPreferenceKey = "invoiceEmails" | "failedPaymentAlerts" | "trialEndingAlerts" | "portalAccess";

export interface BillingPlan {
  id: EntityId;
  organizationId: EntityId;
  name: string;
  status: BillingPlanStatus;
  stripePriceLookupKey?: string;
  metadata: Record<string, string>;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
  archivedAt?: IsoDateTimeString;
}

export interface BillingSubscription {
  id: EntityId;
  organizationId: EntityId;
  memberId?: EntityId;
  planId: EntityId;
  status: SubscriptionStatus;
  trialEndsAt?: IsoDateTimeString;
  cancelAtPeriodEnd: boolean;
  cancelledAt?: IsoDateTimeString;
  metadata: Record<string, string>;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
}

export interface BillingPreferences {
  id: EntityId;
  organizationId: EntityId;
  invoiceEmails: boolean;
  failedPaymentAlerts: boolean;
  trialEndingAlerts: boolean;
  portalAccess: boolean;
  notificationChannels: ("in_app" | "email" | "push")[];
  metadata: Record<string, string>;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
}

export interface BillingSnapshot {
  organizationId: EntityId;
  plans: BillingPlan[];
  subscriptions: BillingSubscription[];
  preferences: BillingPreferences;
  integrationReadiness: Record<"memberApp" | "trainerPortal" | "adminDashboard" | "notifications", "ready">;
  metadataContracts: Record<"customer" | "subscription" | "invoice" | "billingPortal" | "webhook", string[]>;
}

const plansPath = "/billingPlans";
const subscriptionsPath = "/billingSubscriptions";
const preferencesPath = "/billingPreferences";
const now = () => new Date().toISOString();
const source = (sourceName: string): RepositoryResult<unknown>["source"] => sourceName === "mock" || sourceName === "cache" ? sourceName : "remote";

export class BillingRepository {
  seedSamples(organizationId: EntityId = "org-demo"): BillingSnapshot {
    const timestamp = now();
    const plan: BillingPlan = { id: `${organizationId}-plan-coaching`, organizationId, name: "Coaching Membership", status: "active", stripePriceLookupKey: "coaching_membership_monthly", metadata: { surface: "member_app", entitlement: "coaching" }, createdAt: timestamp, updatedAt: timestamp };
    return {
      organizationId,
      plans: [plan],
      subscriptions: [{ id: `${organizationId}-sub-sample`, organizationId, memberId: "member-demo", planId: plan.id, status: "trialing", trialEndsAt: timestamp, cancelAtPeriodEnd: false, metadata: { source: "member_app", notificationAudience: "member" }, createdAt: timestamp, updatedAt: timestamp }],
      preferences: this.defaultPreferences(organizationId),
      integrationReadiness: { memberApp: "ready", trainerPortal: "ready", adminDashboard: "ready", notifications: "ready" },
      metadataContracts: {
        customer: ["organizationId", "memberId", "trainerId"],
        subscription: ["planId", "entitlement", "sourceSurface", "trialStatus"],
        invoice: ["organizationId", "subscriptionId", "failedPaymentAlertId"],
        billingPortal: ["returnSurface", "organizationId", "actorRole"],
        webhook: ["eventId", "eventType", "processedAt", "retryCount"],
      },
    };
  }

  async loadSnapshot(organizationId: EntityId = "org-demo"): Promise<RepositoryResult<BillingSnapshot>> {
    const [plans, subscriptions, preferences] = await Promise.all([
      apiClient.get<{ items: BillingPlan[] }>(plansPath),
      apiClient.get<{ items: BillingSubscription[] }>(subscriptionsPath),
      apiClient.get<BillingPreferences | null>(`${preferencesPath}/${organizationId}`),
    ]);
    const seeded = this.seedSamples(organizationId);
    return { data: { ...seeded, plans: plans.data.items.length ? plans.data.items.filter((item) => item.organizationId === organizationId && item.status !== "archived") : seeded.plans, subscriptions: subscriptions.data.items.length ? subscriptions.data.items.filter((item) => item.organizationId === organizationId && item.status !== "cancelled") : seeded.subscriptions, preferences: preferences.data ?? seeded.preferences }, source: source(preferences.source) };
  }

  async savePreferences(input: BillingPreferences): Promise<RepositoryResult<BillingPreferences>> {
    const payload: BillingPreferences = { ...input, id: input.id ?? input.organizationId, updatedAt: now() };
    const response = await apiClient.post<BillingPreferences, BillingPreferences>(preferencesPath, payload, { queueWhenOffline: true });
    return { data: response.data ?? payload, source: source(response.source) };
  }

  async archivePlan(id: EntityId): Promise<RepositoryResult<BillingPlan>> {
    const archivedAt = now();
    const response = await apiClient.patch<BillingPlan, Partial<BillingPlan>>(`${plansPath}/${id}`, { status: "archived", archivedAt, updatedAt: archivedAt }, { queueWhenOffline: false });
    return { data: response.data, source: source(response.source) };
  }

  async cancelSubscription(id: EntityId): Promise<RepositoryResult<BillingSubscription>> {
    const cancelledAt = now();
    const response = await apiClient.patch<BillingSubscription, Partial<BillingSubscription>>(`${subscriptionsPath}/${id}`, { status: "cancelled", cancelAtPeriodEnd: true, cancelledAt, updatedAt: cancelledAt }, { queueWhenOffline: false });
    return { data: response.data, source: source(response.source) };
  }

  getOfflineQueue(): QueuedWrite[] {
    return offlineEngine.getQueue().filter((item) => item.entity === preferencesPath || item.entity.startsWith(`${preferencesPath}/`));
  }

  defaultPreferences(organizationId: EntityId): BillingPreferences {
    const timestamp = now();
    return { id: organizationId, organizationId, invoiceEmails: true, failedPaymentAlerts: true, trialEndingAlerts: true, portalAccess: true, notificationChannels: ["in_app", "email"], metadata: { writes: "billing_preferences_only", paymentProcessing: "server_owned" }, createdAt: timestamp, updatedAt: timestamp };
  }
}

export const billingRepository = new BillingRepository();
