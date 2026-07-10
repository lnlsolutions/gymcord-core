import type { EntityId, IsoDateTimeString } from "../types/domain";
import type { PlanId, FeatureKey, LimitKey } from "./EntitlementRepository";

export interface LicenseMetadata { licenseId: EntityId; tenantId: EntityId; ownerType: "consumer" | "trainer" | "gym"; plan: PlanId; status: "trialing" | "active" | "past_due" | "canceled" | "archived"; effectiveDate: IsoDateTimeString; expirationDate: IsoDateTimeString | null; seatAllocation: number; planOverrides: Partial<Record<PlanId, string>>; featureOverrides: Partial<Record<FeatureKey, boolean>>; limitOverrides: Partial<Record<LimitKey, number>>; archived: boolean; archivedAt?: IsoDateTimeString; cancellationMetadata: Record<string, string>; }

const now = () => new Date().toISOString();

export class LicenseRepository {
  loadCurrentLicense(): LicenseMetadata {
    return { licenseId: "lic_mock_enterprise_001", tenantId: "tenant_gymcord_mock", ownerType: "trainer", plan: "trainer-growth", status: "active", effectiveDate: "2026-07-01T00:00:00.000Z", expirationDate: null, seatAllocation: 5, planOverrides: {}, featureOverrides: { white_label: false }, limitOverrides: { aiTokenLimit: 1000000 }, archived: false, cancellationMetadata: { cancellationCreatesArchiveOnly: "true", hardDelete: "forbidden", providerMode: "metadata_ready_mock", lastValidatedAt: now() } };
  }
  archive(licenseId: EntityId): LicenseMetadata { return { ...this.loadCurrentLicense(), licenseId, status: "archived", archived: true, archivedAt: now(), cancellationMetadata: { lifecycle: "archived_not_deleted" } }; }
}
export const licenseRepository = new LicenseRepository();
