# GymCord Supabase Schema

This folder contains the production Supabase database baseline for GymCord.

## Files

1. `schema.sql` — extensions, enum types, tables, foreign keys, indexes, and `updated_at` triggers.
2. `rls.sql` — RLS helper functions, table policies, and storage bucket definitions/policies.
3. `seed.sql` — deterministic local/demo tenant with owner, manager, trainer, member, one program, workout, exercises, mission, and notification.

## How to run in Supabase

Run the files in order against a fresh Supabase project:

```sql
-- 1. Open Supabase Dashboard > SQL Editor and paste/run schema.sql.
-- 2. Paste/run rls.sql.
-- 3. For local/demo projects only, paste/run seed.sql.
```

For CLI workflows, copy the SQL into migrations or run with `psql` using your database connection string:

```bash
psql "$SUPABASE_DB_URL" -f supabase/schema.sql
psql "$SUPABASE_DB_URL" -f supabase/rls.sql
psql "$SUPABASE_DB_URL" -f supabase/seed.sql
```

Do not run `seed.sql` in production unless you intentionally want the demo users and sample tenant.

## Multi-tenant model

`organizations` is the tenant root. Every tenant-owned table includes `organization_id` and references `organizations(id)`. `users` maps Supabase Auth users (`auth.users.id`) to an organization, role, primary gym, and profile metadata. Super admins are the only users allowed to have no organization.

Core relationships:

- `organizations` has many `gyms`, `users`, billing records, subscriptions, analytics events, Atlas AI records, and tenant content.
- `gyms` belongs to an organization and can be attached to users, profiles, memberships, programs, workouts, and missions.
- `trainer_profiles` and `member_profiles` extend `users`; member profiles can reference their assigned trainer.
- `memberships` records a member's gym/organization membership status.
- `programs` are created by trainers/managers and can target one member or act as templates.
- `workouts` belong to programs; `exercises` belong to workouts.
- `workout_sessions` and `exercise_logs` store member activity.
- `missions`, `achievements`, `xp_events`, and `streaks` power gamification.
- `nutrition_logs`, `progress_photos`, and `measurements` store member wellness/progress data.
- `messages` and `notifications` power in-app communication.
- `atlas_memory` and `atlas_conversations` store tenant-scoped AI assistant context.
- `billing_customers` and `subscriptions` map organizations to payment provider records.

## RLS rules

RLS is enabled on every table. Policies use these helper functions:

- `current_user_role()` — returns the active user's GymCord role.
- `current_organization_id()` — returns the active user's organization.
- `is_super_admin()` — allows platform-wide administration.
- `is_org_admin()` — true for organization owners and gym managers.
- `same_org(organization_id)` — allows access only inside the user's organization unless super admin.
- `is_trainer_for(member_id)` — allows assigned trainers to access their member's coaching data.

Role behavior:

- **Super Admin**: cross-tenant access for platform operations and organization deletion.
- **Organization Owner**: full access within their organization, including billing/subscriptions and organization settings.
- **Gym Manager**: administrative access within their organization for gym operations and member/trainer data.
- **Trainer**: access to organization programming plus assigned members' sessions, logs, measurements, photos, nutrition, achievements, XP, and streaks.
- **Member**: access to their own private data, direct messages involving them, and tenant content intended for members.

## Storage bucket plan

`rls.sql` creates these Supabase Storage buckets:

- `profile-photos` — public avatars, max 5 MB, image MIME types.
- `progress-photos` — private member progress photos, max 10 MB, image MIME types.
- `meal-photos` — private nutrition photos, max 10 MB, image MIME types.
- `gym-logos` — public organization/gym branding, max 5 MB, image/SVG MIME types.
- `exercise-media` — private exercise images/videos, max 50 MB, image/video MIME types.

Objects should be stored under this path convention:

```text
<organization_id>/<user_id-or-asset-key>/<filename>
```

Storage policies validate the first folder segment against `current_organization_id()` unless the actor is a super admin.

## Seed data

`seed.sql` inserts four local/demo auth users with password `password123`:

- `owner@gymcord.test` — organization owner.
- `manager@gymcord.test` — gym manager.
- `trainer@gymcord.test` — trainer assigned to the sample member.
- `member@gymcord.test` — member with profile, membership, and welcome notification.

The seed also creates `GymCord Demo Organization`, `GymCord Demo Gym`, one strength program, one workout, two exercises, and a starter mission.
