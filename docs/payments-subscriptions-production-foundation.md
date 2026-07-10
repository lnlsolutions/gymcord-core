# Payments + Subscriptions Production Foundation V1

GymCord payments are implemented as a repository-only, metadata-ready foundation. The public routes `/pricing`, `/subscribe`, `/subscribe/consumer`, `/subscribe/trainer`, `/subscribe/gym`, and `/billing` render subscription metadata without creating checkout sessions or processing payments in the browser. The developer route `/dev/payments` displays the active provider, provider status, selected plan, checkout metadata, customer metadata, subscription metadata, invoice metadata, trial metadata, failed payment metadata, billing portal metadata, cancellation metadata, offline queue, and save status.

## Repository boundary

Payment UI components import only `PaymentRepository`, `SubscriptionRepository`, and `CheckoutRepository`. They do not import `stripe`, `@stripe/stripe-js`, `@supabase/supabase-js`, `getSupabaseClient`, or `SupabaseProvider`. Provider mode is metadata-ready only; secure backend actions must create checkout sessions, validate coupons, calculate taxes/proration, create billing portal sessions, process webhooks, and reconcile invoices.

## Metadata supported

- Consumer monthly subscription metadata.
- Trainer business subscription metadata.
- Gym enterprise subscription metadata.
- Trial metadata.
- Coupon/promo metadata.
- Checkout session metadata.
- Customer metadata.
- Subscription status metadata.
- Invoice metadata.
- Failed payment metadata.
- Billing portal metadata.
- Plan upgrade/downgrade metadata.
- Cancellation metadata.

## Data ownership and access rules

Consumer subscriptions are independent from trainer and gym relationships. Trainer subscriptions can grant coaching access but never own personal data. Gym subscriptions can grant gym/team access but never own personal data. Cancellation and archive behavior is represented as metadata; no hard deletes are used.

## Mock mode and provider mode

Mock mode works without payment provider configuration and queues metadata writes through the offline queue for local validation. Provider mode remains metadata-ready only and intentionally exposes no client secret, publishable-key checkout construction, or direct payment-processing action in UI code.

## Registry blocker

`npm ci` was attempted for this build. If registry authorization blocks installation in the target environment, the exact npm error should be copied into this section and the PR summary before merging. In this run, `npm ci` was blocked by `E403 403 Forbidden - GET https://registry.npmjs.org/@testing-library%2fjest-dom`. Because dependencies were not installed, `npm run build` could not resolve React, Supabase, Vite, Vitest, lucide-react, or Recharts modules, and `npm run test` failed with `vitest: not found`.
