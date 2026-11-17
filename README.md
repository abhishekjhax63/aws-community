# AWS Builder Community

A responsive student-community website for Amity University Patna. It includes the supplied community video, banner and SBG mark, Ayush Kumar's public leader profile, AWS learning links, empty states for unpublished community data, and an Express/Supabase API foundation.

The site identifies itself as an independent student community and does not claim AWS sponsorship, endorsement, or official affiliation. No member, event, registration, achievement, or testimonial data is invented.

## Run locally

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and add the Supabase project URL and **server-only** service-role key.
3. Apply `supabase/migrations/202611180001_initial_schema.sql` in the Supabase SQL editor or with the Supabase CLI.
4. Run `npm run dev:full` to start Vite and the API together.
5. Open the local URL printed by Vite. The API health endpoint is `/api/health`.

The frontend can be previewed without Supabase. The API returns a setup response for database-dependent features, the event and updates sections remain empty until published records exist, and project statistics remain unset until the `project_count` public site setting is configured.

## Supabase and access control

- Keep `SUPABASE_SERVICE_ROLE_KEY` on the server only. Never add it to a `VITE_*` variable or browser code.
- Create administrator users in Supabase Authentication, then provision their `public.profiles` row with role `admin` (or `editor`). Do not expose profile-management privileges through public signup.
- Public API reads only return published profiles, events, gallery items, announcements, and public settings.
- Private media is uploaded to the `community-media` Supabase Storage bucket by authorized admins. Public API responses issue short-lived signed URLs only for published media.
- Registration writes go through a database function that validates event visibility/status/deadline, serializes capacity checks, and prevents duplicate event/email registrations. Participant rows are not publicly readable.
- The `/admin` workspace signs in through Supabase Auth and is backed by server-side role checks. It includes content management, private participant review/status changes, CSV export, media upload, public settings, and activity logging.
- Contact and registration submissions are rate-limited. Contact messages and participant details are visible only to authorized administrators.
- Configure Supabase Storage and email delivery separately before enabling uploads or confirmation emails. These integrations are not claimed as active.

## Production

Run `npm run build`, then set the server environment variables and start with `npm start`. The Express server serves the built `dist` directory when present. Terminate TLS at the hosting platform, configure backups and monitoring for Supabase, and provision at least one authorized administrator before launch.
