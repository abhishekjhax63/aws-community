-- Adds the student role to the community role enum.
-- Kept in its own migration because PostgreSQL requires a new enum value to be
-- committed before it can be referenced (the default value) in a later statement.
alter type public.admin_role add value if not exists 'student';
