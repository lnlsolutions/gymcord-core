import { paymentRepository, type CheckoutMetadata } from "./PaymentRepository";
import type { EntityId } from "../types/domain";

export class CheckoutRepository {
  prepareMetadata(planId: EntityId, surface: CheckoutMetadata["surface"] = "subscribe"): CheckoutMetadata {
    const snapshot = paymentRepository.seedSnapshot(planId);
    return { ...snapshot.checkout, planId, surface, sessionIntent: "checkout_session_metadata_only" };
  }
}

export const checkoutRepository = new CheckoutRepository();
