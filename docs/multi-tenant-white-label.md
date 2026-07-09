# Multi-tenant identity and white-label foundation

Build 036 establishes a repository-owned foundation for GymCord multi-tenancy. The core rule is that the member owns the permanent user account and personal health/history data forever. Gyms and trainers own only access relationships, branding, permissions, memberships, and enterprise settings.

## User-owned data model

- A user account is permanent and can exist as a consumer-only GymCord account.
- Personal profile, progress history, daily logs, exports, and revocation records are user-owned.
- Tenant relationships reference the user account; they do not replace or own it.
- Access changes use `ended`, `paused`, or `archived` status by default instead of hard delete.
- Data access rules carry export-ready ownership metadata for user-owned, gym-visible, trainer-visible, shared, revoked, and export-ready scopes.

## Gym/trainer relationship model

Relationship records support consumer, trainer, gym, and enterprise gym relationship kinds with statuses: `active`, `invited`, `pending`, `paused`, `ended`, and `archived`.

Each relationship stores role permissions, visible access scopes, invite metadata, acceptance metadata, transfer metadata, revocation metadata, and subscription grant metadata. Enterprise gym subscriptions can grant app access without owning member personal data. Trainer subscriptions can grant coaching access without owning member personal data.

## Consumer signup flow

Personal signup creates or restores the permanent user account and starts in the default GymCord consumer brand. The consumer subscription remains independent from trainer and gym relationships.

## Trainer invite flow

Trainer onboarding links attach a trainer relationship to the existing or newly-created user account. Invite code metadata and acceptance metadata are captured. The user may revoke or end trainer access while keeping personal history.

## Gym enterprise invite flow

Gym enterprise onboarding links attach an enterprise gym membership relationship to the user account. The gym can grant app access, branding, role permissions, and membership features. It does not own personal data.

## Tenant switching behavior

The active tenant context and active trainer context are user-selectable settings. Switching context changes visible branding, permissions, and feature toggles for the session while preserving the underlying user-owned account.

## Data access / revocation behavior

Gym-visible and trainer-visible records are access scopes. Revoking access stores revocation metadata and moves the relationship to `ended` by default. Historical user-owned data remains with the user and remains export-ready.

## Subscription independence model

Consumer subscriptions, trainer coaching grants, and gym enterprise grants are modeled independently. A gym or trainer subscription can unlock access, but it does not transfer ownership of personal profile/history data.

## White-label branding model

Tenant branding stores brand name, logo/media metadata, primary color, accent color, domain/subdomain metadata, feature toggles, role permissions, app configuration, onboarding settings, billing metadata, and notification metadata. The `/dev/tenancy` preview renders these values and intentionally does not hardcode one permanent brand.

## Future production routing plan

For now, the white-label preview is scoped to `/dev/tenancy`. Production routing can later resolve custom domains/subdomains before app bootstrap, load the associated tenant branding through repository/provider mappings, and then hydrate active user relationship context after authentication.
