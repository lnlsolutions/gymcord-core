import type { PaymentProviderStatusSnapshot } from "../../repositories/PaymentRepository";
export function PaymentProviderStatus({ status }: { status: PaymentProviderStatusSnapshot }) {
  return <section className="panel"><p className="eyebrow">Payment provider status</p><h2>{status.activeProvider}</h2><p>{status.state} · {status.mode}</p><ul>{status.notes.map((note) => <li key={note}>{note}</li>)}</ul><small>Client secrets: {String(status.clientSecretPresent)} · UI SDK imports: {String(status.uiSdkImportsAllowed)} · Backend actions: {status.secureBackendActions}</small></section>;
}
