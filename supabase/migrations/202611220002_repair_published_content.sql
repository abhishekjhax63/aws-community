-- Repair the Builder Center announcement fields and associate the existing
-- Prompt2 Pixel photographs with its event record without inventing dates.

with target_announcement as (
  select id
  from public.announcements
  where slug = 'explore-aws-builder-center'
     or lower(title) = lower('Explore AWS Builder Center')
  order by (slug = 'explore-aws-builder-center') desc, created_at
  limit 1
)
update public.announcements as announcement
set
  title = 'Explore AWS Builder Center',
  slug = 'explore-aws-builder-center',
  cover_image_url = '/assets/aws-builder-center-community.svg',
  description = 'Discover AWS Builder Center, a space for builders to connect, share solutions, explore learning resources and contribute feedback to AWS product development.',
  category = 'AWS Resources',
  external_url = 'https://builder.aws.com/',
  published_at = now(),
  is_published = true,
  updated_at = now()
from target_announcement
where announcement.id = target_announcement.id;

insert into public.announcements (
  title, slug, cover_image_url, description, category, external_url,
  published_at, is_published
)
select
  'Explore AWS Builder Center',
  'explore-aws-builder-center',
  '/assets/aws-builder-center-community.svg',
  'Discover AWS Builder Center, a space for builders to connect, share solutions, explore learning resources and contribute feedback to AWS product development.',
  'AWS Resources',
  'https://builder.aws.com/',
  now(),
  true
where not exists (
  select 1
  from public.announcements
  where slug = 'explore-aws-builder-center'
     or lower(title) = lower('Explore AWS Builder Center')
)
on conflict (slug) do update
set
  title = excluded.title,
  cover_image_url = excluded.cover_image_url,
  description = excluded.description,
  category = excluded.category,
  external_url = excluded.external_url,
  published_at = excluded.published_at,
  is_published = true,
  updated_at = now();

update public.events
set
  category = 'Guest Lecture Workshop',
  event_format = 'Online event in class',
  attendance_note = 'Approximately 90+ attendees',
  registration_status = 'completed',
  updated_at = now()
where slug = 'cloud-genesis-1-0-guest-lecture-workshop'
   or lower(title) = lower('Cloud Genesis 1.0 — Guest Lecture Workshop');

update public.events
set
  category = 'Cloud-based Hackathon',
  event_format = 'Cloud-based hackathon',
  attendance_note = 'Approximately 100+ attendees',
  cover_image_url = coalesce(
    nullif(cover_image_url, ''),
    '/assets/gallery/prompt-to-pixel-01-session.jpeg'
  ),
  registration_status = 'completed',
  updated_at = now()
where slug = 'prompt2-pixel-3-round-cloud-based-hackathon'
   or lower(title) = lower('Prompt2 Pixel — 3 Round Cloud Based Hackathon');

update public.gallery as gallery
set
  event_id = event.id,
  updated_at = now()
from public.events as event
where event.slug = 'prompt2-pixel-3-round-cloud-based-hackathon'
  and gallery.event_id is null
  and gallery.media_type = 'image'
  and lower(gallery.category) = lower('Prompt to Pixel');
