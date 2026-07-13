begin;

create table if not exists public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  content jsonb not null,
  publication_status text not null default 'draft',
  sort_order integer not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by text,
  constraint portfolio_projects_slug_format
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint portfolio_projects_content_object
    check (jsonb_typeof(content) = 'object'),
  constraint portfolio_projects_publication_status
    check (publication_status in ('draft', 'published', 'archived')),
  constraint portfolio_projects_publish_date
    check (
      (publication_status = 'published' and published_at is not null)
      or publication_status <> 'published'
    )
);

create index if not exists portfolio_projects_publication_order_idx
  on public.portfolio_projects (publication_status, sort_order, updated_at desc);

create table if not exists public.portfolio_project_revisions (
  id bigint generated always as identity primary key,
  project_id uuid not null,
  slug text not null,
  content jsonb not null,
  publication_status text not null,
  sort_order integer not null,
  action text not null,
  changed_at timestamptz not null default now(),
  changed_by text,
  constraint portfolio_project_revisions_action
    check (action in ('update', 'delete')),
  constraint portfolio_project_revisions_content_object
    check (jsonb_typeof(content) = 'object')
);

create index if not exists portfolio_project_revisions_project_idx
  on public.portfolio_project_revisions (project_id, changed_at desc);

create or replace function public.capture_portfolio_project_revision()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  insert into public.portfolio_project_revisions (
    project_id,
    slug,
    content,
    publication_status,
    sort_order,
    action,
    changed_by
  )
  values (
    old.id,
    old.slug,
    old.content,
    old.publication_status,
    old.sort_order,
    lower(tg_op),
    coalesce(new.updated_by, old.updated_by)
  );

  if tg_op = 'UPDATE' then
    new.updated_at = now();
    return new;
  end if;

  return old;
end;
$$;

drop trigger if exists portfolio_projects_revision_trigger on public.portfolio_projects;
create trigger portfolio_projects_revision_trigger
before update or delete on public.portfolio_projects
for each row execute function public.capture_portfolio_project_revision();

alter table public.portfolio_projects enable row level security;
alter table public.portfolio_project_revisions enable row level security;

revoke all on table public.portfolio_projects from anon, authenticated;
revoke all on table public.portfolio_project_revisions from anon, authenticated;
revoke all on sequence public.portfolio_project_revisions_id_seq from anon, authenticated;

revoke all on table public.portfolio_projects from public;
revoke all on table public.portfolio_project_revisions from public;
revoke all on sequence public.portfolio_project_revisions_id_seq from public;

revoke all on function public.capture_portfolio_project_revision() from public, anon, authenticated;

grant select, insert, update, delete on table public.portfolio_projects to service_role;
grant select, insert, update, delete on table public.portfolio_project_revisions to service_role;
grant usage, select on sequence public.portfolio_project_revisions_id_seq to service_role;
grant execute on function public.capture_portfolio_project_revision() to service_role;

commit;
