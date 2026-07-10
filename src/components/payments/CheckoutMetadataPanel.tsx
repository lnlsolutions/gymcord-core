import type { CheckoutSessionMetadata } from "../../repositories/CheckoutRepository";
export function CheckoutMetadataPanel({ checkout }: { checkout: CheckoutSessionMetadata }) { return <section className="panel"><p className="eyebrow">Checkout metadata</p><h2>{checkout.status}</h2><pre>{JSON.stringify(checkout, null, 2)}</pre></section>; }
