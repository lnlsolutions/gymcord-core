# Payments + subscriptions production foundation validation

Build 045 validates PR #74 after the repository history already includes the PR #72 and PR #73 merge commits. The current branch log shows `Merge pull request #73 from lnlsolutions/codex/validate-pr-#72-for-atlas-ai` at `e4d7487`, so this work is based on the latest available mainline history in this checkout. No separate remote is configured in this container, so validation is limited to the local branch history provided for PR #74.

## Package manifest sync

`package.json` and `package-lock.json` remain synchronized. This pass made no dependency changes; both files continue to declare the existing application dependencies, including `@supabase/supabase-js`, without introducing Stripe packages or other payment SDKs.

## Registry/install validation

`npm ci` is blocked by npm registry authorization in this environment:

```text
npm error code E403
npm error 403 403 Forbidden - GET https://registry.npmjs.org/@testing-library%2fjest-dom
npm error 403 In most cases, you or one of your dependencies are requesting
npm error 403 a package version that is forbidden by your security policy, or
npm error 403 on a server you do not have access to.
```

Because dependency installation fails before `node_modules` is hydrated, `npm run build` cannot complete and reports missing packages such as `react`, `react/jsx-runtime`, `@supabase/supabase-js`, `lucide-react`, and `recharts`. `npm run test` cannot find `vitest` for the same reason.

## Routes and route-conflict validation

The following routes are present in `src/App.tsx` and are exact-path checks, so `/billing` does not conflict with `/dev/billing` and `/dev/payments` is separate from both billing surfaces:

- `/pricing`
- `/subscribe`
- `/subscribe/consumer`
- `/subscribe/trainer`
- `/subscribe/gym`
- `/billing`
- `/dev/payments`

Public `/billing` renders `BillingHome`, which is mock/metadata-safe and does not expose protected account-specific billing data. Existing `/dev/billing` remains the authenticated developer diagnostics route.

## Component validation

The requested components exist:

- `PricingPage`
- `SubscribePage`
- `ConsumerSubscription`
- `TrainerSubscription`
- `GymSubscription`
- `BillingHome`
- `PaymentStatusPanel`
- `SubscriptionPlanCard`
- `CheckoutMetadataPanel`
- `PaymentProviderStatus`

## Repository validation

The requested repositories exist:

- `PaymentRepository`
- `SubscriptionRepository`
- `CheckoutRepository`

## Subscription and checkout metadata support

The subscription/payment metadata model covers:

- consumer monthly subscription
- trainer business subscription
- gym enterprise subscription
- trial metadata
- coupon and promo metadata
- checkout session metadata
- customer metadata
- subscription status metadata
- invoice metadata
- failed payment metadata
- billing portal metadata
- upgrade metadata
- downgrade metadata
- cancellation/archive metadata

Cancellation/archive metadata is intentionally used instead of hard deletion.

## `/dev/payments` display validation

`/dev/payments` displays:

- active provider
- payment provider status
- selected plan
- checkout metadata
- customer metadata
- subscription metadata
- invoice metadata
- trial metadata
- failed payment metadata
- billing portal metadata
- cancellation metadata
- offline queue
- save status

## UI import and security boundary validation

UI components do not import:

- `stripe`
- `@stripe/stripe-js`
- `@supabase/supabase-js`
- `getSupabaseClient`
- `SupabaseProvider`

Security boundaries remain metadata-only:

- no client-side secret keys
- no direct payment processing in UI
- no checkout session creation directly in UI
- no billing portal session creation directly in UI
- no webhook processing in UI
- secure backend actions remain future integration only
- no security bypass was added

## Mock mode and provider mode

Mock mode works without payment-provider configuration because `PaymentRepository.providerStatus()` derives readiness from the existing backend provider and reports configuration as not required when `VITE_BACKEND_PROVIDER` is mock. Provider mode is metadata-ready only; it records readiness and metadata contracts but does not create sessions, portals, webhooks, or transactions from UI code.

## Offline queue boundary

The payments offline queue uses `/paymentMetadata` writes only. It stores payment/subscription metadata saves for validation and never queues real financial transactions, checkout creation, billing portal creation, payment attempts, invoice collection, or webhook processing.

## Relationship and ownership boundaries

- Consumer subscriptions remain independent from trainer and gym relationships.
- Trainer subscriptions grant coaching access metadata only and never own member data.
- Gym subscriptions grant organization access metadata only and never own member data.

## Commands run

- `git log --oneline -5`
- `node -e "const fs=require('fs'); const p=require('./package.json'); const l=require('./package-lock.json'); const root=l.packages['']; const same=(a,b)=>JSON.stringify(a||{})===JSON.stringify(b||{}); if(!same(p.dependencies, root.dependencies)||!same(p.devDependencies, root.devDependencies)) process.exit(1);"`
- `npm ci`
- `npm run build`
- `npm run test`
- `rg -n 'stripe|@stripe/stripe-js|@supabase/supabase-js|getSupabaseClient|SupabaseProvider' src/components --glob '*.{ts,tsx}'`
