# Stripe Billing Validation Notes

Build 035 validates billing as a metadata-only integration surface for future Stripe Billing work. The current implementation does not collect card data, create payment intents, expose client-side secrets, or import Stripe SDKs from UI code.

## PR base and package validation

- The branch contains the latest local `main` history after PR #54 and PR #55 merges; `HEAD` is `f6435f5` (`Merge pull request #55 from lnlsolutions/codex/validate-ai-check-ins-in-pr-#54`).
- `package.json` and `package-lock.json` were checked with `npm ci`; npm did not report lockfile synchronization errors, but installation was blocked by registry authorization before dependencies could be installed.

## Developer route

- `/dev/billing` exists and renders a repository-only validation page.
- The page confirms billing is metadata-only and avoids UI payment processing, Stripe SDK usage, Supabase SDK usage, and client-side secret keys.
- The page exposes optimistic preference validation and archive/cancel lifecycle validation without redesigning the app UI.

## Repository contract

`BillingRepository` exists with the required methods:

- `loadSnapshot`
- `seedSamples`
- `savePreferences`
- `archivePlan`
- `cancelSubscription`
- `getOfflineQueue`

Offline support is intentionally scoped to `savePreferences` writes under `/billingPreferences`. Plan archive and subscription cancel operations are lifecycle metadata actions and are not queued as offline hard deletes.

## Provider routing

- Mock mode works without Supabase environment variables because `VITE_BACKEND_PROVIDER` defaults to `mock` and the billing repository routes through the shared API client.
- Supabase mode routes billing paths through provider mappings only:
  - `/billingPlans` -> `billing_plans`
  - `/billingSubscriptions` -> `billing_subscriptions`
  - `/billingPreferences` -> `billing_preferences`

## Forbidden UI imports validation

Forbidden imports were checked and are not present in UI components:

- `@supabase/supabase-js`
- `getSupabaseClient`
- `SupabaseProvider`
- `stripe`
- `@stripe/stripe-js`

The only Supabase SDK import remains in the backend provider adapter, not the UI.

## Metadata-only billing readiness

The billing snapshot documents integration readiness for:

- Member app
- Trainer Portal
- Admin Dashboard
- Notifications

Documented Stripe metadata contracts include:

- Customer metadata: `organizationId`, `memberId`, `trainerId`
- Subscription metadata: `planId`, `entitlement`, `sourceSurface`, `trialStatus`
- Invoice metadata: `organizationId`, `subscriptionId`, `failedPaymentAlertId`
- Billing portal metadata: `returnSurface`, `organizationId`, `actorRole`
- Webhook metadata: `eventId`, `eventType`, `processedAt`, `retryCount`

Trial status, failed payment alerts, and webhook retry metadata are represented as metadata fields so server-side Stripe Billing integration can map them without adding payment-processing behavior to the UI.

## Validation commands

- `npm ci` was blocked by npm registry authorization: `E403 403 Forbidden - GET https://registry.npmjs.org/@testing-library%2fjest-dom`.
- `npm run build` was blocked because dependencies were not installed after the registry 403.
- `npm run test` was blocked because `vitest` was not installed after the registry 403.
