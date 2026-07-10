import { entitlementRepository, featureLabels, type FeatureAccessDecision, type FeatureKey, type LimitKey, type PlanId, type UsageSnapshot } from "./EntitlementRepository";
import { licenseRepository, type LicenseMetadata } from "./LicenseRepository";

export interface ProviderReadinessMetadata { provider: "mock"; mode: "metadata-ready-only"; checkoutCreation: false; billingPortalCreation: false; paymentProcessing: false; webhookProcessing: false; secretKeysExposed: false; }
export interface AccessSnapshot { tenantId: string; currentPlan: PlanId; usage: UsageSnapshot; license: LicenseMetadata; activeFeatures: FeatureKey[]; lockedFeatures: FeatureKey[]; upgradesAvailable: PlanId[]; providerReadiness: ProviderReadinessMetadata; featureDecisions: FeatureAccessDecision[]; allPlanLimits: Record<PlanId, UsageSnapshot>; saveStatus: string; ownershipRules: string[]; }

export class SubscriptionAccessRepository {
  loadCurrentAccessSnapshot(): AccessSnapshot {
    const license = licenseRepository.loadCurrentLicense();
    const current = entitlementRepository.findPlan(license.plan);
    const usage: UsageSnapshot = { seatCount: 3, memberLimit: 42, trainerLimit: 2, gymLimit: 0, apiLimit: 1200, storageLimit: 18, messageLimit: 450, aiTokenLimit: 125000 };
    const features = Object.keys(featureLabels) as FeatureKey[];
    return { tenantId: license.tenantId, currentPlan: current.id, usage, license, activeFeatures: current.features, lockedFeatures: features.filter((feature) => !current.features.includes(feature)), upgradesAvailable: current.upgradeTo, providerReadiness: this.getProviderReadinessMetadata(), featureDecisions: features.map((feature) => this.evaluateFeature(current.id, feature, usage)), allPlanLimits: Object.fromEntries(entitlementRepository.listPlans().map((plan) => [plan.id, plan.limits])) as Record<PlanId, UsageSnapshot>, saveStatus: "metadata saved in mock mode only", ownershipRules: ["consumer owns personal data", "trainer plan owns workspace access only", "gym plan owns tenant access only", "trainer/gym plans never own member personal data"] };
  }
  evaluateFeature(plan: PlanId, feature: FeatureKey, usage = this.loadCurrentAccessSnapshot().usage) { return entitlementRepository.evaluateFeature(plan, feature, usage); }
  evaluateUsageLimit(plan: PlanId, limit: LimitKey, usageValue: number) { const planData = entitlementRepository.findPlan(plan); return { limit, allowed: usageValue < planData.limits[limit], currentUsage: usageValue, limitValue: planData.limits[limit], applicablePlan: planData.id, limitReached: usageValue >= planData.limits[limit] }; }
  listActiveFeatures(plan = licenseRepository.loadCurrentLicense().plan) { return entitlementRepository.findPlan(plan).features; }
  listLockedFeatures(plan = licenseRepository.loadCurrentLicense().plan) { const active = this.listActiveFeatures(plan); return (Object.keys(featureLabels) as FeatureKey[]).filter((feature) => !active.includes(feature)); }
  listAvailableUpgrades(plan = licenseRepository.loadCurrentLicense().plan) { return entitlementRepository.findPlan(plan).upgradeTo; }
  getProviderReadinessMetadata(): ProviderReadinessMetadata { return { provider: "mock", mode: "metadata-ready-only", checkoutCreation: false, billingPortalCreation: false, paymentProcessing: false, webhookProcessing: false, secretKeysExposed: false }; }
}
export const subscriptionAccessRepository = new SubscriptionAccessRepository();
