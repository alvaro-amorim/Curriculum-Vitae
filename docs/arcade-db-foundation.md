# Arcade DB Foundation

R1-E.12.2 prepared the database foundation draft for the Developer Arcade.
R1-E.12.3 applied that migration to the Supabase remote project.
R1-E.12.4 adds the server-side anonymous player session that writes only to
`arcade_sessions`.
R1-E.12.5 persists validated Score Contract v2 submissions to `arcade_scores`.
R1-E.12.6 adds sanitized leaderboard read APIs and Lab UI cards.
R1-E.12.7A adds defensive grant hygiene for public Supabase roles.

## Scope

- Project ref expected: `fkiuecyohcyjwygedncx`.
- Applied migration: `supabase/migrations/20260608154425_arcade_scores_foundation.sql`.
- Applied grant hygiene migration: `supabase/migrations/20260609192453_arcade_public_role_grants_hygiene.sql`.
- Runtime status: `/api/score` writes to Supabase through a server-side Route Handler.
- Server-side Supabase client: `src/lib/supabase/server.ts`.
- Anonymous session API: `/api/player-session`.
- Leaderboard APIs: `/api/leaderboard` and `/api/leaderboard/me`.
- Remote tables created: `arcade_sessions` and `arcade_scores`.
- No public policy, bucket, Auth or Admin feature is created in this phase.

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
- Direct table privileges are revoked from `anon` and `authenticated`.
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

## Persistent Score API

`POST /api/score` validates Score Contract v2, ensures the anonymous Arcade
session exists, inserts one row into `arcade_scores` and returns a sanitized DTO:

```json
{
  "accepted": true,
  "contractVersion": "v2",
  "game": "runtime",
  "mode": "persistent",
  "score": 80
}
```

The response does not include `session_hash`, raw cookie values, database ids,
service role keys or metadata internals. Invalid v1 payloads, legacy ids and
wrong metadata still return validation errors.

## Leaderboard APIs

`GET /api/leaderboard` reads top scores through the server-side Supabase client.
Supported query params:

- `game`: `runtime`, `bug-maze`, `code-snake` or `stack-tetris`.
- `period`: `all`, `month` or `week`.
- `limit`: defaults to `10` and is capped at `50`.

The public DTO returns only:

```json
{
  "game": "runtime",
  "period": "all",
  "leaderboard": [
    {
      "alias": "Anonymous Dev",
      "score": 80,
      "createdAt": "2026-06-09T00:00:00.000Z"
    }
  ]
}
```

`GET /api/leaderboard/me` resolves the current anonymous cookie server-side and
returns alias plus all-time ranking per game. It never returns `session_hash`,
raw cookie values or internal database ids.

## Remote Verification

- Project ref: `fkiuecyohcyjwygedncx`.
- `npx supabase db push --dry-run` reported the remote database up to date after
  apply.
- `supabase_migrations.schema_migrations` contains version `20260608154425`.
- Read-only catalog checks confirmed both tables, RLS enabled, expected
  constraints and indexes, no public policies and zero seed rows.

## Next Phase

After R1-E.12.7A security/config hygiene, R1-E.12.7 should focus on game balance and leaderboard QA using real score data.
Recommended scope:

1. Validate ranking UX on real mobile sizes.
2. Review score distribution by game.
3. Add any needed anti-abuse throttling in a dedicated phase.
4. Keep public browser access behind Route Handlers, not direct Supabase client reads.
