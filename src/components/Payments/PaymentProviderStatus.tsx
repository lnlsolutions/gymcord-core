import type { PaymentProviderStatus as PaymentProviderStatusType } from "../../repositories/PaymentRepository";
export function PaymentProviderStatus({ status }: { status: PaymentProviderStatusType }) {
  return <section className="dev-card"><h2>Active provider</h2><p>{status.activeProvider}</p><p>{status.mode}: {status.status}</p></section>;
}
