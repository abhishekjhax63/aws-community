-- Community content update: preserve unconfirmed event years as unpublished
-- drafts, publish the AWS Builder Center resource, and seed verified socials.

alter table public.events
  alter column starts_at drop not null,
  add column if not exists event_format text,
  add column if not exists attendance_note text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'events_published_require_start_date'
      and conrelid = 'public.events'::regclass
  ) then
    alter table public.events
      add constraint events_published_require_start_date
      check (not is_published or starts_at is not null);
  end if;
end;
$$;

-- The years are not present in approved project records. These remain private
-- until an administrator confirms each year and approves event photographs.
insert into public.events (
  title, slug, category, event_format, attendance_note, short_description,
  full_description, starts_at, registration_status, is_published
)
select
  draft.title,
  draft.slug,
  draft.category,
  draft.event_format,
  draft.attendance_note,
  draft.short_description,
  draft.full_description,
  null,
  'completed',
  false
from (values
  (
    'Cloud Genesis 1.0 — Guest Lecture Workshop',
    'cloud-genesis-1-0-guest-lecture-workshop',
    'Guest Lecture Workshop',
    'Online event in class',
    'Approximately 90+ attendees',
    'Online event in class. Attendance was approximately 90+.',
    'A past guest lecture workshop held online in class. The event year and approved event photographs still need confirmation.'
  ),
  (
    'Prompt2 Pixel — 3 Round Cloud Based Hackathon',
    'prompt2-pixel-3-round-cloud-based-hackathon',
    'Cloud-based Hackathon',
    'Cloud-based hackathon',
    'Approximately 100+ attendees',
    'Cloud-based hackathon. Attendance was approximately 100+.',
    'A past three-round cloud-based hackathon. The event year and approved event photographs still need confirmation.'
  )
) as draft(title, slug, category, event_format, attendance_note, short_description, full_description)
where not exists (
  select 1
  from public.events existing
  where existing.slug = draft.slug
     or lower(existing.title) = lower(draft.title)
)
on conflict (slug) do nothing;

-- Idempotent by both title and slug. The database default sets created_at;
-- published_at uses the same transaction timestamp as the actual insertion.
insert into public.announcements (
  title, slug, cover_image_url, description, category, external_url,
  published_at, is_published
)
select
  'Explore AWS Builder Center',
  'explore-aws-builder-center',
  '/assets/aws-builder-center-community.svg',
  'AWS Builder Center is a space for builders to connect with other developers, share solutions, influence AWS product development and discover resources that support their growth.' || E'\n\n' ||
  'Explore the platform, create your account and discover opportunities to learn and build with AWS.',
  'AWS Resources / Community Announcement',
  'https://builder.aws.com/',
  now(),
  true
where not exists (
  select 1
  from public.announcements existing
  where existing.slug = 'explore-aws-builder-center'
     or lower(existing.title) = lower('Explore AWS Builder Center')
)
on conflict (slug) do nothing;

-- These are the existing community destinations already present in the project,
-- with tracking/referral query parameters removed. LinkedIn points to a
-- community post (not a claimed profile handle), so it is labelled as a post.
insert into public.site_settings (key, value, is_public)
values (
  'social_links',
  '[
    {"id":"instagram","platform":"Instagram","handle":"@sbg.community","url":"https://www.instagram.com/sbg.community/","order":1,"enabled":true},
    {"id":"meetup","platform":"Meetup","handle":"AWS SBG at Amity University Patna Campus","url":"https://www.meetup.com/aws-sbg-at-amity-university-patna-campus/","order":2,"enabled":true},
    {"id":"youtube","platform":"YouTube","handle":"@awssbg_26","url":"https://www.youtube.com/@awssbg_26","order":3,"enabled":true},
    {"id":"linkedin-post","platform":"LinkedIn","handle":"Community post","url":"https://www.linkedin.com/posts/aws-student-builder-group-at-amity-university_promptpixel-thrillanza-amityuniversitypatna-activity-7510907739657711616-L5HQ","order":4,"enabled":true,"kind":"post"}
  ]'::jsonb,
  true
)
on conflict (key) do nothing;

-- Block any new registration if the event is complete or already started,
-- including requests made directly against the existing registration RPC.
create or replace function public.guard_event_registration_date()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_event public.events%rowtype;
begin
  select * into target_event
  from public.events
  where id = new.event_id
  for share;

  if not found
     or target_event.registration_status <> 'registration_open'
     or target_event.starts_at is null
     or target_event.starts_at <= now() then
    raise exception 'Registration is not available for this event.' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists event_registration_date_guard on public.event_registrations;
create trigger event_registration_date_guard
  before insert on public.event_registrations
  for each row execute function public.guard_event_registration_date();
