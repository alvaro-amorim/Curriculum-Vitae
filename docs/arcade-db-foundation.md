# Arcade DB Foundation

R1-E.12.2 prepared the database foundation draft for the Developer Arcade.
R1-E.12.3 applied that migration to the Supabase remote project.
R1-E.12.4 adds the server-side anonymous player session that writes only to
`arcade_sessions`.

## Scope

- Project ref expected: `fkiuecyohcyjwygedncx`.
- Applied migration: `supabase/migrations/20260608154425_arcade_scores_foundation.sql`.
- Runtime status: `/api/score` remains local/mock.
- Server-side Supabase client: `src/lib/supabase/server.ts`.
- Anonymous session API: `/api/player-session`.
- Remote tables created: `arcade_sessions` and `arcade_scores`.
- No public policy, bucket, Auth, Leaderboard or Admin feature is created in this phase.

## Planned Tables

### `arcade_sessions`

Stores anonymous player session records.

- `id`
- `session_hash`
- `alias`
- `created_at`
- `last_seen_at`

`session_hash` is constrained as lowercase sha256 hex with 64 characters. It
must be generated server-side from a non-PII browser/session identifier in a
future phase.

### `arcade_scores`

Stores validated score contract v2 submissions for the four final games.

- `runtime`
- `bug-maze`
- `code-snake`
- `stack-tetris`

The table stores `score`, `duration_ms`, `game_version`, `contract_version`,
`device_type`, `metadata_json`, `player_alias`, `session_hash` and `created_at`.

## Security Model

- RLS is enabled on both tables.
- No public policy was created.
- Public inserts are intentionally not allowed.
- Future reads and writes should go through Next.js Route Handlers.
- `SUPABASE_SERVICE_ROLE_KEY` must stay server-only.
- `ARCADE_SESSION_SECRET` must stay server-only and is used for HMAC-SHA256
  session hashing.
- Public leaderboard responses must not expose `session_hash`.
- Aliases are display-only and should reject emails, phone numbers or other PII
  in the API layer before insert.

## Anonymous Session API

`GET /api/player-session` ensures a `httpOnly` cookie named
`alvaro_arcade_session`, hashes it server-side, upserts `arcade_sessions` and
returns only:

```json
{
  "ready": true,
  "alias": null,
  "maxAliasLength": 24
}
```

`POST /api/player-session` accepts an optional `alias` string or `null`.
Empty aliases clear to `null`. E-mail, phone-like values, URLs, control
characters and aliases longer than 24 characters are rejected.

The API never returns `session_hash`, the raw cookie value, service role keys or
internal database details.

## Remote Verification

- Project ref: `fkiuecyohcyjwygedncx`.
- `npx supabase db push --dry-run` reported the remote database up to date after
  apply.
- `supabase_migrations.schema_migrations` contains version `20260608154425`.
- Read-only catalog checks confirmed both tables, RLS enabled, expected
  constraints and indexes, no public policies and zero seed rows.

## Next Phase

R1-E.12.5 should persist scores after the session foundation. The expected
implementation order is:

1. Reuse `/api/player-session` to guarantee `arcade_sessions` exists.
2. Write validated score contract v2 payloads to `arcade_scores`.
3. Keep service role access server-side only.
4. Return sanitized score submit DTOs without `session_hash`.
