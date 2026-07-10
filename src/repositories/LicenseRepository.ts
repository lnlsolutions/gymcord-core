import type { EntityId, IsoDateTimeString } from "../types/domain";
import type { EntitlementOwnerType, EntitlementPlan } from "./EntitlementRepository";

export type LicenseStatus = "mock_active" | "active" | "past_due" | "cancelled";

export interface LicenseRecord {
  id: EntityId;
  tenantId: EntityId;
  ownerType: EntitlementOwnerType;
  plan: EntitlementPlan;
  status: LicenseStatus;
  provider: "mock" | "stripe_backend_future";
  providerCustomerId?: EntityId;
  providerSubscriptionId?: EntityId;
  seatsPurchased: number | "unlimited";
  metadata: Record<string, string>;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
}

export class LicenseRepository {
  mockLicense(tenantId: EntityId = "tenant-demo", ownerType: EntitlementOwnerType = "trainer", plan: EntitlementPlan = "Starter"): LicenseRecord {
    const timestamp = new Date().toISOString();
    return { id: `${tenantId}-license`, tenantId, ownerType, plan, status: "mock_active", provider: "mock", seatsPurchased: ownerType === "gym" ? 25 : ownerType === "trainer" ? 1 : 1, metadata: { secretKeysInFrontend: "false", checkoutCreation: "backend_future_only", paymentProcessing: "none" }, createdAt: timestamp, updatedAt: timestamp };
  }
}

export const licenseRepository = new LicenseRepository();
