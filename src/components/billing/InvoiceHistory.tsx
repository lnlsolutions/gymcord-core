import type { InvoiceRecord } from "../../repositories/BillingRepository";
import { BillingCard, formatMoney, MetadataList } from "./shared";
export function InvoiceHistory({ invoices }: { invoices: InvoiceRecord[] }) { return <BillingCard title="Invoice history"><MetadataList rows={invoices.map((invoice) => ({ label: invoice.id, value: `${invoice.status} · ${formatMoney(invoice.amountDueCents, invoice.currency)} due`, detail: `${formatMoney(invoice.amountPaidCents, invoice.currency)} paid · Stripe ${invoice.stripeInvoice.stripeId ?? "metadata pending"}` }))} /></BillingCard>; }
