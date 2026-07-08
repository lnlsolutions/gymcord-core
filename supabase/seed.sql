-- GymCord demo seed data. Run after schema.sql and rls.sql.
-- Auth users are represented by deterministic UUIDs for local/dev Supabase only.

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'owner@gymcord.test', crypt('password123', gen_salt('bf')), now(), now(), now()),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'manager@gymcord.test', crypt('password123', gen_salt('bf')), now(), now(), now()),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'trainer@gymcord.test', crypt('password123', gen_salt('bf')), now(), now(), now()),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'member@gymcord.test', crypt('password123', gen_salt('bf')), now(), now(), now())
on conflict (id) do nothing;

insert into public.organizations (id, name, slug, plan)
values ('10000000-0000-0000-0000-000000000001', 'GymCord Demo Organization', 'gymcord-demo', 'pro')
on conflict (slug) do nothing;

insert into public.gyms (id, organization_id, name, slug, timezone)
values ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'GymCord Demo Gym', 'demo-gym', 'America/New_York')
on conflict (organization_id, slug) do nothing;

insert into public.users (id, organization_id, primary_gym_id, email, full_name, role)
values
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'owner@gymcord.test', 'Olivia Owner', 'organization_owner'),
  ('00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'manager@gymcord.test', 'Mason Manager', 'gym_manager'),
  ('00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'trainer@gymcord.test', 'Taylor Trainer', 'trainer'),
  ('00000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'member@gymcord.test', 'Morgan Member', 'member')
on conflict (id) do update set organization_id = excluded.organization_id, primary_gym_id = excluded.primary_gym_id, role = excluded.role;

update public.organizations
set owner_user_id = '00000000-0000-0000-0000-000000000001'
where id = '10000000-0000-0000-0000-000000000001';

insert into public.trainer_profiles (organization_id, user_id, gym_id, bio, specialties, certifications)
values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 'Strength and conditioning coach.', array['strength','mobility'], array['NASM-CPT'])
on conflict (user_id) do nothing;

insert into public.member_profiles (organization_id, user_id, gym_id, trainer_user_id, goals)
values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', array['build muscle','improve consistency'])
on conflict (user_id) do nothing;

insert into public.memberships (organization_id, gym_id, member_user_id, status)
values ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'active');

insert into public.programs (id, organization_id, gym_id, trainer_user_id, member_user_id, title, description)
values ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', 'Demo Strength Foundation', 'Three-day beginner strength program.')
on conflict (id) do nothing;

insert into public.workouts (id, organization_id, program_id, gym_id, title, scheduled_for, sort_order)
values ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Full Body A', current_date, 1)
on conflict (id) do nothing;

insert into public.exercises (organization_id, workout_id, name, muscle_group, equipment, prescription, sort_order)
values
  ('10000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'Goblet Squat', 'legs', 'dumbbell', '{"sets":3,"reps":"8-10"}', 1),
  ('10000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'Push-up', 'chest', 'bodyweight', '{"sets":3,"reps":"AMRAP"}', 2);

insert into public.missions (organization_id, gym_id, title, description, xp_reward, criteria)
values ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'First Workout', 'Complete your first logged workout.', 100, '{"workout_sessions_completed":1}');

insert into public.notifications (organization_id, user_id, kind, title, body)
values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'system', 'Welcome to GymCord', 'Your demo member account is ready.');
