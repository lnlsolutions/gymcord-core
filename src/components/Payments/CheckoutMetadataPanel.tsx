import type { CheckoutMetadata } from "../../repositories/PaymentRepository";
export function CheckoutMetadataPanel({ metadata }: { metadata: CheckoutMetadata }) {
  return <section className="dev-card"><h2>Checkout metadata</h2><pre>{JSON.stringify(metadata, null, 2)}</pre></section>;
}
