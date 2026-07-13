# Admin MVP

The first Admin MVP provides a protected, read-only dashboard. It does not yet move public portfolio content into the database.

## Routes

```txt
/admin/login
/admin
/api/admin/login
/api/admin/logout
```

All `/admin` pages are excluded from public navigation and configured with `noindex` metadata.

## Authentication design

- Supabase Auth email/password login is executed only by the server Route Handler.
- The browser never receives the Supabase anonymous key.
- Access and refresh tokens are stored in `HttpOnly`, `SameSite=Lax` cookies.
- `src/proxy.ts` validates the access token before private routes render.
- Expired access tokens are refreshed server-side when a valid refresh token exists.
- Authorization requires an exact match with `ADMIN_EMAIL` after normalization.
- Protected pages validate the user again before returning dashboard content.
- Login and logout mutations reject foreign origins.
- Login attempts are limited per hashed IP and e-mail bucket.

The current limiter is process-local. It is suitable as an initial control, but a distributed store is required for strict global enforcement across multiple serverless instances.

## Required environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_EMAIL=
```

`SUPABASE_ANON_KEY` is deliberately server-only and must not use a `NEXT_PUBLIC_` prefix.

## Manual Supabase setup

1. Open the current `curriculo` project in Supabase.
2. Open Authentication and create one email/password user for the administrator.
3. Use the same normalized e-mail in `ADMIN_EMAIL`.
4. Keep public sign-up disabled unless another product feature explicitly needs it.
5. Configure the four variables above in `.env.local` for local development.
6. Configure the same values in Vercel for Preview and Production as appropriate.
7. Redeploy after changing environment variables.

Do not commit passwords, access tokens, refresh tokens or real service-role values.

## Current dashboard

The dashboard is read-only and shows:

- number of versioned projects;
- number of Arcade games;
- persisted session count;
- persisted score count;
- Supabase availability;
- current authenticated administrator;
- project catalog preview;
- links to public Projects and Lab pages.

If the database is temporarily unavailable, the dashboard remains accessible and reports unavailable metrics instead of failing the whole page.

## Next Admin phase

The next phase should add project editing without silently replacing the current source of truth.

Recommended sequence:

1. create a versioned migration for draft/project override tables;
2. add RLS and service-role-only write access;
3. import current static project data with a reversible script;
4. create draft and published states;
5. add Admin CRUD and bilingual preview;
6. make public routes consume published database content with a static fallback;
7. add audit logs and rollback.

Uploads and Supabase Storage should be introduced only after project CRUD and authorization are stable.
