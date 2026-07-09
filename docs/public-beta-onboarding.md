# Public Beta Onboarding

GymCord public beta introduces a SaaS entry experience where every person keeps one permanent account while entering the product as a consumer, trainer client, or gym member.

## Consumer flow

Consumers start from **Start Personal Journey**, choose the consumer path, complete profile, goals, units, and experience, select **No trainer**, and launch the app. No relationship metadata is required.

## Trainer flow

Trainer clients start from **Join Your Trainer**, enter profile details, validate a trainer invitation code, and store only trainer relationship metadata. The accepted invite links the account to the trainer tenant without moving or owning the user's personal data.

## Gym flow

Gym members start from **Join Your Gym**, enter profile details, validate a gym invitation code, and store only gym relationship metadata. If the member leaves the gym later, the relationship is archived instead of deleted.

## Tenant branding

Landing branding is resolved from gym domain, trainer domain, or tenant metadata. If no tenant signal is detected, the consumer GymCord brand is shown. Branding changes are presentation metadata only and do not alter account ownership.

## Account ownership

One permanent user account owns personal data forever. Workouts, nutrition, progress, Atlas AI history, messages, and achievements remain attached to the user account.

## Relationship ownership

Trainer and gym records are relationship metadata. Invitations can be pending, accepted, expired, or rejected. Leaving a trainer or gym archives the relationship and never deletes personal user history.

## Future production auth flow

Production auth should authenticate the user first, then resume the universal onboarding draft by account ID. Invitation validation should run server-side, enforce tenant membership rules, and return relationship metadata for optimistic client updates and offline queue reconciliation.
