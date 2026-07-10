import { appConfig } from "../config";
import { offlineEngine, type QueuedWrite } from "../services/sync";
import type { EntityId, IsoDateTimeString } from "../types/domain";
import type { RepositoryResult } from "./base";

export type PaymentAudience = "consumer" | "trainer" | "gym";
export type PaymentProvider = "mock" | "stripe" | "manual";
export type PaymentProviderState = "mock_ready" | "metadata_ready" | "backend_actions_required";

export interface PaymentProviderStatusSnapshot {
  activeProvider: PaymentProvider;
  state: PaymentProviderState;
  mode: "mock" | "provider_metadata_only";
  clientSecretPresent: false;
  uiSdkImportsAllowed: false;
  secureBackendActions: "future_integration";
  notes: string[];
}

export interface PaymentCustomerMetadata {
  id: EntityId;
  userId: EntityId;
  audience: PaymentAudience;
  organizationId?: EntityId;
  trainerId?: EntityId;
  gymId?: EntityId;
  providerCustomerId?: string;
  metadata: Record<string, string>;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
}

const now = () => new Date().toISOString();
const source = (): RepositoryResult<unknown>["source"] => appConfig.backend.provider === "mock" ? "mock" : "remote";
const paymentsPath = "/paymentCustomers";

export class PaymentRepository {
  getProviderStatus(): PaymentProviderStatusSnapshot {
    const provider = (appConfig.backend.provider === "mock" ? "mock" : "stripe") as PaymentProvider;
    return {
      activeProvider: provider,
      state: provider === "mock" ? "mock_ready" : "metadata_ready",
      mode: provider === "mock" ? "mock" : "provider_metadata_only",
      clientSecretPresent: false,
      uiSdkImportsAllowed: false,
      secureBackendActions: "future_integration",
      notes: ["UI stores metadata only", "Checkout and portal URLs must be created by secure backend actions", "No client-side payment processing is enabled"],
    };
  }

  buildCustomerMetadata(audience: PaymentAudience, userId: EntityId = "user-demo", organizationId = "org-demo"): PaymentCustomerMetadata {
    const timestamp = now();
    return {
      id: `customer-${audience}-${userId}`,
      userId,
      audience,
      organizationId: audience === "consumer" ? undefined : organizationId,
      trainerId: audience === "trainer" ? "trainer-demo" : undefined,
      gymId: audience === "gym" ? "gym-demo" : undefined,
      metadata: {
        audience,
        dataOwnership: audience === "consumer" ? "personal_subscription_independent" : "access_grant_only_no_personal_data_ownership",
        providerMode: this.getProviderStatus().mode,
      },
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  }

  async saveCustomerMetadata(input: PaymentCustomerMetadata): Promise<RepositoryResult<PaymentCustomerMetadata>> {
    offlineEngine.queueWrite({ entity: paymentsPath, operation: "create", payload: { ...input, updatedAt: now() } });
    return { data: { ...input, updatedAt: now() }, source: source() };
  }

  getOfflineQueue(): QueuedWrite[] {
    return offlineEngine.getQueue().filter((item) => item.entity === paymentsPath || item.entity.startsWith(`${paymentsPath}/`));
  }
}

export const paymentRepository = new PaymentRepository();
