import type { PaymentProviderStatus as PaymentProviderStatusType } from "../../repositories/PaymentRepository";
export function PaymentStatusPanel({ status }: { status: PaymentProviderStatusType }) {
  return <section className="dev-card"><h2>Payment provider status</h2><pre>{JSON.stringify(status, null, 2)}</pre></section>;
}
