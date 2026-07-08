-- GymCord production Supabase schema
-- Run before rls.sql and seed.sql in the Supabase SQL editor or psql.

create extension if not exists pgcrypto;

create type public.user_role as enum ('super_admin', 'organization_owner', 'gym_manager', 'trainer', 'member');
create type public.membership_status as enum ('active', 'trialing', 'past_due', 'paused', 'canceled');
create type public.subscription_status as enum ('trialing', 'active', 'past_due', 'canceled', 'unpaid', 'incomplete');
create type public.message_kind as enum ('direct', 'gym', 'organization', 'trainer_member');
create type public.notification_kind as enum ('system', 'mission', 'achievement', 'billing', 'message', 'workout');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  owner_user_id uuid,
  plan text not null default 'starter',
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.gyms (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  slug text not null,
  address jsonb not null default '{}'::jsonb,
  timezone text not null default 'UTC',
  logo_path text,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  primary_gym_id uuid references public.gyms(id) on delete set null,
  email text not null unique,
  full_name text not null,
  role public.user_role not null default 'member',
  avatar_path text,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_super_admin_org_check check (role = 'super_admin' or organization_id is not null)
);

alter table public.organizations
  add constraint organizations_owner_user_id_fkey foreign key (owner_user_id) references public.users(id) on delete set null;

create table public.trainer_profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null unique references public.users(id) on delete cascade,
  gym_id uuid references public.gyms(id) on delete set null,
  bio text,
  specialties text[] not null default '{}',
  certifications text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.member_profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null unique references public.users(id) on delete cascade,
  gym_id uuid references public.gyms(id) on delete set null,
  trainer_user_id uuid references public.users(id) on delete set null,
  goals text[] not null default '{}',
  birthdate date,
  emergency_contact jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  gym_id uuid references public.gyms(id) on delete set null,
  member_user_id uuid not null references public.users(id) on delete cascade,
  status public.membership_status not null default 'active',
  starts_at date not null default current_date,
  ends_at date,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.programs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  gym_id uuid references public.gyms(id) on delete set null,
  trainer_user_id uuid references public.users(id) on delete set null,
  member_user_id uuid references public.users(id) on delete set null,
  title text not null,
  description text,
  is_template boolean not null default false,
  starts_at date,
  ends_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  program_id uuid references public.programs(id) on delete cascade,
  gym_id uuid references public.gyms(id) on delete set null,
  title text not null,
  notes text,
  scheduled_for date,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workout_id uuid references public.workouts(id) on delete cascade,
  name text not null,
  muscle_group text,
  equipment text,
  instructions text,
  media_path text,
  prescription jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workout_id uuid references public.workouts(id) on delete set null,
  member_user_id uuid not null references public.users(id) on delete cascade,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  rating integer check (rating between 1 and 5),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.exercise_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workout_session_id uuid not null references public.workout_sessions(id) on delete cascade,
  exercise_id uuid references public.exercises(id) on delete set null,
  member_user_id uuid not null references public.users(id) on delete cascade,
  set_number integer not null default 1,
  reps integer,
  weight numeric(8,2),
  duration_seconds integer,
  distance_meters numeric(10,2),
  rpe numeric(3,1),
  notes text,
  created_at timestamptz not null default now()
);

create table public.missions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  gym_id uuid references public.gyms(id) on delete set null,
  title text not null,
  description text,
  xp_reward integer not null default 0,
  criteria jsonb not null default '{}'::jsonb,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.achievements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  mission_id uuid references public.missions(id) on delete set null,
  key text not null,
  title text not null,
  description text,
  awarded_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  unique (organization_id, user_id, key)
);

create table public.xp_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  source_type text not null,
  source_id uuid,
  points integer not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create table public.streaks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  streak_type text not null,
  current_count integer not null default 0,
  longest_count integer not null default 0,
  last_activity_on date,
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id, streak_type)
);

create table public.nutrition_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  logged_at timestamptz not null default now(),
  meal_type text,
  calories integer,
  protein_g numeric(8,2), carbs_g numeric(8,2), fat_g numeric(8,2),
  photo_path text,
  notes text,
  created_at timestamptz not null default now()
);

create table public.progress_photos (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  photo_path text not null,
  taken_on date not null default current_date,
  angle text,
  visibility text not null default 'private',
  created_at timestamptz not null default now()
);

create table public.measurements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  measured_on date not null default current_date,
  weight_kg numeric(8,2), body_fat_pct numeric(5,2), waist_cm numeric(8,2), chest_cm numeric(8,2), hips_cm numeric(8,2),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  gym_id uuid references public.gyms(id) on delete set null,
  sender_user_id uuid not null references public.users(id) on delete cascade,
  recipient_user_id uuid references public.users(id) on delete cascade,
  kind public.message_kind not null default 'direct',
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  kind public.notification_kind not null default 'system',
  title text not null,
  body text,
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.atlas_memory (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  memory_key text not null,
  memory_value jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id, memory_key)
);

create table public.atlas_conversations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  title text,
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  event_name text not null,
  source text,
  properties jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create table public.billing_customers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.organizations(id) on delete cascade,
  provider text not null default 'stripe',
  provider_customer_id text not null unique,
  billing_email text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  billing_customer_id uuid references public.billing_customers(id) on delete set null,
  provider_subscription_id text unique,
  status public.subscription_status not null default 'incomplete',
  plan text not null,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.gyms (organization_id);
create index on public.users (organization_id, role);
create index on public.memberships (organization_id, member_user_id);
create index on public.programs (organization_id, trainer_user_id, member_user_id);
create index on public.workouts (organization_id, program_id);
create index on public.exercises (organization_id, workout_id);
create index on public.workout_sessions (organization_id, member_user_id);
create index on public.exercise_logs (organization_id, member_user_id);
create index on public.messages (organization_id, sender_user_id, recipient_user_id, created_at desc);
create index on public.notifications (organization_id, user_id, read_at);
create index on public.analytics_events (organization_id, event_name, occurred_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_organizations_updated_at before update on public.organizations for each row execute function public.set_updated_at();
create trigger set_gyms_updated_at before update on public.gyms for each row execute function public.set_updated_at();
create trigger set_users_updated_at before update on public.users for each row execute function public.set_updated_at();
create trigger set_trainer_profiles_updated_at before update on public.trainer_profiles for each row execute function public.set_updated_at();
create trigger set_member_profiles_updated_at before update on public.member_profiles for each row execute function public.set_updated_at();
create trigger set_memberships_updated_at before update on public.memberships for each row execute function public.set_updated_at();
create trigger set_programs_updated_at before update on public.programs for each row execute function public.set_updated_at();
create trigger set_workouts_updated_at before update on public.workouts for each row execute function public.set_updated_at();
create trigger set_exercises_updated_at before update on public.exercises for each row execute function public.set_updated_at();
create trigger set_workout_sessions_updated_at before update on public.workout_sessions for each row execute function public.set_updated_at();
create trigger set_missions_updated_at before update on public.missions for each row execute function public.set_updated_at();
create trigger set_streaks_updated_at before update on public.streaks for each row execute function public.set_updated_at();
create trigger set_atlas_memory_updated_at before update on public.atlas_memory for each row execute function public.set_updated_at();
create trigger set_atlas_conversations_updated_at before update on public.atlas_conversations for each row execute function public.set_updated_at();
create trigger set_billing_customers_updated_at before update on public.billing_customers for each row execute function public.set_updated_at();
create trigger set_subscriptions_updated_at before update on public.subscriptions for each row execute function public.set_updated_at();
