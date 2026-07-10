import { paymentRepository } from "../../repositories/PaymentRepository";
import { PaymentProviderStatus } from "../Payments/PaymentProviderStatus";
export function BillingHome() { const snapshot = paymentRepository.seedSnapshot(); return <main className="dev-page"><header className="dev-header"><h1>Billing</h1><p>Public billing is mock and metadata-safe until authenticated production billing is wired. It does not expose protected account-specific billing data.</p></header><PaymentProviderStatus status={snapshot.providerStatus} /></main>; }
