# Admin Project CRUD

This phase adds a database-backed editorial layer for project case studies while preserving the versioned static catalog as a safe fallback.

## Safety model

The public portfolio does not depend exclusively on the database:

- if the project tables do not exist, public routes use `src/content/projects.ts`;
- if Supabase is unavailable, public routes use the static catalog;
- invalid published JSON does not replace a valid static project;
- a published database record overrides the static project with the same slug;
- a draft or archived record hides the static project with the same slug;
- new published database projects are added to the public catalog;
- the Home showcase remains static in this phase.

All project-table access is server-side through the service role. The browser does not receive database credentials or direct table access.

## Migration

Apply this migration to the current `curriculo` Supabase project:

```txt
supabase/migrations/20260713160000_portfolio_projects_admin.sql
```

It creates:

- `portfolio_projects`;
- `portfolio_project_revisions`;
- a revision trigger that captures the previous version before updates or deletes;
- indexes for publication and revision queries;
- RLS with direct `anon` and `authenticated` access revoked;
- service-role-only table and function grants.

The migration is versioned in Git, but it is not applied automatically by merging the pull request.

## Activation order

1. Confirm the Admin MVP environment variables are configured.
2. Apply the migration to Supabase.
3. Deploy the application code.
4. Sign in at `/admin/login`.
5. Open `/admin/projects`.
6. Choose **Importar catálogo atual** once.
7. Review each imported project before making editorial changes.

The import is additive: it inserts only missing static slugs and never overwrites existing Admin edits.

## Editorial states

### Draft

- available in Admin;
- hidden from public project routes;
- useful for preparing new projects before publication.

### Published

- overrides the static project with the same slug;
- adds a new slug to the public catalog;
- appears according to `sort_order`.

### Archived

- remains available for Admin history;
- hidden from public routes;
- preferred over hard deletion.

## Admin routes

```txt
/admin/projects
/admin/projects/new
/admin/projects/[slug]
```

## Protected APIs

```txt
GET  /api/admin/projects
POST /api/admin/projects
GET  /api/admin/projects/[slug]
PUT  /api/admin/projects/[slug]
DELETE /api/admin/projects/[slug]
POST /api/admin/projects/import
```

All APIs:

- require the authenticated allowlisted Admin user;
- use same-origin validation for mutations;
- validate structured project content with Zod;
- limit JSON project payloads to 64 KiB;
- access Supabase only on the server.

`DELETE` archives the project instead of deleting the row.

## Revisions and rollback

Before an update or delete, the database trigger copies the previous project state to `portfolio_project_revisions`.

The first UI displays recent revision metadata. An automated restore action is intentionally deferred until its authorization and conflict behavior are explicitly implemented.

Manual rollback procedure:

1. inspect the desired revision in Supabase or the Admin history data;
2. restore its JSON content into the current project row;
3. set the desired publication state;
4. validate the public case page.

A future phase can expose a protected one-click restore operation.

## Public caching

The public project index and project case routes are dynamic in this initial release so editorial changes are visible without a separate rebuild. If traffic grows, introduce tagged server caching and explicit revalidation after Admin mutations.

## Known limits

- project visuals are preserved during edits but are not yet editable in the form;
- the Home project showcase remains versioned/static;
- no image upload or Supabase Storage integration exists;
- no collaborative editing or optimistic-lock version field exists;
- import does not update existing records by design;
- migrations and environment configuration remain manual operational steps.
