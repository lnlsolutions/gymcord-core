import { appConfig } from "../config";
import { offlineEngine, type QueuedWrite } from "../services/sync";
import type { EntityId, IsoDateTimeString } from "../types/domain";

export type PaymentProviderMode = "mock" | "provider_metadata_ready";
export type PaymentProviderStatusValue = "mock_ready" | "configuration_not_required" | "metadata_ready";

export interface PaymentProviderStatus {
  activeProvider: string;
  mode: PaymentProviderMode;
  status: PaymentProviderStatusValue;
  clientSecretsInUi: false;
  directPaymentProcessingInUi: false;
  checkoutSessionCreationInUi: false;
  billingPortalSessionCreationInUi: false;
  webhookProcessingInUi: false;
  secureBackendActions: "future_integration_only";
}

export interface CheckoutMetadata {
  id: EntityId;
  planId: EntityId;
  sessionIntent: "checkout_session_metadata_only";
  surface: "pricing" | "subscribe" | "dev_payments";
  customerId: EntityId;
  subscriptionStatus: string;
  couponCode?: string;
  promoCode?: string;
  trialDays?: number;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
}

export interface PaymentMetadataSnapshot {
  providerStatus: PaymentProviderStatus;
  selectedPlanId: EntityId;
  checkout: CheckoutMetadata;
  customerMetadata: Record<string, string>;
  subscriptionMetadata: Record<string, string>;
  invoiceMetadata: Record<string, string>;
  trialMetadata: Record<string, string>;
  failedPaymentMetadata: Record<string, string>;
  billingPortalMetadata: Record<string, string>;
  cancellationMetadata: Record<string, string>;
  offlineQueue: QueuedWrite[];
  saveStatus: string;
}

const paymentMetadataPath = "/paymentMetadata";
const now = () => new Date().toISOString();

export class PaymentRepository {
  providerStatus(): PaymentProviderStatus {
    return {
      activeProvider: appConfig.backend.provider,
      mode: appConfig.backend.provider === "mock" ? "mock" : "provider_metadata_ready",
      status: appConfig.backend.provider === "mock" ? "configuration_not_required" : "metadata_ready",
      clientSecretsInUi: false,
      directPaymentProcessingInUi: false,
      checkoutSessionCreationInUi: false,
      billingPortalSessionCreationInUi: false,
      webhookProcessingInUi: false,
      secureBackendActions: "future_integration_only",
    };
  }

  seedSnapshot(planId: EntityId = "consumer-monthly"): PaymentMetadataSnapshot {
    const timestamp = now();
    return {
      providerStatus: this.providerStatus(),
      selectedPlanId: planId,
      checkout: { id: "checkout-metadata-preview", planId, sessionIntent: "checkout_session_metadata_only", surface: "dev_payments", customerId: "customer-preview", subscriptionStatus: "trialing", couponCode: "WELCOME10", promoCode: "PROMO10", trialDays: 14, createdAt: timestamp, updatedAt: timestamp },
      customerMetadata: { customerId: "customer-preview", accountBoundary: "user_owned", memberDataOwnership: "never_owned_by_trainer_or_gym" },
      subscriptionMetadata: { planId, status: "trialing", upgrade: "metadata_only", downgrade: "metadata_only" },
      invoiceMetadata: { invoiceId: "invoice-preview", collection: "metadata_only", paymentProcessing: "backend_future_only" },
      trialMetadata: { trial: "supported", trialDays: "14", conversion: "metadata_only" },
      failedPaymentMetadata: { failedPayment: "supported", retryNotice: "metadata_only", transactionQueued: "false" },
      billingPortalMetadata: { billingPortal: "metadata_ready", sessionCreation: "backend_future_only" },
      cancellationMetadata: { cancellation: "archive_metadata_only", hardDelete: "false" },
      offlineQueue: this.getOfflineQueue(),
      saveStatus: "ready",
    };
  }

  saveMetadata(snapshot: PaymentMetadataSnapshot): QueuedWrite<PaymentMetadataSnapshot> {
    return offlineEngine.queueWrite({ entity: paymentMetadataPath, operation: "update", payload: { ...snapshot, saveStatus: "queued_metadata_write_only" } });
  }

  getOfflineQueue(): QueuedWrite[] {
    return offlineEngine.getQueue().filter((item) => item.entity === paymentMetadataPath);
  }
}

export const paymentRepository = new PaymentRepository();
