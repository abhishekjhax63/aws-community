create extension if not exists pgcrypto;

create type public.admin_role as enum ('admin', 'editor');
create type public.event_status as enum (
  'upcoming',
  'registration_open',
  'registration_closed',
  'completed',
  'cancelled'
);
create type public.registration_status as enum ('pending', 'approved', 'rejected');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  role public.admin_role not null default 'editor',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams (id) on delete set null,
  full_name text not null,
  designation text not null,
  department text,
  course text,
  academic_year text,
  bio text,
  skills text[] not null default '{}',
  linkedin_url text,
  github_url text,
  photo_url text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text not null,
  cover_image_url text,
  short_description text not null,
  full_description text,
  agenda jsonb not null default '[]'::jsonb,
  speakers jsonb not null default '[]'::jsonb,
  starts_at timestamptz not null,
  ends_at timestamptz,
  venue text,
  meeting_details text,
  eligibility text,
  registration_deadline timestamptz,
  capacity integer check (capacity is null or capacity >= 0),
  registration_status public.event_status not null default 'upcoming',
  important_instructions text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  registration_code text not null unique default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)),
  event_id uuid not null references public.events (id) on delete restrict,
  full_name text not null,
  college_email text not null,
  contact_number text not null,
  course text not null,
  department text not null,
  academic_year text not null,
  student_id text,
  participation_note text,
  consent_given boolean not null check (consent_given),
  status public.registration_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index event_registrations_event_email_lower
  on public.event_registrations (event_id, lower(college_email));
create index event_registrations_event_id_created_at
  on public.event_registrations (event_id, created_at desc);

create table public.gallery (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events (id) on delete set null,
  media_type text not null check (media_type in ('image', 'video')),
  media_url text not null,
  thumbnail_url text,
  title text,
  caption text,
  category text not null,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  cover_image_url text,
  description text not null,
  category text not null,
  priority text not null default 'normal' check (priority in ('normal', 'important')),
  external_url text,
  published_at timestamptz,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (char_length(email) <= 254),
  message text not null check (char_length(message) between 1 and 2000),
  created_at timestamptz not null default now()
);

create table public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  is_public boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index members_published_name on public.members (lower(full_name)) where is_published;
create index events_published_date on public.events (starts_at) where is_published;
create index announcements_published_date on public.announcements (published_at desc) where is_published;
create index gallery_published_created on public.gallery (created_at desc) where is_published;
create index activity_logs_created_at on public.activity_logs (created_at desc);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'community-media',
  'community-media',
  false,
  52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role in ('admin', 'editor')
  );
$$;

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
    event_id, full_name, college_email, contact_number, course, department,
    academic_year, student_id, participation_note, consent_given
  ) values (
    target_event.id,
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

alter table public.profiles enable row level security;
alter table public.teams enable row level security;
alter table public.members enable row level security;
alter table public.events enable row level security;
alter table public.event_registrations enable row level security;
alter table public.gallery enable row level security;
alter table public.announcements enable row level security;
alter table public.contact_messages enable row level security;
alter table public.site_settings enable row level security;
alter table public.activity_logs enable row level security;

create policy "Admins can read profiles" on public.profiles
  for select to authenticated using (public.is_admin() or id = (select auth.uid()));
create policy "Admins can manage profiles" on public.profiles
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Public can read teams" on public.teams
  for select to anon, authenticated using (true);
create policy "Admins can manage teams" on public.teams
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Public can read published members" on public.members
  for select to anon, authenticated using (is_published or public.is_admin());
create policy "Admins can manage members" on public.members
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Public can read published events" on public.events
  for select to anon, authenticated using (is_published or public.is_admin());
create policy "Admins can manage events" on public.events
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Admins can read registrations" on public.event_registrations
  for select to authenticated using (public.is_admin());
create policy "Admins can update registrations" on public.event_registrations
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins can delete registrations" on public.event_registrations
  for delete to authenticated using (public.is_admin());

create policy "Public can read published gallery" on public.gallery
  for select to anon, authenticated using (is_published or public.is_admin());
create policy "Admins can manage gallery" on public.gallery
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Public can read published announcements" on public.announcements
  for select to anon, authenticated using (
    (is_published and (published_at is null or published_at <= now())) or public.is_admin()
  );
create policy "Admins can manage announcements" on public.announcements
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Public can submit contact messages" on public.contact_messages
  for insert to anon, authenticated with check (true);
create policy "Admins can read contact messages" on public.contact_messages
  for select to authenticated using (public.is_admin());
create policy "Admins can delete contact messages" on public.contact_messages
  for delete to authenticated using (public.is_admin());

create policy "Public can read public settings" on public.site_settings
  for select to anon, authenticated using (is_public or public.is_admin());
create policy "Admins can manage settings" on public.site_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Admins can read activity logs" on public.activity_logs
  for select to authenticated using (public.is_admin());
create policy "Admins can insert activity logs" on public.activity_logs
  for insert to authenticated with check (public.is_admin());

create policy "Admins can manage community media" on storage.objects
  for all to authenticated
  using (bucket_id = 'community-media' and public.is_admin())
  with check (bucket_id = 'community-media' and public.is_admin());

revoke insert on public.contact_messages from anon, authenticated;
