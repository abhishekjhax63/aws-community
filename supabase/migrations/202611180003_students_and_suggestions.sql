-- Student accounts, richer profiles, event registration ownership, and the
-- new student suggestion box. Extends the initial community schema.

-- 1. Extra profile fields for authenticated students.
alter table public.profiles
  add column if not exists full_name text,
  add column if not exists course text,
  add column if not exists department text,
  add column if not exists academic_year text,
  add column if not exists photo_url text;

-- 2. New sign-ups must default to the student role, never an admin role.
alter table public.profiles alter column role set default 'student';

-- 3. Create a student profile automatically when an account is created.
create or replace function public.handle_new_student()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, display_name, role)
  values (
    new.id,
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    'student'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_student();

-- 4. Link registrations to the account that created them (nullable for
--    registrations submitted without signing in).
alter table public.event_registrations
  add column if not exists user_id uuid references auth.users (id) on delete set null;
create index if not exists event_registrations_user_id on public.event_registrations (user_id);

-- Re-create the registration function so it records the owning account.
create or replace function public.register_for_event(registration jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_event public.events%rowtype;
  new_registration public.event_registrations%rowtype;
  normalized_email text;
  registered_count integer;
begin
  normalized_email := lower(trim(registration->>'college_email'));

  select * into target_event
  from public.events
  where id = (registration->>'event_id')::uuid and is_published
  for update;

  if not found then
    raise exception 'This event is not available for registration.' using errcode = 'P0001';
  end if;
  if target_event.registration_status <> 'registration_open' then
    raise exception 'Registration is not open for this event.' using errcode = 'P0001';
  end if;
  if target_event.registration_deadline is not null and target_event.registration_deadline <= now() then
    raise exception 'The registration deadline has passed.' using errcode = 'P0001';
  end if;

  select count(*) into registered_count
  from public.event_registrations
  where event_id = target_event.id and status <> 'rejected';
  if target_event.capacity is not null and registered_count >= target_event.capacity then
    raise exception 'This event has reached capacity.' using errcode = 'P0001';
  end if;
  if exists (
    select 1 from public.event_registrations
    where event_id = target_event.id and lower(college_email) = normalized_email
  ) then
    raise exception 'A registration already exists for this email.' using errcode = 'P0001';
  end if;

  insert into public.event_registrations (
    event_id, user_id, full_name, college_email, contact_number, course, department,
    academic_year, student_id, participation_note, consent_given
  ) values (
    target_event.id,
    nullif(trim(registration->>'user_id'), '')::uuid,
    trim(registration->>'full_name'),
    normalized_email,
    trim(registration->>'contact_number'),
    trim(registration->>'course'),
    trim(registration->>'department'),
    trim(registration->>'academic_year'),
    nullif(trim(registration->>'student_id'), ''),
    nullif(trim(registration->>'participation_note'), ''),
    (registration->>'consent_given')::boolean
  ) returning * into new_registration;

  return jsonb_build_object(
    'registration_id', new_registration.registration_code,
    'event_id', new_registration.event_id,
    'created_at', new_registration.created_at
  );
end;
$$;

revoke all on function public.register_for_event(jsonb) from public, anon, authenticated;
grant execute on function public.register_for_event(jsonb) to service_role;

-- 5. Student suggestion box. Suggestions stay private to administrators.
create table if not exists public.suggestions (
  id uuid primary key default gen_random_uuid(),
  reference_code text not null unique
    default 'IDEA-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  user_id uuid references public.profiles (id) on delete set null,
  name text,
  email text,
  category text not null,
  title text not null check (char_length(title) between 3 and 160),
  details text not null check (char_length(details) between 10 and 4000),
  is_anonymous boolean not null default false,
  status text not null default 'new' check (status in ('new', 'under_review', 'accepted', 'rejected')),
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists suggestions_status_created on public.suggestions (status, created_at desc);
create index if not exists suggestions_category on public.suggestions (category);

alter table public.suggestions enable row level security;

-- No public read policy: only authenticated administrators can see suggestions.
create policy "Admins can read suggestions" on public.suggestions
  for select to authenticated using (public.is_admin());
create policy "Admins can manage suggestions" on public.suggestions
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- 6. Students can update only their own profile row, and may not change roles.
create policy "Students can update own profile" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()) and role = 'student');

-- 7. Students can read their own event registrations.
create policy "Students can read own registrations" on public.event_registrations
  for select to authenticated using (user_id = (select auth.uid()));
