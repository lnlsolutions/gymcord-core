# Stripe Billing V1

Build 035 adds a repository-first Stripe Billing metadata structure for gyms, membership plans, subscriptions, invoices, trials, failed payment alerts, billing portal metadata, and webhook event routing.

## Architecture

- UI components live in `src/components/billing/` and import only React, app config, auth state, and `BillingRepository`.
- `BillingRepository` owns all billing persistence paths and normalizes mock/Supabase provider responses.
- Supabase support is provided through API provider path mappings for billing tables; UI components do not import Supabase or Stripe SDKs.
- Mock mode seeds a complete billing snapshot so `/dev/billing` works without backend configuration.

## Stripe safety boundaries

- Stripe objects are metadata-only in the client.
- No direct payment processing happens in UI.
- No client-side secret keys are stored or expected.
- Billing portal session creation is represented as metadata only until future secure backend actions exist.
- Payment method information is limited to display-safe metadata such as brand, last four, and expiration.

## Offline and optimistic behavior

- Billing preference metadata supports optimistic UI updates.
- Offline queue inspection is limited to billing preference metadata writes.
- Plans and subscriptions use archive/cancel semantics instead of hard delete by default.

## Integration readiness

- Member app: `MemberSubscriptionView` exposes subscription/trial status and safe payment metadata surfaces.
- Trainer Portal: `TrainerBillingView` exposes read-only subscription visibility.
- Admin Dashboard: `GymPlanManagement` and `MembershipPlans` expose plan metadata and archive workflow readiness.
- Notifications: failed payment alerts and webhook metadata include routing fields for future notification fan-out.

## Developer page

Open `/dev/billing` to verify:

- active provider
- billing account loaded
- selected subscription
- invoices loaded
- payment method metadata
- billing portal metadata
- trial status
- failed payment alerts
- webhook metadata
- pending sync
- offline queue
- save status
