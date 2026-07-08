-- GymCord row level security policies. Run after schema.sql.

create or replace function public.current_user_role()
returns public.user_role language sql stable security definer set search_path = public as $$
  select role from public.users where id = auth.uid() and is_active = true
$$;

create or replace function public.current_organization_id()
returns uuid language sql stable security definer set search_path = public as $$
  select organization_id from public.users where id = auth.uid() and is_active = true
$$;

create or replace function public.is_super_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_user_role() = 'super_admin', false)
$$;

create or replace function public.is_org_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_user_role() in ('organization_owner', 'gym_manager'), false)
$$;

create or replace function public.same_org(target_organization_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_super_admin() or target_organization_id = public.current_organization_id()
$$;

create or replace function public.is_trainer_for(member_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.member_profiles mp
    where mp.user_id = member_id
      and mp.trainer_user_id = auth.uid()
      and mp.organization_id = public.current_organization_id()
  )
$$;

alter table public.organizations enable row level security;
alter table public.gyms enable row level security;
alter table public.users enable row level security;
alter table public.trainer_profiles enable row level security;
alter table public.member_profiles enable row level security;
alter table public.memberships enable row level security;
alter table public.programs enable row level security;
alter table public.workouts enable row level security;
alter table public.exercises enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.exercise_logs enable row level security;
alter table public.missions enable row level security;
alter table public.achievements enable row level security;
alter table public.xp_events enable row level security;
alter table public.streaks enable row level security;
alter table public.nutrition_logs enable row level security;
alter table public.progress_photos enable row level security;
alter table public.measurements enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.atlas_memory enable row level security;
alter table public.atlas_conversations enable row level security;
alter table public.analytics_events enable row level security;
alter table public.billing_customers enable row level security;
alter table public.subscriptions enable row level security;

create policy organizations_select on public.organizations for select using (public.is_super_admin() or id = public.current_organization_id());
create policy organizations_insert on public.organizations for insert with check (public.is_super_admin() or owner_user_id = auth.uid());
create policy organizations_update on public.organizations for update using (public.is_super_admin() or (id = public.current_organization_id() and public.current_user_role() = 'organization_owner')) with check (public.is_super_admin() or id = public.current_organization_id());
create policy organizations_delete on public.organizations for delete using (public.is_super_admin());

create policy users_select on public.users for select using (public.same_org(organization_id) or id = auth.uid());
create policy users_insert on public.users for insert with check (public.is_super_admin() or organization_id = public.current_organization_id() or id = auth.uid());
create policy users_update on public.users for update using (public.is_super_admin() or id = auth.uid() or (organization_id = public.current_organization_id() and public.is_org_admin())) with check (public.is_super_admin() or organization_id = public.current_organization_id() or id = auth.uid());
create policy users_delete on public.users for delete using (public.is_super_admin() or (organization_id = public.current_organization_id() and public.current_user_role() = 'organization_owner'));

-- Tenant-wide admin policy generator for tables with organization_id.
do $$
declare t text;
begin
  foreach t in array array['gyms','trainer_profiles','member_profiles','memberships','missions','analytics_events','billing_customers','subscriptions'] loop
    execute format('create policy %I on public.%I for all using (public.same_org(organization_id)) with check (public.same_org(organization_id))', t || '_tenant_all', t);
  end loop;
end $$;

create policy programs_select on public.programs for select using (public.same_org(organization_id) and (public.is_org_admin() or trainer_user_id = auth.uid() or member_user_id = auth.uid() or public.current_user_role() = 'trainer'));
create policy programs_write on public.programs for all using (public.same_org(organization_id) and (public.is_org_admin() or trainer_user_id = auth.uid())) with check (public.same_org(organization_id) and (public.is_org_admin() or trainer_user_id = auth.uid()));

create policy workouts_select on public.workouts for select using (public.same_org(organization_id));
create policy workouts_write on public.workouts for all using (public.same_org(organization_id) and public.current_user_role() in ('super_admin','organization_owner','gym_manager','trainer')) with check (public.same_org(organization_id));

create policy exercises_select on public.exercises for select using (public.same_org(organization_id));
create policy exercises_write on public.exercises for all using (public.same_org(organization_id) and public.current_user_role() in ('super_admin','organization_owner','gym_manager','trainer')) with check (public.same_org(organization_id));

create policy workout_sessions_select on public.workout_sessions for select using (public.same_org(organization_id) and (public.is_org_admin() or member_user_id = auth.uid() or public.is_trainer_for(member_user_id)));
create policy workout_sessions_write on public.workout_sessions for all using (public.same_org(organization_id) and (member_user_id = auth.uid() or public.is_trainer_for(member_user_id) or public.is_org_admin())) with check (public.same_org(organization_id));

create policy exercise_logs_select on public.exercise_logs for select using (public.same_org(organization_id) and (public.is_org_admin() or member_user_id = auth.uid() or public.is_trainer_for(member_user_id)));
create policy exercise_logs_write on public.exercise_logs for all using (public.same_org(organization_id) and (member_user_id = auth.uid() or public.is_trainer_for(member_user_id) or public.is_org_admin())) with check (public.same_org(organization_id));

create policy achievements_select on public.achievements for select using (public.same_org(organization_id) and (public.is_org_admin() or user_id = auth.uid() or public.is_trainer_for(user_id)));
create policy achievements_write on public.achievements for all using (public.same_org(organization_id) and public.current_user_role() in ('super_admin','organization_owner','gym_manager','trainer')) with check (public.same_org(organization_id));

create policy xp_events_select on public.xp_events for select using (public.same_org(organization_id) and (public.is_org_admin() or user_id = auth.uid() or public.is_trainer_for(user_id)));
create policy xp_events_write on public.xp_events for all using (public.same_org(organization_id) and public.current_user_role() in ('super_admin','organization_owner','gym_manager','trainer')) with check (public.same_org(organization_id));

create policy streaks_select on public.streaks for select using (public.same_org(organization_id) and (public.is_org_admin() or user_id = auth.uid() or public.is_trainer_for(user_id)));
create policy streaks_write on public.streaks for all using (public.same_org(organization_id) and (user_id = auth.uid() or public.is_org_admin() or public.is_trainer_for(user_id))) with check (public.same_org(organization_id));

create policy nutrition_logs_member_trainer on public.nutrition_logs for all using (public.same_org(organization_id) and (user_id = auth.uid() or public.is_trainer_for(user_id) or public.is_org_admin())) with check (public.same_org(organization_id) and (user_id = auth.uid() or public.is_org_admin() or public.is_trainer_for(user_id)));
create policy progress_photos_member_trainer on public.progress_photos for all using (public.same_org(organization_id) and (user_id = auth.uid() or public.is_trainer_for(user_id) or public.is_org_admin())) with check (public.same_org(organization_id) and (user_id = auth.uid() or public.is_org_admin() or public.is_trainer_for(user_id)));
create policy measurements_member_trainer on public.measurements for all using (public.same_org(organization_id) and (user_id = auth.uid() or public.is_trainer_for(user_id) or public.is_org_admin())) with check (public.same_org(organization_id) and (user_id = auth.uid() or public.is_org_admin() or public.is_trainer_for(user_id)));

create policy messages_select on public.messages for select using (public.same_org(organization_id) and (public.is_org_admin() or sender_user_id = auth.uid() or recipient_user_id = auth.uid() or kind in ('gym','organization')));
create policy messages_insert on public.messages for insert with check (public.same_org(organization_id) and sender_user_id = auth.uid());
create policy messages_update on public.messages for update using (public.same_org(organization_id) and (recipient_user_id = auth.uid() or public.is_org_admin())) with check (public.same_org(organization_id));
create policy messages_delete on public.messages for delete using (public.same_org(organization_id) and (sender_user_id = auth.uid() or public.is_org_admin()));

create policy notifications_user on public.notifications for all using (public.same_org(organization_id) and (user_id = auth.uid() or public.is_org_admin())) with check (public.same_org(organization_id));
create policy atlas_memory_user on public.atlas_memory for all using (public.same_org(organization_id) and (user_id = auth.uid() or public.is_org_admin())) with check (public.same_org(organization_id));
create policy atlas_conversations_user on public.atlas_conversations for all using (public.same_org(organization_id) and (user_id = auth.uid() or public.is_org_admin())) with check (public.same_org(organization_id));

-- Storage bucket plan. Supabase storage.objects RLS can enforce folder convention: <organization_id>/<user_id-or-asset>/<file>.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('profile-photos', 'profile-photos', true, 5242880, array['image/jpeg','image/png','image/webp']),
  ('progress-photos', 'progress-photos', false, 10485760, array['image/jpeg','image/png','image/webp']),
  ('meal-photos', 'meal-photos', false, 10485760, array['image/jpeg','image/png','image/webp']),
  ('gym-logos', 'gym-logos', true, 5242880, array['image/jpeg','image/png','image/webp','image/svg+xml']),
  ('exercise-media', 'exercise-media', false, 52428800, array['image/jpeg','image/png','image/webp','video/mp4','video/webm'])
on conflict (id) do nothing;

create policy storage_tenant_select on storage.objects for select using (bucket_id in ('profile-photos','progress-photos','meal-photos','gym-logos','exercise-media') and (public.is_super_admin() or (storage.foldername(name))[1]::uuid = public.current_organization_id()));
create policy storage_tenant_insert on storage.objects for insert with check (bucket_id in ('profile-photos','progress-photos','meal-photos','gym-logos','exercise-media') and (public.is_super_admin() or (storage.foldername(name))[1]::uuid = public.current_organization_id()));
create policy storage_tenant_update on storage.objects for update using (bucket_id in ('profile-photos','progress-photos','meal-photos','gym-logos','exercise-media') and (public.is_super_admin() or (storage.foldername(name))[1]::uuid = public.current_organization_id())) with check (public.is_super_admin() or (storage.foldername(name))[1]::uuid = public.current_organization_id());
create policy storage_tenant_delete on storage.objects for delete using (bucket_id in ('profile-photos','progress-photos','meal-photos','gym-logos','exercise-media') and (public.is_super_admin() or public.is_org_admin() or owner = auth.uid()::text));
