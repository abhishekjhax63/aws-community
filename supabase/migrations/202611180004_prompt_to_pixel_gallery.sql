-- Prompt to Pixel — AI image generation competition & workshop gallery
-- Event held at Amity University Patna, organized by AWS Builder Community

insert into public.gallery (media_type, media_url, thumbnail_url, title, caption, category, is_published, created_at)
values
  ('image', '/assets/gallery/prompt-to-pixel-01-session.jpeg', null,
   'Prompt to Pixel — Session in progress',
   'Students gathered for the Prompt to Pixel AI image generation workshop.',
   'Prompt to Pixel', true, now()),
  ('image', '/assets/gallery/prompt-to-pixel-02-workshop.jpeg', null,
   'Hands-on AI prompting',
   'Participants experimenting with AI image generation during the workshop.',
   'Prompt to Pixel', true, now()),
  ('image', '/assets/gallery/prompt-to-pixel-03-students.jpeg', null,
   'Builders at work',
   'AWS Student Builder Group members working on creative prompts.',
   'Prompt to Pixel', true, now()),
  ('image', '/assets/gallery/prompt-to-pixel-04-audience.jpeg', null,
   'Engaged audience',
   'Students following along during the Prompt to Pixel session.',
   'Prompt to Pixel', true, now()),
  ('image', '/assets/gallery/prompt-to-pixel-05-keynote.jpeg', null,
   'Keynote address',
   'Faculty member addressing participants at the Prompt to Pixel event.',
   'Prompt to Pixel', true, now()),
  ('image', '/assets/gallery/prompt-to-pixel-06-awards.jpeg', null,
   'Award ceremony',
   'Felicitation of winners at the Prompt to Pixel competition.',
   'Prompt to Pixel', true, now()),
  ('image', '/assets/gallery/prompt-to-pixel-07-group.jpeg', null,
   'Winners group photo',
   'All winners and participants at the Prompt to Pixel event.',
   'Prompt to Pixel', true, now()),
  ('image', '/assets/gallery/prompt-to-pixel-08-ceremony.jpeg', null,
   'Trophy presentation',
   'Trophy being presented to the Prompt to Pixel competition winner.',
   'Prompt to Pixel', true, now())
on conflict do nothing;
