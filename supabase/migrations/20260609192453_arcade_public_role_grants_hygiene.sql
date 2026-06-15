-- R1-E.12.7A - Defensive grant hygiene for Developer Arcade tables.
-- Browser-facing roles must not have direct table privileges.
-- RLS remains enabled and no public policies are created here.

begin;

-- Remove direct table access from public/browser-facing roles.
-- Route handlers continue to access the tables only through service_role.
revoke select, insert, update, delete, truncate, references, trigger
  on table public.arcade_sessions
  from anon, authenticated;

revoke select, insert, update, delete, truncate, references, trigger
  on table public.arcade_scores
  from anon, authenticated;

-- Keep the server-side Next.js route handlers working through service_role.
grant usage on schema public to service_role;

grant select, insert, update
  on table public.arcade_sessions
  to service_role;

grant select, insert
  on table public.arcade_scores
  to service_role;

commit;
