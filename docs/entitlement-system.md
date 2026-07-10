# GymCord Entitlement System

Build 046 adds a provider-agnostic entitlement foundation for production billing readiness. The architecture is intentionally repository-only in the frontend: it models access, limits, ownership, and provider readiness without importing the Stripe SDK, exposing secret keys, creating checkout sessions, or processing payments in the UI.

## Plan hierarchy

GymCord supports three ownership tracks:

| Owner | Plans | Purpose |
| --- | --- | --- |
| Consumer | Free → Pro | Individual member-owned subscriptions and personal training data access. |
| Trainer | Starter → Growth → Pro | Trainer-owned coaching workspaces, seats, member capacity, and advanced tooling. |
| Gym | Team → Enterprise | Gym-owned tenants with administrative controls, multi-trainer operations, white label, and API access. |

The hierarchy is represented by `EntitlementPlanDefinition.rank`. Higher-ranked plans in the same owner track are returned as `upgradesAvailable` by the entitlement snapshot.

## Feature gates

Entitlements are represented as named feature gates:

- Workout Builder
- Nutrition
- Atlas AI
- Messaging
- Community
- Progress
- Check-ins
- Exercise Library
- Trainer Dashboard
- Admin
- White Label
- API Access
- Analytics
- Calendar
- Challenges

`EntitlementRepository` returns active and locked features for the selected tenant and plan. `SubscriptionAccessRepository` turns those feature lists into access decisions with an `allowed` boolean and either `feature_enabled` or `upgrade_required` as the reason.

## Plan limits

Each plan includes metadata-ready limits for:

- Seat counts
- Member limits
- Trainer limits
- Gym limits
- API limits
- Storage limits
- Message limits
- AI token limits

AI token limits are metadata only. The frontend does not meter, charge, or enforce paid AI token consumption against a payment provider; it only exposes the limit shape so a future backend can enforce it consistently.

## Seat model

Seats are a top-level entitlement limit. Consumer plans default to one personal seat. Trainer plans add workspace seats as the trainer business grows. Gym plans model organization seats for multi-trainer teams and enterprise tenants. Seat usage is displayed on `/dev/entitlements` alongside member, trainer, gym, storage, and message usage.

## Consumer ownership

Consumer plans are user-owned. The consumer owns their own profile, progress, and subscription relationship. Trainer and gym plans must not claim ownership of consumer data simply because a member participates in a coaching or gym workspace.

## Trainer ownership

Trainer plans are workspace-owned. The trainer owns access to trainer tools, client capacity, trainer-dashboard workflows, and plan-specific operational limits. Trainer ownership grants coaching access metadata, not payment processing authority inside the frontend.

## Gym ownership

Gym plans are tenant-owned. The gym owns administrative access, tenant-level limits, trainer capacity, white-label eligibility, API access eligibility, and enterprise readiness metadata. Gym ownership is designed for future backend billing and tenant administration.

## Future Stripe backend integration

A future Stripe integration should live behind secure backend endpoints. The frontend entitlement repositories are already shaped for that backend to provide:

- Customer identifiers
- Subscription identifiers
- License status
- Purchased seats
- Plan lookup keys
- Feature flags
- Limit overrides
- Webhook-derived subscription state

The frontend must continue to avoid:

- Stripe secret keys
- Direct Stripe SDK imports for backend-only actions
- Checkout session creation from the UI
- Billing portal session creation from the UI
- Payment processing in browser code
- Webhook processing in browser code

When Stripe is added, the UI should request provider-safe entitlement snapshots from the backend and redirect only to backend-created checkout or portal URLs.

## Developer route

`/dev/entitlements` displays the current tenant, current plan, active features, locked features, usage, limits, upgrades available, mock provider mode, and provider readiness checks.
