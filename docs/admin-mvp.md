# Admin Auth

The Admin area uses a private MongoDB-backed owner account and a server-side session cookie.

## Routes

```txt
/admin/login
/admin
/api/admin/login
/api/admin/logout
/api/admin/projects
/api/admin/projects/import
/api/admin/projects/import/template
/api/admin/media/signature
/api/admin/media/register
/api/admin/media/rollback
/api/admin/media/[id]
```

All `/admin` pages are excluded from public navigation and configured with `noindex` metadata.

## Authentication Design

- Admin users live in `admin_users`.
- Passwords use `scrypt-v1` with a random salt per user.
- The bootstrap script creates or rotates the owner account; there is no public sign-up or password reset endpoint.
- Login creates one opaque session token and sends it only in `alvaro_admin_session`.
- Only the SHA-256 hash of the session token is stored in `admin_sessions`.
- The cookie is `HttpOnly`, `SameSite=Lax`, `Secure` in production and expires after about 8 hours.
- `src/proxy.ts` only checks for cookie presence as an initial barrier.
- Protected pages and Admin APIs validate the session against MongoDB before returning private data.
- Login and logout mutations validate same-origin requests.
- Login attempts are stored in `admin_login_attempts` with hashed IP/e-mail buckets and TTL cleanup.

## Bootstrap

Create the local owner manually:

```powershell
npm run admin:bootstrap -- --email "email@dominio.com"
```

Rotate the password and revoke active Admin sessions:

```powershell
npm run admin:bootstrap -- --email "email@dominio.com" --rotate-password
```

Do not commit passwords, session tokens, hashes, salts or real MongoDB credentials.

## MongoDB Collections

- `admin_users`
- `admin_sessions`
- `admin_login_attempts`
- `arcade_sessions`
- `arcade_scores`
- `portfolio_projects`
- `portfolio_project_revisions`
- `project_media_assets`

Run `npm run mongodb:setup` after configuring `.env.local` to create indexes and TTL rules.

## Project Media

Project media operations are protected by the same MongoDB Admin session used by the rest of the Admin panel.

- Cloudinary stores project image binaries.
- MongoDB stores metadata, project binding, role, order and deletion state.
- Uploads are direct and signed; large files do not pass through the Vercel function.
- The Cloudinary API secret stays server-side and is never exposed with `NEXT_PUBLIC_`.
- Supported uploads are JPEG, PNG, WebP and AVIF within the documented limits.
- Delete operations use the persisted Cloudinary `publicId`, remove project references and keep local state unchanged if Cloudinary deletion fails.

## Project JSON Import

The Admin project list uses `Importar via JSON` for creating new draft projects from a strict `schemaVersion: "1.0"` payload.

- The template download is protected and returns `portfolio-project-import.template.json`.
- Validation mode does not write to MongoDB.
- Import mode repeats validation, creates only new draft projects and records a `create` revision.
- Existing slugs are blocked; updates by JSON are intentionally unsupported.
- Media fields are not accepted. Logos, thumbnails, hero images and galleries are added later through the media manager.
