-- R1-E.12.4 - Server-side grants for Developer Arcade route handlers.
-- No public policies are created; browser/client access remains blocked by RLS.

begin;

-- Server-side Next.js route handlers use the Supabase service role.
grant usage on schema public to service_role;

grant select, insert, update
  on table public.arcade_sessions
  to service_role;

grant select, insert
  on table public.arcade_scores
  to service_role;

commit;
