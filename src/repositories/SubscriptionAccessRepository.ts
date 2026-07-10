import type { EntityId, IsoDateTimeString } from "../types/domain";
import { entitlementRepository, type EntitlementFeature, type EntitlementOwnerType, type EntitlementPlan, type EntitlementSnapshot } from "./EntitlementRepository";
import { licenseRepository, type LicenseRecord } from "./LicenseRepository";

export interface SubscriptionAccessDecision {
  feature: EntitlementFeature;
  allowed: boolean;
  reason: "feature_enabled" | "upgrade_required";
  checkedAt: IsoDateTimeString;
}

export interface SubscriptionAccessSnapshot extends EntitlementSnapshot {
  license: LicenseRecord;
  decisions: SubscriptionAccessDecision[];
}

export class SubscriptionAccessRepository {
  loadAccess(input: { tenantId?: EntityId; tenantName?: string; ownerType?: EntitlementOwnerType; plan?: EntitlementPlan } = {}): SubscriptionAccessSnapshot {
    const entitlement = entitlementRepository.getSnapshot(input);
    const license = licenseRepository.mockLicense(entitlement.tenantId, entitlement.ownerType, entitlement.currentPlan.plan);
    const checkedAt = new Date().toISOString();
    return {
      ...entitlement,
      license,
      decisions: [...entitlement.activeFeatures, ...entitlement.lockedFeatures].map((feature) => ({ feature, allowed: entitlement.activeFeatures.includes(feature), reason: entitlement.activeFeatures.includes(feature) ? "feature_enabled" : "upgrade_required", checkedAt })),
    };
  }
}

export const subscriptionAccessRepository = new SubscriptionAccessRepository();
